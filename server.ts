import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import JSZip from 'jszip';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.text({ type: ['text/csv', 'text/plain'], limit: '10mb' }));

  // Initialize GoogleGenAI server-side client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  /**
   * Health & config check
   */
  app.get('/api/gemini/status', (req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      status: 'ok',
      hasApiKey: hasKey,
      model: 'gemini-3.8-flash',
    });
  });

  /**
   * Single product volumetric classification
   * Recommends Class 1-4 based on dimensions, weight, physical volume, and packaging limits
   */
  app.post('/api/gemini/classify-product', async (req, res) => {
    try {
      const { name, reference, width, height, depth, weight, category, description } = req.body;

      if (!name || width === undefined || height === undefined || depth === undefined || weight === undefined) {
        return res.status(400).json({
          error: 'Missing required product parameters: name, width, height, depth, and weight are required.'
        });
      }

      const w = Number(width);
      const h = Number(height);
      const d = Number(depth);
      const wt = Number(weight);
      const volumeM3 = Number(((w * h * d) / 1000000).toFixed(4));
      const dimWeightKg = Number(((w * h * d) / 5000).toFixed(2));

      // Check if API key is provided
      if (!process.env.GEMINI_API_KEY) {
        // Fallback volumetric heuristic algorithm
        let fallbackClass = 1;
        let reason = '';
        if (wt >= 40 || volumeM3 >= 0.8 || Math.max(w, h, d) >= 200) {
          fallbackClass = 4;
          reason = `Weight (${wt}kg) or volume (${volumeM3}m³) exceeds Class 4 bulky freight thresholds.`;
        } else if (wt >= 15 || volumeM3 >= 0.25) {
          fallbackClass = 3;
          reason = `Weight (${wt}kg) and volume (${volumeM3}m³) qualify as Class 3 medium furniture.`;
        } else if (wt >= 3 || volumeM3 >= 0.05) {
          fallbackClass = 2;
          reason = `Weight (${wt}kg) and volume (${volumeM3}m³) qualify as Class 2 small furniture parcel.`;
        } else {
          fallbackClass = 1;
          reason = `Compact dimensions and lightweight (${wt}kg, ${volumeM3}m³) qualify as Class 1 small decor.`;
        }

        return res.json({
          success: true,
          source: 'heuristic_fallback',
          data: {
            id_class: fallbackClass,
            class_name: fallbackClass === 1 ? 'Class 1: Small Decor' : fallbackClass === 2 ? 'Class 2: Small Furniture' : fallbackClass === 3 ? 'Class 3: Medium Furniture' : 'Class 4: Bulky / Sofas',
            confidence_score: 90,
            reasoning: reason,
            dimensional_weight_kg: dimWeightKg,
            volume_m3: volumeM3,
            handling_tags: fallbackClass >= 3 ? ['heavy', 'two_person_lift'] : ['standard_parcel'],
            absorption_perks: fallbackClass >= 3 ? 'Acts as Cart Leader that absorbs smaller items for free' : 'Eligible for 100% Free Shipping Absorption under bulky leaders',
          }
        });
      }

      const prompt = `You are an expert logistics and volumetric freight engineer for PrestaShop e-commerce fulfillment.
Classify the following product into one of the 4 standard volumetric shipping classes based on its dimensions, weight, physical volume, and courier freight handling specifications:

Product Specifications:
- Name: ${name}
- Reference / SKU: ${reference || 'N/A'}
- Dimensions (cm): ${w} cm (Width) x ${h} cm (Height) x ${d} cm (Depth)
- Physical Volume: ${volumeM3} m³
- Actual Weight: ${wt} kg
- Standard Dimensional Weight (cm³/5000): ${dimWeightKg} kg
- Category / Notes: ${category || description || 'Home Goods / Furniture / Decor'}

Classification Rules:
- Class 1: Small Decor & Accessories
  - Characteristics: Cushions, candles, tableware, vases, small textiles, compact accessories.
  - Typical Thresholds: Actual weight < 3.0 kg, Volume < 0.05 m³. Can be easily packed into standard mailer or small carton. Absorbed 100% free by Class 3 & 4 leaders.
  - Base shipping fee: €5.00.

- Class 2: Small Furniture & Lighting
  - Characteristics: Bedside tables, floor lamps, wall mirrors, small poufs, desk lamps, bar stools.
  - Typical Thresholds: Actual weight 3.0 kg to 15.0 kg, Volume 0.05 m³ to 0.25 m³. Standard courier parcel, manageable by single carrier courier. Absorbed 100% free by Class 4 leaders.
  - Base shipping fee: €15.00.

- Class 3: Medium Furniture
  - Characteristics: Dining chairs, armchairs, small desks, coffee tables, chest of drawers, benches.
  - Typical Thresholds: Actual weight 15.0 kg to 40.0 kg, Volume 0.25 m³ to 0.80 m³. Two-man lift or bulky parcel courier handling. Acts as Cart Leader that absorbs Class 1 decor items.
  - Base shipping fee: €35.00.

- Class 4: Bulky Furniture & Sofas
  - Characteristics: 2-3 seater sofas, sectionals, large dining tables, wardrobes, king/queen bedframes, large credenzas.
  - Typical Thresholds: Actual weight >= 40.0 kg OR Volume >= 0.80 m³, or any single dimension exceeding 200 cm requiring freight pallet / tail-lift delivery. Acts as Top Cart Leader that absorbs both Class 1 and Class 2 items.
  - Base shipping fee: €79.00.

Analyze the dimensions, actual weight, and physical volume carefully. Return the recommended class ID (1, 2, 3, or 4), a confidence score between 50 and 100, a clear technical explanation justifying the classification, and freight handling tags.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an automated logistics classification engine. Always evaluate dimensional weight, volumetric cubic meters, and physical handling limits to assign volumetric shipping classes 1-4 with precision.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id_class: {
                type: Type.INTEGER,
                description: 'The suggested volumetric class ID (1, 2, 3, or 4)',
              },
              class_name: {
                type: Type.STRING,
                description: 'The human-readable name of the volumetric class',
              },
              confidence_score: {
                type: Type.NUMBER,
                description: 'Confidence percentage from 50 to 100',
              },
              reasoning: {
                type: Type.STRING,
                description: 'Logistics explanation detailing how weight, volume, and dimensions determine the class',
              },
              dimensional_weight_kg: {
                type: Type.NUMBER,
                description: 'Calculated dimensional weight in kg',
              },
              handling_tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Handling tags, e.g. ["parcel", "pallet", "fragile", "two_person_lift"]',
              },
              absorption_perks: {
                type: Type.STRING,
                description: 'Summary of volume absorption capability or eligibility in cart matrix',
              }
            },
            required: ['id_class', 'confidence_score', 'reasoning'],
          },
        },
      });

      const text = response.text?.trim() || '{}';
      const result = JSON.parse(text);

      const safeClassId = Math.min(4, Math.max(1, Number(result.id_class) || 1));
      const safeConfidence = Math.min(100, Math.max(50, Math.round(Number(result.confidence_score) || 88)));

      const classNames: Record<number, string> = {
        1: 'Class 1: Small Decor',
        2: 'Class 2: Small Furniture',
        3: 'Class 3: Medium Furniture',
        4: 'Class 4: Bulky / Sofas',
      };

      return res.json({
        success: true,
        source: 'gemini_api',
        data: {
          id_class: safeClassId,
          class_name: result.class_name || classNames[safeClassId],
          confidence_score: safeConfidence,
          reasoning: result.reasoning || `Classified based on ${wt}kg actual weight and ${volumeM3}m³ volume.`,
          dimensional_weight_kg: result.dimensional_weight_kg || dimWeightKg,
          handling_tags: result.handling_tags || (safeClassId >= 3 ? ['two_person_lift', 'freight'] : ['parcel']),
          absorption_perks: result.absorption_perks || (safeClassId >= 3 ? 'Qualifies as Cart Leader to absorb smaller items for free' : 'Eligible for 100% Free Shipping Absorption under bulky leaders'),
          volume_m3: volumeM3,
        }
      });
    } catch (error: any) {
      console.error('Gemini classification error:', error);
      return res.status(500).json({
        error: error?.message || 'Failed to classify product with Gemini API'
      });
    }
  });

  /**
   * Batch product volumetric classification
   */
  app.post('/api/gemini/classify-batch', async (req, res) => {
    try {
      const { products } = req.body;
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'Array of products is required' });
      }

      const batch = products.slice(0, 15);

      if (!process.env.GEMINI_API_KEY) {
        // Deterministic fallback
        const results = batch.map(p => {
          const w = Number(p.width) || 10;
          const h = Number(p.height) || 10;
          const d = Number(p.depth) || 10;
          const wt = Number(p.weight) || 1;
          const vol = Number(((w * h * d) / 1000000).toFixed(4));
          let c = 1;
          if (wt >= 40 || vol >= 0.8) c = 4;
          else if (wt >= 15 || vol >= 0.25) c = 3;
          else if (wt >= 3 || vol >= 0.05) c = 2;
          return {
            id: p.id_product || p.id,
            id_class: c,
            confidence_score: 92,
            reasoning: `Rule-based classification: ${wt}kg weight and ${vol}m³ physical volume.`,
          };
        });

        return res.json({
          success: true,
          source: 'heuristic_fallback',
          results,
        });
      }

      const prompt = `You are a logistics and freight classification engine for PrestaShop.
Classify each of the following products into one of the 4 volumetric shipping classes:
- Class 1: Small Decor (< 3kg, < 0.05 m³, cushions, candles, tableware)
- Class 2: Small Furniture (3-15kg, 0.05-0.25 m³, bedside tables, floor lamps, mirrors)
- Class 3: Medium Furniture (15-40kg, 0.25-0.80 m³, dining chairs, desks, armchairs)
- Class 4: Bulky / Sofas (>= 40kg or >= 0.80 m³ or length > 200cm, sofas, dining tables, wardrobes)

Products to classify:
${JSON.stringify(batch.map(p => ({
  id: p.id_product || p.id,
  name: p.name,
  reference: p.reference,
  width_cm: p.width,
  height_cm: p.height,
  depth_cm: p.depth,
  weight_kg: p.weight,
  volume_m3: Number(((p.width * p.height * p.depth) / 1000000).toFixed(4)),
})), null, 2)}

Return a classification for each item with its id, id_class (1-4), confidence_score (50-100), and short reasoning.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an automated logistics classification engine. Return structured JSON classifications for all provided products.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                id_class: { type: Type.INTEGER },
                confidence_score: { type: Type.NUMBER },
                reasoning: { type: Type.STRING },
              },
              required: ['id', 'id_class', 'confidence_score', 'reasoning'],
            },
          },
        },
      });

      const text = response.text?.trim() || '[]';
      const results = JSON.parse(text);

      return res.json({
        success: true,
        source: 'gemini_api',
        results,
      });
    } catch (error: any) {
      console.error('Gemini batch classification error:', error);
      return res.status(500).json({
        error: error?.message || 'Failed to batch classify products with Gemini API'
      });
    }
  });

  /**
   * PrestaShop Admin: Download Sample CSV Template
   */
  app.get('/api/admin/csv-template', (req, res) => {
    const csvContent = 
`\uFEFFid_product,reference,id_class,confidence_score,ai_notes,is_approved
101,SOFA-STK-01,4,98,"Heavy 3-seater sofa freight pallet leader",1
102,TBL-OAK-88,4,95,"Extendable dining table Class 4 bulky leader",1
103,CHR-WLN-09,3,91,"Armchair Class 3 medium furniture cart leader",1
104,LMP-GLZ-22,2,87,"Floor standing lamp Class 2 small furniture parcel",1
105,TBL-BED-14,2,89,"Bedside table Class 2 small furniture parcel",1
106,PIL-LIN-02,1,99,"Linen pillow cushions Class 1 small decor absorbable",1
107,CND-CDR-01,1,98,"Scented candle accessory Class 1 small decor",1
`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="smartshipping_bulk_volumetric_template.csv"');
    res.status(200).send(csvContent);
  });

  /**
   * PrestaShop Admin: Bulk CSV Parse and Validation
   */
  app.post('/api/admin/bulk-upload-csv', (req, res) => {
    try {
      let rawCsv = '';
      let autoApprove = true;

      if (typeof req.body === 'string') {
        rawCsv = req.body;
      } else if (req.body && typeof req.body.csvContent === 'string') {
        rawCsv = req.body.csvContent;
        if (typeof req.body.autoApprove === 'boolean') {
          autoApprove = req.body.autoApprove;
        }
      }

      if (!rawCsv || !rawCsv.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Empty CSV content received. Please select or paste a valid CSV.',
        });
      }

      // Remove BOM if present
      const cleanContent = rawCsv.replace(/^\uFEFF/, '').trim();
      const lines = (cleanContent.includes('\n') ? cleanContent.split(/\r?\n/) : cleanContent.split(/\\n/))
        .map(l => l.trim())
        .filter(l => l.length > 0);

      if (lines.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'CSV must contain at least a header line and one data row.',
        });
      }

      // Auto-detect delimiter
      const firstLine = lines[0];
      let delimiter = ',';
      const countSemi = (firstLine.match(/;/g) || []).length;
      const countComma = (firstLine.match(/,/g) || []).length;
      const countTab = (firstLine.match(/\t/g) || []).length;

      if (countSemi > countComma) {
        delimiter = ';';
      } else if (countTab > countComma) {
        delimiter = '\t';
      }

      // Split line considering quotes
      const parseCsvLine = (line: string, delim: string): string[] => {
        const regex = new RegExp(`(?:^|${delim})(?:"([^"]*(?:""[^"]*)*)"|([^"${delim}]*))`, 'g');
        const fields: string[] = [];
        let match;
        while ((match = regex.exec(line)) !== null) {
          let field = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
          fields.push((field || '').trim());
          if (regex.lastIndex >= line.length && line.endsWith(delim)) {
            fields.push('');
            break;
          }
        }
        return fields;
      };

      const headers = parseCsvLine(lines[0], delimiter).map(h => h.toLowerCase().trim());

      let idxId = -1;
      let idxRef = -1;
      let idxClass = -1;
      let idxConf = -1;
      let idxNotes = -1;
      let idxAppr = -1;

      headers.forEach((h, i) => {
        if (['id_product', 'product_id', 'id'].includes(h)) idxId = i;
        else if (['reference', 'ref', 'sku', 'product_ref'].includes(h)) idxRef = i;
        else if (['id_class', 'class', 'class_id', 'volumetric_class'].includes(h)) idxClass = i;
        else if (['confidence_score', 'confidence', 'ai_confidence', 'score'].includes(h)) idxConf = i;
        else if (['ai_notes', 'notes', 'reasoning', 'comment'].includes(h)) idxNotes = i;
        else if (['is_approved', 'approved', 'status'].includes(h)) idxAppr = i;
      });

      if (idxClass === -1) {
        return res.status(400).json({
          success: false,
          error: 'Required column "id_class" (1-4) is missing in CSV header.',
        });
      }

      if (idxId === -1 && idxRef === -1) {
        return res.status(400).json({
          success: false,
          error: 'CSV must contain at least "id_product" or "reference" (SKU) to map products.',
        });
      }

      const parsedRows: Array<{
        id_product?: number;
        reference?: string;
        id_class: number;
        confidence_score: number;
        ai_notes: string;
        is_approved: boolean;
        line: number;
      }> = [];

      const errors: string[] = [];
      let skippedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i];
        if (!rawLine.trim()) continue;
        const row = parseCsvLine(rawLine, delimiter);

        const idProduct = idxId !== -1 && row[idxId] ? parseInt(row[idxId], 10) : undefined;
        const reference = idxRef !== -1 && row[idxRef] ? row[idxRef] : undefined;

        if (!idProduct && !reference) {
          skippedCount++;
          if (errors.length < 8) errors.push(`Line ${i + 1}: Missing both product ID and SKU.`);
          continue;
        }

        const rawClass = idxClass !== -1 ? row[idxClass] : '';
        const idClass = parseInt(rawClass, 10);
        if (isNaN(idClass) || idClass < 1 || idClass > 4) {
          skippedCount++;
          if (errors.length < 8) errors.push(`Line ${i + 1}: Invalid class "${rawClass}". Allowed classes are 1, 2, 3, or 4.`);
          continue;
        }

        let confidence = 100;
        if (idxConf !== -1 && row[idxConf]) {
          const parsedConf = parseFloat(row[idxConf]);
          if (!isNaN(parsedConf)) {
            confidence = Math.max(0, Math.min(100, parsedConf));
          }
        }

        const notes = (idxNotes !== -1 && row[idxNotes]) ? row[idxNotes] : 'Bulk CSV manual assignment';

        let isApproved = autoApprove;
        if (idxAppr !== -1 && row[idxAppr]) {
          const apprVal = row[idxAppr].toLowerCase().trim();
          isApproved = ['1', 'true', 'yes', 'approved'].includes(apprVal);
        }

        parsedRows.push({
          id_product: idProduct && !isNaN(idProduct) ? idProduct : undefined,
          reference: reference || '',
          id_class: idClass,
          confidence_score: confidence,
          ai_notes: notes,
          is_approved: isApproved,
          line: i + 1,
        });
      }

      return res.json({
        success: parsedRows.length > 0,
        total: lines.length - 1,
        processed: parsedRows.length,
        skipped: skippedCount,
        errors,
        rows: parsedRows,
        message: `Successfully processed ${parsedRows.length} product volumetric class assignments from CSV.`,
      });
    } catch (err: any) {
      console.error('CSV upload error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Failed to parse CSV file.',
      });
    }
  });

  // In-memory catalog database for PrestaShop volumetric class assignments
  interface ServerCatalogCombination {
    id_product_attribute: number;
    attribute_name: string;
    reference: string;
    width: number;
    height: number;
    depth: number;
    weight: number;
    volume_m3: number;
    id_class: number;
    confidence_score: number | null;
    ai_notes?: string;
    is_approved: boolean;
  }

  interface ServerCatalogProduct {
    id_smartshipping_product: number;
    id_product: number;
    name: string;
    reference: string;
    imageEmoji: string;
    width: number;
    height: number;
    depth: number;
    weight: number;
    volume_m3: number;
    id_class: number;
    confidence_score: number | null;
    ai_notes?: string;
    handling_tags?: string[];
    is_approved: boolean;
    date_upd: string;
    combinations?: ServerCatalogCombination[];
  }

  let catalogDb: ServerCatalogProduct[] = [
    {
      id_smartshipping_product: 1,
      id_product: 101,
      name: 'Stockholm 3-Seater Velvet Sofa',
      reference: 'SOFA-STK-01',
      imageEmoji: '🛋️',
      width: 220,
      height: 85,
      depth: 95,
      weight: 68.5,
      volume_m3: 1.776,
      id_class: 4,
      confidence_score: 98,
      ai_notes: 'Exceeds Class 4 bulky threshold: weight 68.5kg (>40kg) and volume 1.78m³ (>0.8m³). Acts as Top Cart Leader.',
      handling_tags: ['two_person_lift', 'pallet_freight', 'oversized'],
      is_approved: true,
      date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
      combinations: [
        {
          id_product_attribute: 1011,
          attribute_name: '2-Seater Loveseat Module (Navy)',
          reference: 'SOFA-STK-01-2S',
          width: 140,
          height: 85,
          depth: 95,
          weight: 38.0,
          volume_m3: 1.130,
          id_class: 3,
          confidence_score: 94,
          ai_notes: 'Weight 38kg (<40kg) and compact length (140cm) place this module into Class 3 Medium Furniture.',
          is_approved: true,
        },
        {
          id_product_attribute: 1012,
          attribute_name: '3-Seater Standard (Navy)',
          reference: 'SOFA-STK-01-3S',
          width: 220,
          height: 85,
          depth: 95,
          weight: 68.5,
          volume_m3: 1.776,
          id_class: 4,
          confidence_score: 98,
          ai_notes: 'Exceeds 40kg and 0.8m³ limit. Top Cart Leader freight.',
          is_approved: true,
        },
        {
          id_product_attribute: 1013,
          attribute_name: '3-Seater with Chaise Longue (Grey)',
          reference: 'SOFA-STK-01-CH',
          width: 280,
          height: 85,
          depth: 160,
          weight: 92.0,
          volume_m3: 3.808,
          id_class: 4,
          confidence_score: 99,
          ai_notes: 'Massive volumetric profile (3.81m³, 92kg). Heavy freight pallet leader.',
          is_approved: true,
        },
      ],
    },
    {
      id_smartshipping_product: 2,
      id_product: 102,
      name: 'Solid Oak Extendable Dining Table',
      reference: 'TBL-OAK-88',
      imageEmoji: '🪵',
      width: 180,
      height: 76,
      depth: 90,
      weight: 54.0,
      volume_m3: 1.231,
      id_class: 4,
      confidence_score: 95,
      ai_notes: 'Weight 54kg exceeds 40kg limit and physical volume 1.23m³ requires freight pallet handling.',
      handling_tags: ['two_person_lift', 'freight'],
      is_approved: false,
      date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
      combinations: [
        {
          id_product_attribute: 1021,
          attribute_name: 'Compact 4-Person Fixed (140x80cm)',
          reference: 'TBL-OAK-88-S4',
          width: 140,
          height: 76,
          depth: 80,
          weight: 36.0,
          volume_m3: 0.851,
          id_class: 3,
          confidence_score: 93,
          ai_notes: 'Under 40kg limit. Medium Furniture courier class.',
          is_approved: true,
        },
        {
          id_product_attribute: 1022,
          attribute_name: 'Extendable 8-10 Person (240x95cm)',
          reference: 'TBL-OAK-88-L10',
          width: 240,
          height: 76,
          depth: 95,
          weight: 64.0,
          volume_m3: 1.733,
          id_class: 4,
          confidence_score: 97,
          ai_notes: 'Heavy solid oak 64kg requiring pallet freight transport.',
          is_approved: false,
        },
      ],
    },
    {
      id_smartshipping_product: 3,
      id_product: 103,
      name: 'Nordic Curved Oak Dining Chair',
      reference: 'CHR-NRD-12',
      imageEmoji: '🪑',
      width: 58,
      height: 84,
      depth: 55,
      weight: 7.2,
      volume_m3: 0.268,
      id_class: 3,
      confidence_score: 92,
      ai_notes: 'Volume 0.268m³ exceeds Class 2 parcel limits (>0.25m³). Acts as Cart Leader absorbing Class 1 items.',
      handling_tags: ['two_person_lift'],
      is_approved: true,
      date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
    },
    {
      id_smartshipping_product: 4,
      id_product: 104,
      name: 'Handmade Glazed Ceramic Lamp',
      reference: 'LMP-GLZ-22',
      imageEmoji: '💡',
      width: 32,
      height: 55,
      depth: 32,
      weight: 4.2,
      volume_m3: 0.056,
      id_class: 2,
      confidence_score: 87,
      ai_notes: 'Standard parcel box (32x32x55cm, 4.2kg). Fragile handling required. Absorbed 100% free by Class 4 bulky leader.',
      handling_tags: ['fragile'],
      is_approved: true,
      date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
    },
    {
      id_smartshipping_product: 5,
      id_product: 105,
      name: 'Industrial Metal Bedside Stool',
      reference: 'TBL-BED-14',
      imageEmoji: '🗄️',
      width: 42,
      height: 48,
      depth: 40,
      weight: 6.5,
      volume_m3: 0.081,
      id_class: 2,
      confidence_score: 89,
      ai_notes: 'Compact side table within parcel courier limits. Free shipping absorption eligible under Class 4 leaders.',
      handling_tags: ['standard_parcel'],
      is_approved: false,
      date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
    },
    {
      id_smartshipping_product: 6,
      id_product: 106,
      name: 'Organic Linen Throw Pillow (Set of 2)',
      reference: 'PIL-LIN-02',
      imageEmoji: '✨',
      width: 45,
      height: 15,
      depth: 45,
      weight: 0.8,
      volume_m3: 0.030,
      id_class: 1,
      confidence_score: 99,
      ai_notes: 'Lightweight decor (<3kg, <0.05m³). Absorbed 100% FREE in cart alongside any Class 3 or 4 furniture leader.',
      handling_tags: ['standard_parcel'],
      is_approved: true,
      date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
    },
    {
      id_smartshipping_product: 7,
      id_product: 107,
      name: 'Aroma Cedar Scented Candle',
      reference: 'CND-CDR-01',
      imageEmoji: '🕯️',
      width: 10,
      height: 12,
      depth: 10,
      weight: 0.45,
      volume_m3: 0.001,
      id_class: 1,
      confidence_score: 98,
      ai_notes: 'Small accessory. 100% free absorption buffer. Perfect AOV booster item.',
      handling_tags: ['standard_parcel'],
      is_approved: true,
      date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
    },
    {
      id_smartshipping_product: 8,
      id_product: 108,
      name: 'Scandinavian Modular Sideboard Credenza',
      reference: 'CRD-SCN-45',
      imageEmoji: '🗄️',
      width: 160,
      height: 75,
      depth: 45,
      weight: 42.0,
      volume_m3: 0.540,
      id_class: 4,
      confidence_score: 96,
      ai_notes: 'Weight 42kg (>40kg threshold). Class 4 bulky furniture leader.',
      handling_tags: ['two_person_lift', 'freight'],
      is_approved: true,
      date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
    },
  ];

  /**
   * Get current catalog products and class associations
   */
  app.get('/api/admin/products', (req, res) => {
    return res.json({
      success: true,
      count: catalogDb.length,
      products: catalogDb,
    });
  });

  /**
   * Export all current volumetric class assignments as a live CSV file
   */
  app.get('/api/admin/export-assignments-csv', (req, res) => {
    const classNames: Record<number, string> = {
      1: 'Class 1: Small Decor (€5.00)',
      2: 'Class 2: Small Furniture (€15.00)',
      3: 'Class 3: Medium Furniture (€35.00)',
      4: 'Class 4: Bulky / Sofas (€79.00)',
    };

    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r') || str.includes(';')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'id_product',
      'id_product_attribute',
      'reference',
      'name',
      'width_cm',
      'height_cm',
      'depth_cm',
      'weight_kg',
      'volume_m3',
      'id_class',
      'class_name',
      'confidence_score',
      'ai_notes',
      'is_approved',
      'date_upd',
    ];

    const lines: string[] = [headers.join(',')];

    catalogDb.forEach(p => {
      // Main product row
      lines.push([
        p.id_product,
        0,
        escapeCsv(p.reference),
        escapeCsv(p.name),
        p.width,
        p.height,
        p.depth,
        p.weight,
        p.volume_m3,
        p.id_class,
        escapeCsv(classNames[p.id_class] || `Class ${p.id_class}`),
        p.confidence_score ?? 100,
        escapeCsv(p.ai_notes || ''),
        p.is_approved ? 1 : 0,
        escapeCsv(p.date_upd),
      ].join(','));

      // Combination variant rows
      if (Array.isArray(p.combinations) && p.combinations.length > 0) {
        p.combinations.forEach(combo => {
          lines.push([
            p.id_product,
            combo.id_product_attribute,
            escapeCsv(combo.reference),
            escapeCsv(`${p.name} - ${combo.attribute_name}`),
            combo.width,
            combo.height,
            combo.depth,
            combo.weight,
            combo.volume_m3,
            combo.id_class,
            escapeCsv(classNames[combo.id_class] || `Class ${combo.id_class}`),
            combo.confidence_score ?? 100,
            escapeCsv(combo.ai_notes || ''),
            combo.is_approved ? 1 : 0,
            escapeCsv(p.date_upd),
          ].join(','));
        });
      }
    });

    const csvContent = '\uFEFF' + lines.join('\r\n') + '\r\n';
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="smartshipping_volumetric_assignments_${dateStr}.csv"`);
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.status(200).send(csvContent);
  });

  /**
   * Bulk-update product volumetric class associations in the database
   */
  app.post('/api/admin/bulk-update-catalog', (req, res) => {
    try {
      let rowsToProcess: Array<{
        id_product?: number;
        id_product_attribute?: number;
        reference?: string;
        id_class: number;
        confidence_score?: number;
        ai_notes?: string;
        is_approved?: boolean;
      }> = [];

      let autoApprove = true;

      if (Array.isArray(req.body.rows)) {
        rowsToProcess = req.body.rows;
        if (typeof req.body.autoApprove === 'boolean') {
          autoApprove = req.body.autoApprove;
        }
      } else {
        // Fallback: parse raw CSV text from req.body or req.body.csvContent
        let rawCsv = '';
        if (typeof req.body === 'string') {
          rawCsv = req.body;
        } else if (req.body && typeof req.body.csvContent === 'string') {
          rawCsv = req.body.csvContent;
          if (typeof req.body.autoApprove === 'boolean') {
            autoApprove = req.body.autoApprove;
          }
        }

        if (!rawCsv || !rawCsv.trim()) {
          return res.status(400).json({
            success: false,
            error: 'No product rows or CSV content provided for bulk update.',
          });
        }

        const cleanContent = rawCsv.replace(/^\uFEFF/, '').trim();
        const lines = (cleanContent.includes('\n') ? cleanContent.split(/\r?\n/) : cleanContent.split(/\\n/))
          .map(l => l.trim())
          .filter(l => l.length > 0);
        if (lines.length < 2) {
          return res.status(400).json({
            success: false,
            error: 'CSV must contain at least a header line and one data row.',
          });
        }

        const firstLine = lines[0];
        let delimiter = ',';
        if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = ';';
        else if ((firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = '\t';

        const parseCsvLine = (line: string, delim: string): string[] => {
          const regex = new RegExp(`(?:^|${delim})(?:"([^"]*(?:""[^"]*)*)"|([^"${delim}]*))`, 'g');
          const fields: string[] = [];
          let match;
          while ((match = regex.exec(line)) !== null) {
            let field = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
            fields.push((field || '').trim());
            if (regex.lastIndex >= line.length && line.endsWith(delim)) {
              fields.push('');
              break;
            }
          }
          return fields;
        };

        const headers = parseCsvLine(lines[0], delimiter).map(h => h.toLowerCase().trim());
        let idxId = -1;
        let idxAttr = -1;
        let idxRef = -1;
        let idxClass = -1;
        let idxConf = -1;
        let idxNotes = -1;
        let idxAppr = -1;

        headers.forEach((h, i) => {
          if (['id_product', 'product_id', 'id'].includes(h)) idxId = i;
          else if (['id_product_attribute', 'id_attribute', 'attribute_id'].includes(h)) idxAttr = i;
          else if (['reference', 'ref', 'sku', 'product_ref'].includes(h)) idxRef = i;
          else if (['id_class', 'class', 'class_id', 'volumetric_class'].includes(h)) idxClass = i;
          else if (['confidence_score', 'confidence', 'ai_confidence', 'score'].includes(h)) idxConf = i;
          else if (['ai_notes', 'notes', 'reasoning', 'comment'].includes(h)) idxNotes = i;
          else if (['is_approved', 'approved', 'status'].includes(h)) idxAppr = i;
        });

        if (idxClass === -1) {
          return res.status(400).json({ success: false, error: 'Column "id_class" (1-4) is missing.' });
        }

        for (let i = 1; i < lines.length; i++) {
          const row = parseCsvLine(lines[i], delimiter);
          const idProduct = idxId !== -1 && row[idxId] ? parseInt(row[idxId], 10) : undefined;
          const idAttr = idxAttr !== -1 && row[idxAttr] ? parseInt(row[idxAttr], 10) : undefined;
          const ref = idxRef !== -1 && row[idxRef] ? row[idxRef] : undefined;
          const idClass = idxClass !== -1 ? parseInt(row[idxClass], 10) : 0;
          if (isNaN(idClass) || idClass < 1 || idClass > 4) continue;

          let conf = 100;
          if (idxConf !== -1 && row[idxConf]) {
            const pConf = parseFloat(row[idxConf]);
            if (!isNaN(pConf)) conf = Math.max(0, Math.min(100, pConf));
          }

          const notes = idxNotes !== -1 && row[idxNotes] ? row[idxNotes] : 'Bulk CSV manual assignment';
          let isAppr = autoApprove;
          if (idxAppr !== -1 && row[idxAppr]) {
            isAppr = ['1', 'true', 'yes', 'approved'].includes(row[idxAppr].toLowerCase().trim());
          }

          rowsToProcess.push({
            id_product: idProduct,
            id_product_attribute: idAttr,
            reference: ref,
            id_class: idClass,
            confidence_score: conf,
            ai_notes: notes,
            is_approved: isAppr,
          });
        }
      }

      if (rowsToProcess.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid product rows found to update.',
        });
      }

      let updatedCount = 0;
      let insertedCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

      rowsToProcess.forEach((row, idx) => {
        const idClass = Number(row.id_class);
        if (isNaN(idClass) || idClass < 1 || idClass > 4) {
          skippedCount++;
          if (errors.length < 5) errors.push(`Row ${idx + 1}: Invalid class ${row.id_class}. Must be 1 to 4.`);
          return;
        }

        const idProduct = row.id_product;
        const idAttr = row.id_product_attribute;
        const ref = row.reference?.trim() || '';

        if (!idProduct && !ref) {
          skippedCount++;
          if (errors.length < 5) errors.push(`Row ${idx + 1}: Missing both product ID and SKU reference.`);
          return;
        }

        // Try to match combination first if id_product_attribute or combo ref is provided
        let matchedCombo = false;
        if (idAttr || ref) {
          for (const p of catalogDb) {
            if (p.combinations) {
              const combo = p.combinations.find(c => 
                (idAttr && c.id_product_attribute === idAttr) ||
                (ref && c.reference.toLowerCase() === ref.toLowerCase())
              );
              if (combo) {
                combo.id_class = idClass;
                combo.confidence_score = row.confidence_score ?? 100;
                if (row.ai_notes) combo.ai_notes = row.ai_notes;
                combo.is_approved = row.is_approved ?? true;
                p.date_upd = nowStr;
                matchedCombo = true;
                updatedCount++;
                break;
              }
            }
          }
        }

        if (matchedCombo) return;

        // Match main product
        const prodIndex = catalogDb.findIndex(p =>
          (idProduct && p.id_product === idProduct) ||
          (ref && p.reference.toLowerCase() === ref.toLowerCase())
        );

        if (prodIndex >= 0) {
          // Update existing product in database
          catalogDb[prodIndex] = {
            ...catalogDb[prodIndex],
            id_class: idClass,
            confidence_score: row.confidence_score ?? 100,
            ai_notes: row.ai_notes || catalogDb[prodIndex].ai_notes || 'Bulk CSV updated assignment',
            is_approved: row.is_approved ?? true,
            date_upd: nowStr,
          };
          updatedCount++;
        } else {
          // Newly associate / register product in database
          const nextSmartId = Math.max(...catalogDb.map(p => p.id_smartshipping_product), 0) + 1;
          const nextProdId = idProduct || (Math.max(...catalogDb.map(p => p.id_product), 100) + 1);

          const defaultSpecs = [
            { emoji: '📦', name: 'Imported Decor Item', w: 20, h: 15, d: 10, wt: 0.8 },
            { emoji: '💡', name: 'Imported Accent Item', w: 45, h: 40, d: 35, wt: 4.5 },
            { emoji: '🪑', name: 'Imported Medium Furniture', w: 80, h: 85, d: 75, wt: 18.0 },
            { emoji: '🛋️', name: 'Imported Bulky Freight', w: 210, h: 90, d: 95, wt: 62.0 },
          ];
          const spec = defaultSpecs[idClass - 1] || defaultSpecs[0];

          catalogDb.push({
            id_smartshipping_product: nextSmartId,
            id_product: nextProdId,
            name: `Imported Product (${ref || '#' + nextProdId})`,
            reference: ref || `IMP-${nextProdId}`,
            imageEmoji: spec.emoji,
            width: spec.w,
            height: spec.h,
            depth: spec.d,
            weight: spec.wt,
            volume_m3: parseFloat(((spec.w * spec.h * spec.d) / 1000000).toFixed(4)),
            id_class: idClass,
            confidence_score: row.confidence_score ?? 100,
            ai_notes: row.ai_notes || 'Registered via bulk CSV import',
            handling_tags: idClass === 4 ? ['pallet_freight', 'two_person_lift'] : undefined,
            is_approved: row.is_approved ?? true,
            date_upd: nowStr,
          });
          insertedCount++;
        }
      });

      return res.json({
        success: updatedCount + insertedCount > 0,
        total: rowsToProcess.length,
        processed: updatedCount + insertedCount,
        updated: updatedCount,
        inserted: insertedCount,
        skipped: skippedCount,
        errors,
        catalog: catalogDb,
        message: `Successfully bulk-updated database: ${updatedCount} existing product associations updated, ${insertedCount} newly registered.`,
      });
    } catch (err: any) {
      console.error('Bulk update error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Failed to bulk-update database.',
      });
    }
  });

  // Multi-Zone Matrix in-memory store
  let geoZones = [
    { 
      id_zone: 1, 
      name: 'Continental Mainland (Zone 1)', 
      code: 'MAINLAND', 
      multiplier: 1.00, 
      class4_surcharge: 0.00, 
      class3_surcharge: 0.00, 
      delay: '24-48h Hub Delivery', 
      is_active: true, 
      regions: 'Attica, Central Greece, Macedonia, Thessaly, Peloponnese',
      description: 'Standard overland hub distribution network with fastest transit times.'
    },
    { 
      id_zone: 2, 
      name: 'Regional & Suburban (Zone 2)', 
      code: 'REGIONAL', 
      multiplier: 1.15, 
      class4_surcharge: 12.00, 
      class3_surcharge: 6.00, 
      delay: '2-3 Business Days', 
      is_active: true, 
      regions: 'Epirus, Thrace, Western Greece, Peloponnese rural sectors',
      description: 'Secondary regional freight spokes with mild mileage surcharges.'
    },
    { 
      id_zone: 3, 
      name: 'Insular / Aegean & Ionian (Zone 3)', 
      code: 'ISLANDS', 
      multiplier: 1.40, 
      class4_surcharge: 38.00, 
      class3_surcharge: 16.00, 
      delay: '3-5 Days (Maritime Ferry)', 
      is_active: true, 
      regions: 'Crete, Cyclades, Dodecanese, North Aegean, Ionian Islands',
      description: 'Roll-on/roll-off maritime ferry freight with pallet stabilization surcharge for Class 4.'
    },
    { 
      id_zone: 4, 
      name: 'Remote & Mountainous / Dysprosita (Zone 4)', 
      code: 'REMOTE', 
      multiplier: 1.65, 
      class4_surcharge: 55.00, 
      class3_surcharge: 25.00, 
      delay: '4-7 Days (Courier Transfer)', 
      is_active: true, 
      regions: 'High altitude villages, isolated border zones, minor non-direct ferry isles',
      description: 'Complex multi-carrier relay transfer requiring heavy lift handling.'
    },
  ];

  /**
   * Get all shipping zones
   */
  app.get('/api/admin/zones', (req, res) => {
    res.json({ success: true, zones: geoZones });
  });

  /**
   * Update shipping zones matrix
   */
  app.post('/api/admin/zones', (req, res) => {
    try {
      const { zones } = req.body;
      if (Array.isArray(zones) && zones.length > 0) {
        geoZones = zones;
        return res.json({ 
          success: true, 
          zones: geoZones, 
          message: `Successfully updated ${zones.length} geographic shipping zones.` 
        });
      }
      return res.status(400).json({ success: false, error: 'Invalid zones array payload.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to update zones.' });
    }
  });

  /**
   * Export complete PrestaShop installable module ZIP package
   */
  app.get('/api/module/export-zip', async (req, res) => {
    try {
      const zip = new JSZip();
      const moduleRootDir = path.resolve(__dirname, 'src/modules/smartshippingai');

      async function addDirToZip(currentDir: string, zipFolder: JSZip) {
        const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          if (entry.isDirectory()) {
            const subFolder = zipFolder.folder(entry.name);
            if (subFolder) {
              await addDirToZip(fullPath, subFolder);
            }
          } else if (entry.isFile()) {
            const fileContent = await fs.promises.readFile(fullPath);
            zipFolder.file(entry.name, fileContent);
          }
        }
      }

      const rootFolder = zip.folder('smartshippingai');
      if (!rootFolder) {
        throw new Error('Could not create smartshippingai root directory in zip');
      }

      await addDirToZip(moduleRootDir, rootFolder);

      const buffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="smartshippingai-v1.0.0.zip"');
      res.setHeader('Content-Length', buffer.length);
      return res.send(buffer);
    } catch (err: any) {
      console.error('Failed to generate module zip package:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to generate PrestaShop module zip: ' + (err?.message || 'Unknown error') 
      });
    }
  });

  // In-memory store for Courier Vouchers and Live Webhook Event Stream
  interface CourierVoucher {
    id: string;
    order_id: number;
    courier: 'DHL' | 'ACS' | 'SPEEDEX' | 'GENIKI';
    tracking_number: string;
    recipient_name: string;
    destination_address: string;
    postal_code: string;
    zone_code: string;
    weight_kg: number;
    volume_m3: number;
    volumetric_class: number;
    shipping_fee: number;
    ferry_surcharge: number;
    status: 'CREATED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'EXCEPTION';
    created_at: string;
    events: Array<{
      status: string;
      location: string;
      timestamp: string;
      description: string;
    }>;
  }

  let courierVouchers: CourierVoucher[] = [
    {
      id: 'vouch-1',
      order_id: 1042,
      courier: 'ACS',
      tracking_number: 'ACS-2026884192',
      recipient_name: 'Eleni Papadopoulou',
      destination_address: 'Oia Main Street, Santorini',
      postal_code: '84702',
      zone_code: 'ISLANDS',
      weight_kg: 52.0,
      volume_m3: 1.15,
      volumetric_class: 4,
      shipping_fee: 148.60,
      ferry_surcharge: 38.00,
      status: 'IN_TRANSIT',
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      events: [
        { status: 'CREATED', location: 'Merchant Warehouse Athens', timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), description: 'Voucher electronic data interchange confirmed.' },
        { status: 'PICKED_UP', location: 'Athens Sort Facility', timestamp: new Date(Date.now() - 3600000 * 14).toISOString(), description: 'Pallet cargo loaded onto Piraeus ferry line-haul.' },
        { status: 'IN_TRANSIT', location: 'Piraeus Maritime Port', timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), description: 'En route via Blue Star Ferries cargo vessel.' },
      ],
    },
    {
      id: 'vouch-2',
      order_id: 1043,
      courier: 'DHL',
      tracking_number: 'DHL-994182941',
      recipient_name: 'Dimitris Kazakis',
      destination_address: 'Tsimiski 44, Thessaloniki',
      postal_code: '54623',
      zone_code: 'MAINLAND',
      weight_kg: 8.5,
      volume_m3: 0.12,
      volumetric_class: 2,
      shipping_fee: 15.00,
      ferry_surcharge: 0.00,
      status: 'OUT_FOR_DELIVERY',
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      events: [
        { status: 'CREATED', location: 'Merchant Central Depot', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), description: 'Courier label printed.' },
        { status: 'PICKED_UP', location: 'Thessaloniki Hub', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), description: 'Sorted into local courier van.' },
        { status: 'OUT_FOR_DELIVERY', location: 'Thessaloniki City Center', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), description: 'Driver is en route to delivery address.' },
      ],
    },
  ];

  /**
   * Get all vouchers and webhook logs
   */
  app.get('/api/couriers/vouchers', (req, res) => {
    res.json({
      success: true,
      count: courierVouchers.length,
      vouchers: courierVouchers,
    });
  });

  /**
   * Generate Live Courier Voucher (DHL, ACS, Speedex, Geniki)
   */
  app.post('/api/couriers/generate-voucher', (req, res) => {
    try {
      const {
        order_id,
        courier = 'ACS',
        recipient_name = 'Customer',
        destination_address = 'Default St. 1',
        postal_code = '10431',
        zone_code = 'MAINLAND',
        weight_kg = 5,
        volume_m3 = 0.05,
        volumetric_class = 2,
        shipping_fee = 15,
        ferry_surcharge = 0,
      } = req.body;

      const prefix = courier === 'DHL' ? 'DHL-' : courier === 'ACS' ? 'ACS-' : courier === 'SPEEDEX' ? 'SPDX-' : 'GEN-';
      const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
      const trackingNumber = `${prefix}${randomDigits}`;
      const voucherId = `vouch-${Date.now()}`;

      const newVoucher: CourierVoucher = {
        id: voucherId,
        order_id: Number(order_id) || Math.floor(1000 + Math.random() * 9000),
        courier,
        tracking_number: trackingNumber,
        recipient_name,
        destination_address,
        postal_code,
        zone_code,
        weight_kg: Number(weight_kg),
        volume_m3: Number(volume_m3),
        volumetric_class: Number(volumetric_class),
        shipping_fee: Number(shipping_fee),
        ferry_surcharge: Number(ferry_surcharge),
        status: 'CREATED',
        created_at: new Date().toISOString(),
        events: [
          {
            status: 'CREATED',
            location: 'Merchant Warehouse Athens',
            timestamp: new Date().toISOString(),
            description: `Voucher electronically generated via ${courier} API. Awaiting driver pickup.`,
          },
        ],
      };

      courierVouchers.unshift(newVoucher);

      return res.json({
        success: true,
        voucher: newVoucher,
        message: `Courier voucher ${trackingNumber} created successfully!`,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to generate voucher.' });
    }
  });

  /**
   * Real-time Courier Webhook Callback Endpoint
   * Triggered by courier dispatchers or simulation test
   */
  app.post('/api/couriers/webhook', (req, res) => {
    try {
      const { tracking_number, status, location, description } = req.body;

      if (!tracking_number || !status) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: tracking_number and status are mandatory.',
        });
      }

      const voucher = courierVouchers.find(v => v.tracking_number === tracking_number);

      if (voucher) {
        voucher.status = status;
        voucher.events.push({
          status,
          location: location || 'Transit Node',
          timestamp: new Date().toISOString(),
          description: description || `Tracking status progressed to ${status}.`,
        });
      }

      return res.json({
        success: true,
        tracking_number,
        new_status: status,
        updated_voucher: voucher || null,
        message: `Webhook successfully acknowledged and processed for ${tracking_number}.`,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Webhook processing failed.' });
    }
  });

  /**
   * PrestaShop 1.7 / 8.x WebService Bridge: Test Connection
   */
  app.post('/api/prestashop/test-connection', async (req, res) => {
    try {
      const { shopUrl, apiKey } = req.body;
      if (!shopUrl || !apiKey) {
        return res.status(400).json({
          success: false,
          error: 'Please provide both PrestaShop Shop URL and WebService API Key.',
        });
      }

      // Demo mode support
      if (shopUrl.includes('demo.prestashop.com') || apiKey === 'DEMO_KEY_TEST_MODE_1234567890') {
        return res.json({
          success: true,
          isDemo: true,
          prestashop_version: '1.7.8.9',
          shop_name: 'Demo PrestaShop 1.7 Furniture Store',
          resources: ['products', 'combinations', 'categories', 'carts', 'orders', 'carriers', 'stock_availables'],
          message: 'Connected to PrestaShop 1.7 WebService API in Demonstration Mode.',
          timestamp: new Date().toISOString(),
        });
      }

      const cleanUrl = shopUrl.replace(/\/+$/, '');
      const apiUrl = `${cleanUrl}/api?output_format=JSON`;
      const authHeader = 'Basic ' + Buffer.from(`${apiKey}:`).toString('base64');

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
          'User-Agent': 'SmartShippingAI-PrestaShopBridge/1.0',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return res.status(401).json({
            success: false,
            error: `Authentication failed (HTTP ${response.status}). Verify your WebService Key and check that WebService is enabled under Advanced Parameters > Webservice in PrestaShop.`,
          });
        }
        return res.status(response.status).json({
          success: false,
          error: `PrestaShop returned HTTP status ${response.status}: ${response.statusText}`,
        });
      }

      const data: any = await response.json();
      return res.json({
        success: true,
        message: 'Successfully connected to PrestaShop WebService API!',
        shopUrl: cleanUrl,
        resources: data?.api ? Object.keys(data.api) : [],
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: `Could not reach PrestaShop server: ${err?.message || 'Network error'}. Make sure the URL is accessible and SSL is valid.`,
      });
    }
  });

  /**
   * PrestaShop 1.7 / 8.x WebService Bridge: Fetch Products
   */
  app.post('/api/prestashop/fetch-products', async (req, res) => {
    try {
      const { shopUrl, apiKey, limit = 50 } = req.body;
      if (!shopUrl || !apiKey) {
        return res.status(400).json({
          success: false,
          error: 'Shop URL and WebService Key are required.',
        });
      }

      // Demo mode fallback
      if (shopUrl.includes('demo.prestashop.com') || apiKey === 'DEMO_KEY_TEST_MODE_1234567890') {
        const demoSampleProducts = [
          {
            id_smartshipping_product: 201,
            id_product: 201,
            name: 'Monaco Chesterfield 3-Seater Leather Sofa',
            reference: 'SOFA-MON-01',
            imageEmoji: '🛋️',
            width: 230,
            height: 88,
            depth: 98,
            weight: 72.0,
            volume_m3: 1.983,
            id_class: 4,
            confidence_score: 99,
            ai_notes: 'Heavy bulky freight (72kg, 1.98m³). Top Cart Leader.',
            handling_tags: ['pallet_freight', 'two_person_lift'],
            is_approved: true,
            date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
          },
          {
            id_smartshipping_product: 202,
            id_product: 202,
            name: 'Lyon Solid Beechwood Dining Chair',
            reference: 'CHR-LYN-05',
            imageEmoji: '🪑',
            width: 52,
            height: 86,
            depth: 54,
            weight: 6.8,
            volume_m3: 0.241,
            id_class: 3,
            confidence_score: 93,
            ai_notes: 'Volume 0.24m³. Class 3 Medium Furniture courier rate.',
            handling_tags: ['two_person_lift'],
            is_approved: false,
            date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
          },
          {
            id_smartshipping_product: 203,
            id_product: 203,
            name: 'Artisan Terrazzo Bedside Table Lamp',
            reference: 'LMP-TRZ-08',
            imageEmoji: '💡',
            width: 28,
            height: 48,
            depth: 28,
            weight: 3.8,
            volume_m3: 0.038,
            id_class: 2,
            confidence_score: 88,
            ai_notes: 'Fragile table lamp. Class 2 small furniture. Absorbed 100% free by Class 4 sofa.',
            handling_tags: ['fragile', 'standard_parcel'],
            is_approved: true,
            date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
          },
          {
            id_smartshipping_product: 204,
            id_product: 204,
            name: 'Pure Cotton Woven Throw Blanket',
            reference: 'THR-COT-09',
            imageEmoji: '✨',
            width: 35,
            height: 12,
            depth: 25,
            weight: 1.1,
            volume_m3: 0.011,
            id_class: 1,
            confidence_score: 99,
            ai_notes: 'Lightweight soft home decor (<3kg). 100% Free Absorption.',
            handling_tags: ['fully_absorbable'],
            is_approved: true,
            date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
          },
        ];

        return res.json({
          success: true,
          count: demoSampleProducts.length,
          products: demoSampleProducts,
          isDemo: true,
          message: 'Retrieved 4 live sample products from PrestaShop 1.7 catalog in demonstration mode.',
        });
      }

      const cleanUrl = shopUrl.replace(/\/+$/, '');
      const authHeader = 'Basic ' + Buffer.from(`${apiKey}:`).toString('base64');
      const apiUrl = `${cleanUrl}/api/products?display=[id,reference,name,width,height,depth,weight,active,price]&limit=${Math.min(limit, 200)}&output_format=JSON`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
          'User-Agent': 'SmartShippingAI-PrestaShopBridge/1.0',
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: `PrestaShop error (HTTP ${response.status}): ${response.statusText}`,
        });
      }

      const data: any = await response.json();
      const rawProducts = data?.products || [];
      const list = Array.isArray(rawProducts) ? rawProducts : [rawProducts];

      const formatted = list.filter((p: any) => p && p.id).map((p: any, idx: number) => {
        const id_product = Number(p.id) || idx + 1;
        const width = parseFloat(p.width) || 0;
        const height = parseFloat(p.height) || 0;
        const depth = parseFloat(p.depth) || 0;
        const weight = parseFloat(p.weight) || 0;
        const volume_m3 = Number(((width * height * depth) / 1000000).toFixed(4));
        
        let name = 'PrestaShop Product #' + id_product;
        if (typeof p.name === 'string') {
          name = p.name;
        } else if (Array.isArray(p.name) && p.name[0]?.value) {
          name = p.name[0].value;
        } else if (typeof p.name === 'object' && p.name?.language) {
          const lVal = Array.isArray(p.name.language) ? p.name.language[0]?.value : p.name.language?.value;
          if (lVal) name = lVal;
        }

        const reference = p.reference || `REF-${id_product}`;

        let initialClass = 1;
        let notes = 'Class 1 Small Decor (<3kg, <0.05m³)';
        if (weight >= 40 || volume_m3 >= 0.8) {
          initialClass = 4;
          notes = `Class 4 Bulky Freight: weight ${weight}kg, volume ${volume_m3}m³`;
        } else if (weight >= 15 || volume_m3 >= 0.25) {
          initialClass = 3;
          notes = `Class 3 Medium Furniture: weight ${weight}kg, volume ${volume_m3}m³`;
        } else if (weight >= 3 || volume_m3 >= 0.05) {
          initialClass = 2;
          notes = `Class 2 Small Furniture: weight ${weight}kg, volume ${volume_m3}m³`;
        }

        return {
          id_smartshipping_product: catalogDb.length + idx + 1,
          id_product,
          name,
          reference,
          imageEmoji: initialClass === 4 ? '🛋️' : initialClass === 3 ? '🪑' : initialClass === 2 ? '💡' : '✨',
          width,
          height,
          depth,
          weight,
          volume_m3,
          id_class: initialClass,
          confidence_score: 90,
          ai_notes: notes,
          handling_tags: initialClass === 4 ? ['pallet_freight', 'two_person_lift'] : initialClass === 3 ? ['two_person_lift'] : ['standard_parcel'],
          is_approved: false,
          date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
      });

      return res.json({
        success: true,
        count: formatted.length,
        products: formatted,
        message: `Successfully fetched and formatted ${formatted.length} products from live PrestaShop WebService.`,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: `Failed to fetch products from PrestaShop: ${err?.message || 'Network error'}`,
      });
    }
  });

  // Setup Vite middleware in dev mode or static files in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartShipping AI Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
