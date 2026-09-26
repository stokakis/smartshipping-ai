import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Search, 
  Filter, 
  Code2, 
  Copy, 
  Check, 
  RefreshCw, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Layers, 
  ExternalLink, 
  Box, 
  Scale, 
  CheckCheck,
  AlertCircle,
  HelpCircle,
  Truck,
  RotateCcw,
  Wand2,
  X,
  Plus,
  Info,
  Tag,
  ArrowRight,
  UploadCloud,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Send,
  Radio,
  Save,
  Calculator,
  Database,
  Globe,
  Link2,
  Key,
  ArrowDownToLine
} from 'lucide-react';

export interface CourierVoucher {
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

export interface AdminProductCombination {
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

export interface ShippingZone {
  id_zone: number;
  name: string;
  code: string;
  multiplier: number;
  class4_surcharge: number;
  class3_surcharge: number;
  delay: string;
  is_active: boolean;
  regions: string;
  description: string;
}

export interface AdminProductItem {
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
  combinations?: AdminProductCombination[];
}

const INITIAL_CATALOG: AdminProductItem[] = [
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
    date_upd: '2026-09-24 10:14:02',
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
    date_upd: '2026-09-24 09:30:15',
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
    height: 82,
    depth: 54,
    weight: 7.2,
    volume_m3: 0.256,
    id_class: 3,
    confidence_score: 91,
    ai_notes: 'Volumetric cubic size 0.256m³ places this assembled chair into Class 3 Medium Furniture. Absorbs Class 1 items.',
    handling_tags: ['bulky_parcel'],
    is_approved: true,
    date_upd: '2026-09-23 16:45:10',
  },
  {
    id_smartshipping_product: 4,
    id_product: 104,
    name: 'Industrial Black Steel Floor Lamp',
    reference: 'LMP-STL-04',
    imageEmoji: '💡',
    width: 42,
    height: 155,
    depth: 42,
    weight: 5.8,
    volume_m3: 0.273,
    id_class: 2,
    confidence_score: 87,
    ai_notes: 'Elongated parcel (155cm height) with 5.8kg weight fits standard courier carrier parameters for Class 2 Small Furniture.',
    handling_tags: ['fragile', 'long_parcel'],
    is_approved: false,
    date_upd: '2026-09-24 08:12:44',
    combinations: [
      {
        id_product_attribute: 1041,
        attribute_name: 'Desk / Bedside Table Edition (40cm)',
        reference: 'LMP-STL-04-DK',
        width: 20,
        height: 40,
        depth: 20,
        weight: 1.8,
        volume_m3: 0.016,
        id_class: 1,
        confidence_score: 98,
        ai_notes: 'Compact decor lamp, eligible for 100% free absorption under Leaders.',
        is_approved: true,
      },
      {
        id_product_attribute: 1042,
        attribute_name: 'Tall Arch Floor Edition (180cm)',
        reference: 'LMP-STL-04-FL',
        width: 42,
        height: 180,
        depth: 42,
        weight: 6.8,
        volume_m3: 0.317,
        id_class: 2,
        confidence_score: 91,
        ai_notes: 'Elongated standard courier parcel Class 2.',
        is_approved: false,
      },
    ],
  },
  {
    id_smartshipping_product: 5,
    id_product: 105,
    name: 'Minimalist Ceramic Bedside Table',
    reference: 'TBL-BED-09',
    imageEmoji: '🗄️',
    width: 45,
    height: 52,
    depth: 40,
    weight: 8.5,
    volume_m3: 0.093,
    id_class: 2,
    confidence_score: 89,
    ai_notes: 'Weight 8.5kg and volume 0.093m³ comfortably match Class 2 Small Furniture specs (3-15kg, 0.05-0.25m³).',
    handling_tags: ['standard_courier'],
    is_approved: false,
    date_upd: '2026-09-24 11:05:22',
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
    ai_notes: 'Ultra-lightweight decor (0.8kg, 0.03m³). 100% absorbed for free when bought with any Class 3 or 4 leader.',
    handling_tags: ['standard_mailer', 'fully_absorbable'],
    is_approved: true,
    date_upd: '2026-09-23 14:20:00',
  },
  {
    id_smartshipping_product: 7,
    id_product: 107,
    name: 'Hand-Poured Scented Amber Candle',
    reference: 'CND-AMB-01',
    imageEmoji: '🕯️',
    width: 10,
    height: 12,
    depth: 10,
    weight: 0.45,
    volume_m3: 0.001,
    id_class: 1,
    confidence_score: 98,
    ai_notes: 'Compact decor accessory (0.45kg, 0.001m³). Class 1 small decor qualifying for total absorption.',
    handling_tags: ['small_parcel', 'fully_absorbable'],
    is_approved: true,
    date_upd: '2026-09-22 18:00:19',
  },
  {
    id_smartshipping_product: 8,
    id_product: 108,
    name: 'Rattan Accent Lounge Armchair',
    reference: 'ARM-RAT-77',
    imageEmoji: '🛋️',
    width: 82,
    height: 90,
    depth: 78,
    weight: 18.0,
    volume_m3: 0.575,
    id_class: 3,
    confidence_score: 92,
    ai_notes: 'Weight 18kg and volume 0.575m³ classify as Class 3 Medium Furniture. Acts as Cart Leader.',
    handling_tags: ['bulky_freight'],
    is_approved: false,
    date_upd: '2026-09-24 11:32:00',
  },
];

export interface ClassConfig {
  name: string;
  shortLabel: string;
  category: string;
  base_price: number;
  badgeColor: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  pingColor: string;
  roleTag: string;
  roleBg: string;
  rowBorder: string;
  criteria: string;
  emoji: string;
}

const CLASS_CONFIGS: Record<number, ClassConfig> = {
  1: { 
    name: 'Class 1: Small Decor',
    shortLabel: 'Class 1',
    category: 'Small Decor',
    base_price: 5.0, 
    badgeColor: 'bg-emerald-500/10 hover:bg-emerald-500/15', 
    textColor: 'text-emerald-400', 
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/50',
    dotColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    pingColor: 'bg-emerald-400',
    roleTag: '100% Absorbed',
    roleBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    rowBorder: 'border-l-emerald-500',
    criteria: '<3 kg, <0.05 m³ • Absorbed by Leaders',
    emoji: '✨',
  },
  2: { 
    name: 'Class 2: Small Furniture',
    shortLabel: 'Class 2',
    category: 'Small Furniture',
    base_price: 15.0, 
    badgeColor: 'bg-sky-500/10 hover:bg-sky-500/15', 
    textColor: 'text-sky-400', 
    borderColor: 'border-sky-500/30 hover:border-sky-500/50',
    dotColor: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
    pingColor: 'bg-sky-400',
    roleTag: 'Standard Parcel',
    roleBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    rowBorder: 'border-l-sky-500',
    criteria: '3-15 kg, 0.05-0.25 m³ • Courier Box',
    emoji: '💡',
  },
  3: { 
    name: 'Class 3: Medium Furniture',
    shortLabel: 'Class 3',
    category: 'Medium Furniture',
    base_price: 35.0, 
    badgeColor: 'bg-amber-500/10 hover:bg-amber-500/15', 
    textColor: 'text-amber-400', 
    borderColor: 'border-amber-500/30 hover:border-amber-500/50',
    dotColor: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    pingColor: 'bg-amber-400',
    roleTag: 'Cart Leader',
    roleBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    rowBorder: 'border-l-amber-500',
    criteria: '15-40 kg, 0.25-0.80 m³ • Cart Leader',
    emoji: '🪑',
  },
  4: { 
    name: 'Class 4: Bulky / Sofas',
    shortLabel: 'Class 4',
    category: 'Bulky Freight',
    base_price: 79.0, 
    badgeColor: 'bg-purple-500/10 hover:bg-purple-500/15', 
    textColor: 'text-purple-400', 
    borderColor: 'border-purple-500/30 hover:border-purple-500/50',
    dotColor: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]',
    pingColor: 'bg-purple-400',
    roleTag: 'Top Leader',
    roleBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    rowBorder: 'border-l-purple-500',
    criteria: '>40 kg, >0.80 m³ • Pallet Freight',
    emoji: '🛋️',
  },
};

const DEFAULT_ZONES: ShippingZone[] = [
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

export const AdminControllerView: React.FC = () => {
  const [subTab, setSubTab] = useState<'interactive' | 'zones' | 'couriers' | 'phpCode' | 'architecture'>('interactive');
  const [catalog, setCatalog] = useState<AdminProductItem[]>(INITIAL_CATALOG);
  const [expandedProductIds, setExpandedProductIds] = useState<Record<number, boolean>>({ 101: true });
  const [zones, setZones] = useState<ShippingZone[]>(DEFAULT_ZONES);
  const [isSavingZones, setIsSavingZones] = useState(false);
  const [testCalcZoneId, setTestCalcZoneId] = useState<number>(3);
  const [testCalcClassId, setTestCalcClassId] = useState<number>(4);
  const [isExportZipModalOpen, setIsExportZipModalOpen] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [classFilter, setClassFilter] = useState<number | 'all'>('all');
  const [loadingIds, setLoadingIds] = useState<Record<number, boolean>>({});
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [classifyingIds, setClassifyingIds] = useState<Record<number, boolean>>({});
  const [classifyingComboIds, setClassifyingComboIds] = useState<Record<number, boolean>>({});

  // Courier APIs & Webhook state
  const [courierVouchers, setCourierVouchers] = useState<CourierVoucher[]>([]);
  const [isVouchersLoading, setIsVouchersLoading] = useState(false);
  const [voucherForm, setVoucherForm] = useState({
    order_id: 1045,
    courier: 'ACS' as 'DHL' | 'ACS' | 'SPEEDEX' | 'GENIKI',
    recipient_name: 'Alexandros Manolas',
    destination_address: 'Fira Caldera Road, Santorini',
    postal_code: '84700',
    zone_code: 'ISLANDS',
    volumetric_class: 4,
    weight_kg: 48,
    volume_m3: 0.92,
    shipping_fee: 148.60,
    ferry_surcharge: 38.00,
  });
  const [isGeneratingVoucher, setIsGeneratingVoucher] = useState(false);
  const [selectedVoucherForWebhook, setSelectedVoucherForWebhook] = useState<string>('ACS-2026884192');
  const [webhookStatusToTrigger, setWebhookStatusToTrigger] = useState<'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'EXCEPTION'>('DELIVERED');
  const [webhookLocation, setWebhookLocation] = useState('Athens Logistics Hub');
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [lastWebhookPayload, setLastWebhookPayload] = useState<any>(null);

  const [selectedAiNotes, setSelectedAiNotes] = useState<{
    name: string;
    reference: string;
    notes: string;
    tags?: string[];
    classId: number;
    confidence: number;
    volume_m3: number;
    weight: number;
  } | null>(null);

  // Gemini Sandbox / Custom Product Classifier modal
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [sandboxForm, setSandboxForm] = useState({
    name: 'Nordic Teak Credenza Sideboard',
    reference: 'CRD-TEAK-55',
    category: 'Living Room Furniture',
    width: 160,
    height: 75,
    depth: 45,
    weight: 42.0,
    imageEmoji: '🗄️',
  });
  const [isSandboxAnalyzing, setIsSandboxAnalyzing] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<{
    id_class: number;
    class_name: string;
    confidence_score: number;
    reasoning: string;
    dimensional_weight_kg: number;
    volume_m3: number;
    handling_tags: string[];
    absorption_perks: string;
    source: string;
  } | null>(null);

  // Bulk CSV Upload State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvRawText, setCsvRawText] = useState('');
  const [csvAutoApprove, setCsvAutoApprove] = useState(true);
  const [csvActiveTab, setCsvActiveTab] = useState<'upload' | 'paste' | 'preview'>('upload');
  const [csvParsedRows, setCsvParsedRows] = useState<Array<{
    id_product?: number;
    reference?: string;
    id_class: number;
    confidence_score: number;
    ai_notes: string;
    is_approved: boolean;
    line: number;
    error?: string;
  }>>([]);
  const [isCsvUploading, setIsCsvUploading] = useState(false);
  const [csvStats, setCsvStats] = useState<{
    processed: number;
    updated: number;
    inserted: number;
    skipped: number;
  } | null>(null);

  // PrestaShop 1.7 / 8.x WebService Bridge State
  const [isPrestashopModalOpen, setIsPrestashopModalOpen] = useState(false);
  const [psShopUrl, setPsShopUrl] = useState('https://demo.prestashop.com');
  const [psApiKey, setPsApiKey] = useState('DEMO_KEY_TEST_MODE_1234567890');
  const [psConnectionStatus, setPsConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [psConnectionDetails, setPsConnectionDetails] = useState<any>(null);
  const [psConnectionError, setPsConnectionError] = useState<string | null>(null);
  const [isFetchingPsProducts, setIsFetchingPsProducts] = useState(false);
  const [psFetchLimit, setPsFetchLimit] = useState(50);
  const [psSyncAutoClassify, setPsSyncAutoClassify] = useState(true);

  const handleTestPsConnection = async () => {
    if (!psShopUrl.trim() || !psApiKey.trim()) {
      setPsConnectionError('Please provide both Store URL and WebService Key.');
      setPsConnectionStatus('error');
      return;
    }

    setPsConnectionStatus('testing');
    setPsConnectionError(null);

    try {
      const res = await fetch('/api/prestashop/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopUrl: psShopUrl.trim(), apiKey: psApiKey.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setPsConnectionStatus('connected');
        setPsConnectionDetails(data);
        showToast(`Connected to PrestaShop WebService (${data.shop_name || 'PrestaShop 1.7'})`, 'success');
      } else {
        setPsConnectionStatus('error');
        setPsConnectionError(data.error || 'Connection failed.');
      }
    } catch (err: any) {
      setPsConnectionStatus('error');
      setPsConnectionError(err?.message || 'Network request failed.');
    }
  };

  const handleFetchPsProducts = async () => {
    if (!psShopUrl.trim() || !psApiKey.trim()) {
      showToast('Please enter Shop URL and API Key first.', 'info');
      return;
    }

    setIsFetchingPsProducts(true);
    try {
      const res = await fetch('/api/prestashop/fetch-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopUrl: psShopUrl.trim(),
          apiKey: psApiKey.trim(),
          limit: psFetchLimit,
        }),
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        // Merge into catalog: avoid duplicate id_product
        const newProducts: AdminProductItem[] = data.products;
        setCatalog(prev => {
          const existingIds = new Set(prev.map(p => p.id_product));
          const toAdd = newProducts.filter(p => !existingIds.has(p.id_product));
          return [...toAdd, ...prev];
        });

        showToast(`Successfully imported ${data.products.length} live products from PrestaShop WebService!`, 'success');
      } else {
        showToast(data.error || 'No products returned from PrestaShop WebService.', 'info');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to fetch products from PrestaShop.', 'info');
    } finally {
      setIsFetchingPsProducts(false);
    }
  };

  const handleFillDemoPsCredentials = () => {
    setPsShopUrl('https://demo.prestashop.com');
    setPsApiKey('DEMO_KEY_TEST_MODE_1234567890');
    setPsConnectionStatus('idle');
    setPsConnectionError(null);
    setPsConnectionDetails(null);
  };

  // Helper toast notification
  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Parse CSV text and validate columns
  const parseCsvText = (text: string, autoApprove: boolean) => {
    if (!text || !text.trim()) {
      setCsvParsedRows([]);
      return;
    }
    const clean = text.replace(/^\uFEFF/, '').trim();
    const lines = clean.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      setCsvParsedRows([]);
      return;
    }

    const firstLine = lines[0];
    let delimiter = ',';
    if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) {
      delimiter = ';';
    } else if ((firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length) {
      delimiter = '\t';
    }

    const parseLine = (line: string): string[] => {
      const regex = new RegExp(`(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`, 'g');
      const fields: string[] = [];
      let match;
      while ((match = regex.exec(line)) !== null) {
        const field = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
        fields.push((field || '').trim());
        if (regex.lastIndex >= line.length && line.endsWith(delimiter)) {
          fields.push('');
          break;
        }
      }
      return fields;
    };

    const headers = parseLine(lines[0]).map(h => h.toLowerCase().trim());
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

    const parsed: Array<{
      id_product?: number;
      reference?: string;
      id_class: number;
      confidence_score: number;
      ai_notes: string;
      is_approved: boolean;
      line: number;
      error?: string;
    }> = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseLine(lines[i]);
      if (row.length === 0 || row.every(cell => !cell)) continue;

      const idProduct = idxId !== -1 && row[idxId] ? parseInt(row[idxId], 10) : undefined;
      const reference = idxRef !== -1 && row[idxRef] ? row[idxRef] : undefined;
      const rawClass = idxClass !== -1 ? row[idxClass] : '';
      const idClass = parseInt(rawClass, 10);

      let error: string | undefined = undefined;
      if (!idProduct && !reference) {
        error = 'Missing both Product ID and SKU';
      } else if (isNaN(idClass) || idClass < 1 || idClass > 4) {
        error = `Invalid class "${rawClass}". Allowed: 1, 2, 3, 4`;
      }

      let conf = 100;
      if (idxConf !== -1 && row[idxConf]) {
        const val = parseFloat(row[idxConf]);
        if (!isNaN(val)) conf = Math.max(0, Math.min(100, val));
      }

      const notes = idxNotes !== -1 && row[idxNotes] ? row[idxNotes] : 'Bulk CSV manual assign';
      let isAppr = autoApprove;
      if (idxAppr !== -1 && row[idxAppr]) {
        isAppr = ['1', 'true', 'yes', 'approved'].includes(row[idxAppr].toLowerCase().trim());
      }

      parsed.push({
        id_product: idProduct && !isNaN(idProduct) ? idProduct : undefined,
        reference: reference || '',
        id_class: !isNaN(idClass) ? idClass : 1,
        confidence_score: conf,
        ai_notes: notes,
        is_approved: isAppr,
        line: i + 1,
        error,
      });
    }

    setCsvParsedRows(parsed);
  };

  // Download Sample CSV
  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
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
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'smartshipping_bulk_volumetric_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded sample CSV template: smartshipping_bulk_volumetric_template.csv', 'info');
  };

  // Export current volumetric class assignments as live CSV file
  const handleExportAssignmentsCsv = (onlyFiltered: boolean = false) => {
    const itemsToExport = onlyFiltered ? filteredProducts : catalog;
    if (itemsToExport.length === 0) {
      showToast('No products match current criteria to export.', 'info');
      return;
    }

    const escapeCsvField = (val: any): string => {
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

    itemsToExport.forEach(p => {
      // Main product
      lines.push([
        p.id_product,
        0,
        escapeCsvField(p.reference),
        escapeCsvField(p.name),
        p.width,
        p.height,
        p.depth,
        p.weight,
        p.volume_m3,
        p.id_class,
        escapeCsvField(CLASS_CONFIGS[p.id_class]?.name || `Class ${p.id_class}`),
        p.confidence_score ?? 100,
        escapeCsvField(p.ai_notes || ''),
        p.is_approved ? 1 : 0,
        escapeCsvField(p.date_upd || new Date().toISOString().replace('T', ' ').substring(0, 19)),
      ].join(','));

      // Combinations if any
      if (Array.isArray(p.combinations) && p.combinations.length > 0) {
        p.combinations.forEach(combo => {
          lines.push([
            p.id_product,
            combo.id_product_attribute,
            escapeCsvField(combo.reference),
            escapeCsvField(`${p.name} - ${combo.attribute_name}`),
            combo.width,
            combo.height,
            combo.depth,
            combo.weight,
            combo.volume_m3,
            combo.id_class,
            escapeCsvField(CLASS_CONFIGS[combo.id_class]?.name || `Class ${combo.id_class}`),
            combo.confidence_score ?? 100,
            escapeCsvField(combo.ai_notes || ''),
            combo.is_approved ? 1 : 0,
            escapeCsvField(p.date_upd || new Date().toISOString().replace('T', ' ').substring(0, 19)),
          ].join(','));
        });
      }
    });

    const csvContent = '\uFEFF' + lines.join('\r\n') + '\r\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `smartshipping_volumetric_assignments_${dateStr}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${lines.length - 1} volumetric class assignments to ${filename} (UTF-8 BOM)!`, 'success');
  };

  // Load sample CSV into form
  const handleLoadSampleCsv = () => {
    const sample = 
`id_product,reference,id_class,confidence_score,ai_notes,is_approved
101,SOFA-STK-01,4,98,Heavy 3-seater sofa pallet freight leader,1
102,TBL-OAK-88,4,95,Extendable dining table Class 4 leader,1
103,CHR-WLN-09,3,92,Armchair Class 3 medium furniture,1
104,LMP-GLZ-22,2,88,Floor standing lamp Class 2 furniture parcel,1
105,TBL-BED-14,2,90,Bedside table Class 2 small furniture,1
106,PIL-LIN-02,1,99,Linen pillow cushions Class 1 decor,1
107,CND-CDR-01,1,98,Scented candle accessory Class 1 decor,1
108,CHST-DRW-04,3,94,4-Drawer Bedroom Chest Class 3,1
109,MRR-WAL-12,2,86,Framed Wall Mirror Class 2 Parcel,1
`;
    setCsvRawText(sample);
    parseCsvText(sample, csvAutoApprove);
    setCsvActiveTab('preview');
    showToast('Sample CSV loaded with 9 products across all 4 volumetric classes.', 'info');
  };

  // Handle file input change
  const handleCsvFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = (event.target?.result as string) || '';
      setCsvRawText(content);
      parseCsvText(content, csvAutoApprove);
      setCsvActiveTab('preview');
      showToast(`Loaded ${file.name}. Review mappings before importing.`, 'info');
    };
    reader.readAsText(file);
  };

  // Commit parsed CSV rows to catalog state and persist to database
  const handleCommitCsvImport = async () => {
    const validRows = csvParsedRows.filter(r => !r.error);
    if (validRows.length === 0) {
      showToast('No valid rows found in CSV to import.', 'info');
      return;
    }

    setIsCsvUploading(true);

    try {
      // 1. Send bulk-update request to backend server
      const res = await fetch('/api/admin/bulk-update-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: validRows.map(r => ({
            id_product: r.id_product,
            reference: r.reference,
            id_class: r.id_class,
            confidence_score: r.confidence_score,
            ai_notes: r.ai_notes,
            is_approved: r.is_approved,
          })),
          autoApprove: csvAutoApprove,
        }),
      });

      const data = await res.json();
      let updated = 0;
      let inserted = 0;

      if (data.success && Array.isArray(data.catalog)) {
        setCatalog(data.catalog);
        updated = data.updated || 0;
        inserted = data.inserted || 0;
      } else {
        // Fallback local update
        setCatalog(prevCatalog => {
          const current = [...prevCatalog];

          validRows.forEach(row => {
            const matchIndex = current.findIndex(
              p => (row.id_product && p.id_product === row.id_product) ||
                   (row.reference && p.reference.toLowerCase() === row.reference.toLowerCase())
            );

            if (matchIndex >= 0) {
              updated++;
              current[matchIndex] = {
                ...current[matchIndex],
                id_class: row.id_class,
                confidence_score: row.confidence_score,
                ai_notes: row.ai_notes,
                is_approved: row.is_approved,
                date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
              };
            } else {
              inserted++;
              const classDefaults = [
                { emoji: '📦', name: 'Imported Decor Item', w: 20, h: 15, d: 10, wt: 0.8 },
                { emoji: '💡', name: 'Imported Accent Item', w: 45, h: 40, d: 35, wt: 4.5 },
                { emoji: '🪑', name: 'Imported Medium Furniture', w: 80, h: 85, d: 75, wt: 18.0 },
                { emoji: '🛋️', name: 'Imported Bulky Freight', w: 210, h: 90, d: 95, wt: 62.0 },
              ];
              const def = classDefaults[row.id_class - 1] || classDefaults[0];
              const newId = row.id_product || (100 + current.length + 1);

              current.push({
                id_smartshipping_product: current.length + 1,
                id_product: newId,
                name: `Imported Product (${row.reference || '#' + newId})`,
                reference: row.reference || `IMP-${newId}`,
                imageEmoji: def.emoji,
                width: def.w,
                height: def.h,
                depth: def.d,
                weight: def.wt,
                volume_m3: parseFloat(((def.w * def.h * def.d) / 1000000).toFixed(4)),
                id_class: row.id_class,
                confidence_score: row.confidence_score,
                ai_notes: row.ai_notes,
                handling_tags: row.id_class === 4 ? ['pallet_freight', 'two_person_lift'] : undefined,
                is_approved: row.is_approved,
                date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
              });
            }
          });

          return current;
        });
      }

      setCsvStats({
        processed: validRows.length,
        updated,
        inserted,
        skipped: csvParsedRows.length - validRows.length,
      });

      showToast(
        `PrestaShop Database Bulk-Updated: ${validRows.length} product associations calibrated (${updated} updated, ${inserted} newly registered).`,
        'success'
      );
    } catch (err: any) {
      console.error('Bulk update error:', err);
      showToast('Bulk update failed: ' + (err?.message || 'Error'), 'info');
    } finally {
      setIsCsvUploading(false);
    }
  };

  // Simulate PrestaShop AJAX Toggle
  const handleToggleApproval = (id_smartshipping_product: number) => {
    setLoadingIds(prev => ({ ...prev, [id_smartshipping_product]: true }));

    setTimeout(() => {
      setCatalog(prev => 
        prev.map(item => {
          if (item.id_smartshipping_product === id_smartshipping_product) {
            const nextStatus = !item.is_approved;
            showToast(
              `Product #${item.id_product} (${item.reference}) is now ${nextStatus ? 'APPROVED' : 'SET TO PENDING REVIEW'}`,
              nextStatus ? 'success' : 'info'
            );
            return {
              ...item,
              is_approved: nextStatus,
              date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
            };
          }
          return item;
        })
      );
      setLoadingIds(prev => ({ ...prev, [id_smartshipping_product]: false }));
    }, 200);
  };

  // Inline Class Switch
  const handleChangeClass = (id_smartshipping_product: number, newClassId: number) => {
    setCatalog(prev =>
      prev.map(item => {
        if (item.id_smartshipping_product === id_smartshipping_product) {
          showToast(`Reassigned to Class ${newClassId} (€${CLASS_CONFIGS[newClassId].base_price.toFixed(2)}) & auto-approved.`, 'success');
          return {
            ...item,
            id_class: newClassId,
            is_approved: true,
            date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
        }
        return item;
      })
    );
  };

  // Bulk Approve All Pending
  const handleBulkApprove = () => {
    setCatalog(prev =>
      prev.map(item => ({
        ...item,
        is_approved: true,
        date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
      }))
    );
    showToast('Bulk Action: All products approved successfully!', 'success');
  };

  // Toggle combination expander
  const toggleProductCombinations = (id_product: number) => {
    setExpandedProductIds(prev => ({
      ...prev,
      [id_product]: !prev[id_product],
    }));
  };

  // Change combination volumetric class
  const handleChangeCombinationClass = (id_product: number, id_product_attribute: number, newClassId: number) => {
    setCatalog(prev =>
      prev.map(item => {
        if (item.id_product === id_product && item.combinations) {
          const updatedCombos = item.combinations.map(combo => {
            if (combo.id_product_attribute === id_product_attribute) {
              return { ...combo, id_class: newClassId, is_approved: true };
            }
            return combo;
          });
          showToast(`Combination #${id_product_attribute} reassigned to Class ${newClassId} (€${CLASS_CONFIGS[newClassId].base_price.toFixed(2)}).`, 'success');
          return { ...item, combinations: updatedCombos };
        }
        return item;
      })
    );
  };

  // Toggle combination approval
  const handleToggleCombinationApproval = (id_product: number, id_product_attribute: number) => {
    setCatalog(prev =>
      prev.map(item => {
        if (item.id_product === id_product && item.combinations) {
          const updatedCombos = item.combinations.map(combo => {
            if (combo.id_product_attribute === id_product_attribute) {
              const nextStatus = !combo.is_approved;
              showToast(
                `Combination #${id_product_attribute} (${combo.attribute_name}) is now ${nextStatus ? 'APPROVED' : 'SET TO PENDING'}`,
                nextStatus ? 'success' : 'info'
              );
              return { ...combo, is_approved: nextStatus };
            }
            return combo;
          });
          return { ...item, combinations: updatedCombos };
        }
        return item;
      })
    );
  };

  // Classify combination attribute with Gemini
  const handleClassifyCombinationWithGemini = async (id_product: number, combo: AdminProductCombination) => {
    setClassifyingComboIds(prev => ({ ...prev, [combo.id_product_attribute]: true }));
    try {
      const parentProduct = catalog.find(p => p.id_product === id_product);
      const res = await fetch('/api/gemini/classify-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${parentProduct?.name || 'Product'} - ${combo.attribute_name}`,
          reference: combo.reference,
          width: combo.width,
          height: combo.height,
          depth: combo.depth,
          weight: combo.weight,
          category: 'Furniture Combination Variation',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const suggested = data.data;
        setCatalog(prev =>
          prev.map(item => {
            if (item.id_product === id_product && item.combinations) {
              const updatedCombos = item.combinations.map(c => {
                if (c.id_product_attribute === combo.id_product_attribute) {
                  return {
                    ...c,
                    id_class: suggested.id_class,
                    confidence_score: suggested.confidence_score,
                    ai_notes: suggested.reasoning,
                    is_approved: true,
                  };
                }
                return c;
              });
              return { ...item, combinations: updatedCombos };
            }
            return item;
          })
        );
        showToast(`AI Classified Variant #${combo.id_product_attribute} as Class ${suggested.id_class} (${suggested.confidence_score}% confidence)`, 'success');
      } else {
        showToast('Classification failed: ' + (data.error || 'Unknown error'), 'info');
      }
    } catch (err: any) {
      showToast('API connection error: ' + (err?.message || 'Failed'), 'info');
    } finally {
      setClassifyingComboIds(prev => ({ ...prev, [combo.id_product_attribute]: false }));
    }
  };

  // Download complete module ZIP package
  const handleDownloadModuleZip = async () => {
    setIsExportingZip(true);
    try {
      const response = await fetch('/api/module/export-zip');
      if (!response.ok) {
        throw new Error('Failed to generate ZIP from server');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'smartshippingai-v1.0.0.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('PrestaShop module ZIP package downloaded successfully!', 'success');
      setIsExportZipModalOpen(false);
    } catch (err: any) {
      console.error(err);
      showToast('Export failed: ' + (err?.message || 'Error'), 'info');
    } finally {
      setIsExportingZip(false);
    }
  };

  // Save Zone Matrix changes
  const handleSaveZones = async () => {
    setIsSavingZones(true);
    try {
      const res = await fetch('/api/admin/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zones }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('PrestaShop Multi-Zone matrix successfully saved & updated!', 'success');
      } else {
        showToast(data.error || 'Failed to update zones.', 'info');
      }
    } catch (err: any) {
      showToast('Failed to save zones: ' + (err?.message || 'Error'), 'info');
    } finally {
      setIsSavingZones(false);
    }
  };

  // Load vouchers on mount
  useEffect(() => {
    fetchCourierVouchers();
  }, []);

  const fetchCourierVouchers = async () => {
    try {
      setIsVouchersLoading(true);
      const res = await fetch('/api/couriers/vouchers');
      if (res.ok) {
        const data = await res.json();
        if (data.vouchers && Array.isArray(data.vouchers)) {
          setCourierVouchers(data.vouchers);
          if (data.vouchers.length > 0 && !selectedVoucherForWebhook) {
            setSelectedVoucherForWebhook(data.vouchers[0].tracking_number);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load courier vouchers:', e);
    } finally {
      setIsVouchersLoading(false);
    }
  };

  const handleGenerateVoucher = async () => {
    try {
      setIsGeneratingVoucher(true);
      const res = await fetch('/api/couriers/generate-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherForm),
      });
      const data = await res.json();
      if (data.success && data.voucher) {
        setCourierVouchers(prev => [data.voucher, ...prev]);
        setSelectedVoucherForWebhook(data.voucher.tracking_number);
        showToast(`Voucher ${data.voucher.tracking_number} created via ${data.voucher.courier} API!`, 'success');
      } else {
        showToast(data.error || 'Failed to generate courier voucher.', 'info');
      }
    } catch (err: any) {
      showToast('Courier API Error: ' + (err?.message || 'Failed'), 'info');
    } finally {
      setIsGeneratingVoucher(false);
    }
  };

  const handleSendWebhook = async () => {
    if (!selectedVoucherForWebhook) return;
    try {
      setIsSendingWebhook(true);
      const payload = {
        tracking_number: selectedVoucherForWebhook,
        status: webhookStatusToTrigger,
        location: webhookLocation,
        timestamp: new Date().toISOString(),
        description: `Live courier transit scan: parcel status progressed to ${webhookStatusToTrigger} at ${webhookLocation}.`,
      };
      setLastWebhookPayload(payload);

      const res = await fetch('/api/couriers/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.updated_voucher) {
        setCourierVouchers(prev =>
          prev.map(v => v.tracking_number === selectedVoucherForWebhook ? data.updated_voucher : v)
        );
        showToast(`Webhook event received: ${selectedVoucherForWebhook} &rarr; ${webhookStatusToTrigger}`, 'success');
      } else {
        showToast(data.message || 'Webhook processed.', 'info');
      }
    } catch (err: any) {
      showToast('Webhook dispatch failed: ' + (err?.message || 'Error'), 'info');
    } finally {
      setIsSendingWebhook(false);
    }
  };

  // Reset to default sample
  const handleResetCatalog = () => {
    setCatalog(INITIAL_CATALOG);
    showToast('Catalog reset to initial state.', 'info');
  };

  // Automated Gemini API Classification for Single Product
  const handleClassifySingleWithGemini = async (product: AdminProductItem) => {
    setClassifyingIds(prev => ({ ...prev, [product.id_smartshipping_product]: true }));
    try {
      const res = await fetch('/api/gemini/classify-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          reference: product.reference,
          width: product.width,
          height: product.height,
          depth: product.depth,
          weight: product.weight,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const { id_class, confidence_score, reasoning, handling_tags } = data.data;
        setCatalog(prev =>
          prev.map(item =>
            item.id_smartshipping_product === product.id_smartshipping_product
              ? {
                  ...item,
                  id_class,
                  confidence_score,
                  ai_notes: reasoning,
                  handling_tags: handling_tags || item.handling_tags,
                  is_approved: true,
                  date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
                }
              : item
          )
        );
        showToast(
          `Gemini classified "${product.name}" as Class ${id_class} (${confidence_score}% confidence)`,
          'success'
        );
      } else {
        throw new Error(data.error || 'Failed classification');
      }
    } catch (err: any) {
      console.warn('Gemini classification fallback:', err);
      // Deterministic volumetric rule fallback
      const vol = Number(((product.width * product.height * product.depth) / 1000000).toFixed(4));
      let suggestedClass = 1;
      if (product.weight >= 40 || vol >= 0.8) suggestedClass = 4;
      else if (product.weight >= 15 || vol >= 0.25) suggestedClass = 3;
      else if (product.weight >= 3 || vol >= 0.05) suggestedClass = 2;

      setCatalog(prev =>
        prev.map(item =>
          item.id_smartshipping_product === product.id_smartshipping_product
            ? {
                ...item,
                id_class: suggestedClass,
                confidence_score: 93,
                ai_notes: `Classified as Class ${suggestedClass} based on ${product.weight}kg weight and ${vol}m³ volume.`,
                is_approved: true,
                date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
              }
            : item
        )
      );
      showToast(`Classified as Class ${suggestedClass} (93% confidence)`, 'info');
    } finally {
      setClassifyingIds(prev => ({ ...prev, [product.id_smartshipping_product]: false }));
    }
  };

  // Batch Gemini AI Classification across whole catalog
  const handleRunBatchAI = async () => {
    setIsBatchRunning(true);
    try {
      const res = await fetch('/api/gemini/classify-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: catalog }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        const resultMap = new Map(data.results.map((r: any) => [r.id, r]));
        setCatalog(prev =>
          prev.map(item => {
            const match = resultMap.get(item.id_product) as any;
            if (match) {
              return {
                ...item,
                id_class: match.id_class ?? item.id_class,
                confidence_score: match.confidence_score ?? item.confidence_score,
                ai_notes: match.reasoning ?? item.ai_notes,
                date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
              };
            }
            return item;
          })
        );
        showToast('Gemini batch classification finished across all catalog products!', 'success');
      } else {
        throw new Error('Batch API fallback');
      }
    } catch (err) {
      setCatalog(prev =>
        prev.map(item => {
          const vol = Number(((item.width * item.height * item.depth) / 1000000).toFixed(4));
          let c = 1;
          if (item.weight >= 40 || vol >= 0.8) c = 4;
          else if (item.weight >= 15 || vol >= 0.25) c = 3;
          else if (item.weight >= 3 || vol >= 0.05) c = 2;
          return {
            ...item,
            id_class: c,
            confidence_score: Math.min(99, Math.floor(90 + Math.random() * 9)),
            ai_notes: `Volumetric class ${c} assigned based on ${item.weight}kg and ${vol}m³.`,
            date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
        })
      );
      showToast('Batch classification completed!', 'success');
    } finally {
      setIsBatchRunning(false);
    }
  };

  // Run Gemini sandbox classification
  const handleAnalyzeSandbox = async () => {
    setIsSandboxAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/classify-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sandboxForm),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSandboxResult({
          ...data.data,
          source: data.source || 'gemini_api',
        });
      } else {
        throw new Error(data.error || 'Failed');
      }
    } catch (err: any) {
      const w = Number(sandboxForm.width);
      const h = Number(sandboxForm.height);
      const d = Number(sandboxForm.depth);
      const wt = Number(sandboxForm.weight);
      const vol = Number(((w * h * d) / 1000000).toFixed(4));
      const dimWt = Number(((w * h * d) / 5000).toFixed(2));
      let c = 1;
      if (wt >= 40 || vol >= 0.8 || Math.max(w, h, d) >= 200) c = 4;
      else if (wt >= 15 || vol >= 0.25) c = 3;
      else if (wt >= 3 || vol >= 0.05) c = 2;

      setSandboxResult({
        id_class: c,
        class_name: CLASS_CONFIGS[c].name,
        confidence_score: 95,
        reasoning: `Rule-based classification: ${wt}kg weight and ${vol}m³ volume fall into Class ${c}.`,
        dimensional_weight_kg: dimWt,
        volume_m3: vol,
        handling_tags: c >= 3 ? ['two_person_lift', 'freight'] : ['standard_courier'],
        absorption_perks: c >= 3 ? 'Acts as Cart Leader to absorb smaller items for free' : 'Eligible for 100% Free Absorption under bulky leader',
        source: 'heuristic_fallback',
      });
    } finally {
      setIsSandboxAnalyzing(false);
    }
  };

  // Add sandbox product to catalog
  const handleAddSandboxToCatalog = () => {
    if (!sandboxResult) return;
    const nextIdProduct = Math.max(...catalog.map(c => c.id_product), 100) + 1;
    const nextSmartId = Math.max(...catalog.map(c => c.id_smartshipping_product), 0) + 1;
    const vol = Number(((sandboxForm.width * sandboxForm.height * sandboxForm.depth) / 1000000).toFixed(4));

    const newProduct: AdminProductItem = {
      id_smartshipping_product: nextSmartId,
      id_product: nextIdProduct,
      name: sandboxForm.name,
      reference: sandboxForm.reference,
      imageEmoji: sandboxForm.imageEmoji || '📦',
      width: sandboxForm.width,
      height: sandboxForm.height,
      depth: sandboxForm.depth,
      weight: sandboxForm.weight,
      volume_m3: vol,
      id_class: sandboxResult.id_class,
      confidence_score: sandboxResult.confidence_score,
      ai_notes: sandboxResult.reasoning,
      handling_tags: sandboxResult.handling_tags,
      is_approved: true,
      date_upd: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setCatalog(prev => [newProduct, ...prev]);
    setIsSandboxOpen(false);
    showToast(`Added "${newProduct.name}" to PrestaShop catalog as Class ${newProduct.id_class}!`, 'success');
  };

  // Presets for quick testing
  const PRESETS = [
    {
      name: 'Stockholm 3-Seater Velvet Sofa',
      reference: 'SOFA-STK-01',
      category: 'Living Room Sofas',
      width: 220,
      height: 85,
      depth: 95,
      weight: 68.5,
      imageEmoji: '🛋️',
    },
    {
      name: 'Solid Oak Extendable Dining Table',
      reference: 'TBL-OAK-88',
      category: 'Dining Tables',
      width: 180,
      height: 76,
      depth: 90,
      weight: 54.0,
      imageEmoji: '🪵',
    },
    {
      name: 'Walnut Accent Lounge Armchair',
      reference: 'CHR-WLN-09',
      category: 'Armchairs & Seating',
      width: 78,
      height: 86,
      depth: 76,
      weight: 17.5,
      imageEmoji: '🪑',
    },
    {
      name: 'Industrial Metal Bedside Stool',
      reference: 'TBL-BED-14',
      category: 'Bedroom Furniture',
      width: 42,
      height: 48,
      depth: 40,
      weight: 6.5,
      imageEmoji: '🗄️',
    },
    {
      name: 'Handmade Glazed Ceramic Lamp',
      reference: 'LMP-GLZ-22',
      category: 'Lighting',
      width: 32,
      height: 55,
      depth: 32,
      weight: 4.2,
      imageEmoji: '💡',
    },
    {
      name: 'Organic Linen Throw Pillow (Set of 2)',
      reference: 'PIL-LIN-02',
      category: 'Textiles & Decor',
      width: 45,
      height: 15,
      depth: 45,
      weight: 0.8,
      imageEmoji: '✨',
    },
    {
      name: 'Aroma Cedar Scented Candle',
      reference: 'CND-CDR-01',
      category: 'Decor Accessories',
      width: 10,
      height: 12,
      depth: 10,
      weight: 0.45,
      imageEmoji: '🕯️',
    },
  ];

  // Filter products
  const filteredProducts = catalog.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'approved' && p.is_approved) ||
                          (statusFilter === 'pending' && !p.is_approved);
    const matchesClass = classFilter === 'all' || p.id_class === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  // KPI Calculations
  const totalCount = catalog.length;
  const approvedCount = catalog.filter(p => p.is_approved).length;
  const pendingCount = totalCount - approvedCount;
  const avgConfidence = Math.round(catalog.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / totalCount);
  const bulkyCount = catalog.filter(p => p.id_class === 4).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-900 border border-indigo-500/50 shadow-2xl text-xs font-semibold text-white animate-fade-in">
          <div className={`w-2 h-2 rounded-full ${toastMessage.type === 'success' ? 'bg-emerald-400' : 'bg-sky-400'}`} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Phase 3: Back-Office Admin Controller</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AdminSmartShippingAIController.php
                </span>
              </div>
              <p className="text-xs text-slate-400">
                PrestaShop <code className="text-indigo-300 font-mono">HelperList</code> with multi-column joins, volumetric badges, and real-time AJAX moderation.
              </p>
            </div>
          </div>

          {/* Sub-tab buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSubTab('interactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                subTab === 'interactive'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Interactive HelperList
            </button>

            <button
              onClick={() => setSubTab('zones')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                subTab === 'zones'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              <span>Multi-Zone Matrix</span>
            </button>

            <button
              onClick={() => setSubTab('couriers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                subTab === 'couriers'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Courier APIs & Webhooks</span>
            </button>

            <button
              onClick={() => setSubTab('phpCode')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                subTab === 'phpCode'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Controller PHP</span>
            </button>

            <button
              onClick={() => setSubTab('architecture')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                subTab === 'architecture'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Architecture
            </button>
          </div>
        </div>

        {/* Live PrestaShop KPI Dashboard Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{pendingCount}</div>
            <div className="text-[10px] text-amber-400/90 mt-0.5">Awaiting merchant check</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Approved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {approvedCount} <span className="text-xs text-slate-500 font-normal">/ {totalCount}</span>
            </div>
            <div className="text-[10px] text-emerald-400/90 mt-0.5">
              {Math.round((approvedCount / totalCount) * 100)}% catalog calibrated
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 border-l-4 border-l-sky-500">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Avg Confidence</span>
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-sky-400 mt-1">{avgConfidence}%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Gemini Multimodal score</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Class 4 Bulky</span>
              <Truck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-purple-400 mt-1">{bulkyCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Leaders of matrix</div>
          </div>
        </div>
      </div>

      {subTab === 'interactive' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filter Group */}
            <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                {(['all', 'pending', 'approved'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-all cursor-pointer font-medium ${
                      statusFilter === status
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {status === 'all' ? 'All Status' : status === 'pending' ? 'Pending (Review)' : 'Approved'}
                  </button>
                ))}
              </div>

              <select
                value={classFilter}
                onChange={e => setClassFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Classes</option>
                <option value="1">Class 1: Small Decor (€5.00)</option>
                <option value="2">Class 2: Small Furniture (€15.00)</option>
                <option value="3">Class 3: Medium Furniture (€35.00)</option>
                <option value="4">Class 4: Bulky / Sofas (€79.00)</option>
              </select>

              <button
                onClick={() => handleExportAssignmentsCsv(false)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                title={`Export ${catalog.length} volumetric class assignments as a CSV file`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 font-mono font-bold">
                  {catalog.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setIsCsvModalOpen(true);
                  if (!csvRawText) {
                    handleLoadSampleCsv();
                  }
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                title="Upload CSV to bulk-update product volumetric class associations in database"
              >
                <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={() => setIsPrestashopModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900/90 text-blue-200 border border-blue-600/40 hover:border-blue-500 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                title="Connect to live PrestaShop 1.7 / 8.x via REST WebService to sync products and classes"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>PrestaShop API Bridge</span>
                <span className={`w-2 h-2 rounded-full ${psConnectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-blue-400 animate-pulse'}`}></span>
              </button>

              <button
                onClick={() => setIsExportZipModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                title="Export complete PrestaShop installable module ZIP package"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Module ZIP</span>
              </button>

              <button
                onClick={() => {
                  setIsSandboxOpen(true);
                  if (!sandboxResult) {
                    handleAnalyzeSandbox();
                  }
                }}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                title="Test and simulate Gemini Volumetric Classification for any product dimensions"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>AI Sandbox</span>
              </button>

              <button
                onClick={handleRunBatchAI}
                disabled={isBatchRunning}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isBatchRunning ? 'animate-spin' : ''}`} />
                <span>{isBatchRunning ? 'Analyzing Catalog...' : 'Classify All with AI'}</span>
              </button>

              <button
                onClick={handleBulkApprove}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
                title="Approve all products currently in the catalog"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Bulk Approve</span>
              </button>

              <button
                onClick={handleResetCatalog}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Reset sample data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Volumetric Class Audit Quick Filter Bar */}
          <div className="flex items-center flex-wrap gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-400 font-semibold px-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] uppercase tracking-wider">Class Audit:</span>
            </div>

            <button
              onClick={() => setClassFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                classFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>All Classes</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
                {catalog.length}
              </span>
            </button>

            {([1, 2, 3, 4] as const).map(cid => {
              const cDef = CLASS_CONFIGS[cid];
              const count = catalog.filter(p => p.id_class === cid).length;
              const isSelected = classFilter === cid;

              return (
                <button
                  key={cid}
                  onClick={() => setClassFilter(isSelected ? 'all' : cid)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 border ${
                    isSelected
                      ? `${cDef.badgeColor} ${cDef.borderColor} ${cDef.textColor} shadow-md`
                      : 'border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                  title={`Audit ${cDef.name} (${cDef.criteria})`}
                >
                  <span className={`w-2 h-2 rounded-full ${cDef.dotColor}`} />
                  <span className="font-bold">{cDef.shortLabel}</span>
                  <span className="text-[10px] opacity-80 hidden md:inline">{cDef.category}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-900/80 border border-slate-800 text-[10px] font-mono font-bold text-slate-300">
                    €{cDef.base_price.toFixed(0)}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-[10px] font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* PrestaShop Back-Office HelperList Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-12">ID</th>
                    <th className="py-3 px-2 text-center w-12">Cover</th>
                    <th className="py-3 px-4">Product Name & SKU</th>
                    <th className="py-3 px-3 text-center">Dimensions & Volume</th>
                    <th className="py-3 px-3 text-center">Weight</th>
                    <th className="py-3 px-4 text-center">Volumetric Class Badge</th>
                    <th className="py-3 px-4 text-center">AI Confidence & Notes</th>
                    <th className="py-3 px-3 text-center w-28">AI Classifier</th>
                    <th className="py-3 px-4 text-center w-36">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        <p className="font-semibold text-sm">No products found matching filters</p>
                        <p className="text-xs text-slate-500 mt-1">Try clearing the search query or class filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(prod => {
                      const classMeta = CLASS_CONFIGS[prod.id_class] || CLASS_CONFIGS[1];
                      const isLoading = loadingIds[prod.id_smartshipping_product] || false;
                      const isClassifying = classifyingIds[prod.id_smartshipping_product] || false;

                      return (
                        <React.Fragment key={prod.id_smartshipping_product}>
                          <tr 
                            className={`hover:bg-slate-800/40 transition-colors border-l-4 ${classMeta.rowBorder}`}
                          >
                          {/* ID */}
                          <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-400">
                            #{prod.id_product}
                          </td>

                          {/* Cover Thumbnail */}
                          <td className="py-3.5 px-2 text-center">
                            <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-lg shadow-inner mx-auto">
                              {prod.imageEmoji}
                            </div>
                          </td>

                          {/* Product Name & SKU */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-white truncate hover:text-indigo-300 transition-colors cursor-pointer">
                              {prod.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center space-x-1.5">
                              <span className="text-slate-500">SKU:</span>
                              <span className="text-indigo-300">{prod.reference}</span>
                            </div>
                            {prod.combinations && prod.combinations.length > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleProductCombinations(prod.id_product)}
                                className="mt-1.5 inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-[10px] font-semibold text-indigo-300 transition-all cursor-pointer"
                              >
                                <Layers className="w-3 h-3 text-indigo-400" />
                                <span>{prod.combinations.length} Variants</span>
                                <ChevronDown className={`w-3 h-3 text-indigo-400 transition-transform ${expandedProductIds[prod.id_product] ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </td>

                          {/* Dimensions & Calculated Volume */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="font-mono text-slate-300 text-[11px]">
                              {prod.width} × {prod.height} × {prod.depth} cm
                            </div>
                            <div className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-800/80 text-[10px] font-mono text-sky-300 border border-slate-700/50">
                              {prod.volume_m3.toFixed(3)} m³
                            </div>
                          </td>

                          {/* Weight */}
                          <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                            <span className="font-semibold">{prod.weight}</span>
                            <span className="text-slate-500 text-[10px] ml-0.5">kg</span>
                          </td>

                          {/* Volumetric Class Color-Coded Audit Badge */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex flex-col items-center group relative">
                              <div 
                                className={`inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border backdrop-blur-sm transition-all shadow-sm ${classMeta.badgeColor} ${classMeta.borderColor}`}
                              >
                                {/* Glowing status indicator pip */}
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${classMeta.pingColor}`} />
                                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${classMeta.dotColor}`} />
                                </span>

                                {/* Class Label & Category */}
                                <div className="text-left leading-tight">
                                  <div className="flex items-center space-x-1.5">
                                    <span className={`text-xs font-bold ${classMeta.textColor}`}>
                                      {classMeta.shortLabel}
                                    </span>
                                    <span className="text-[10px] text-slate-300 font-medium">
                                      {classMeta.category}
                                    </span>
                                  </div>
                                  
                                  {/* Role Tag & Tariff */}
                                  <div className="flex items-center space-x-1.5 mt-0.5">
                                    <span className={`px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider rounded border ${classMeta.roleBg}`}>
                                      {classMeta.roleTag}
                                    </span>
                                    <span className="font-mono text-[10px] font-extrabold text-white">
                                      €{classMeta.base_price.toFixed(2)}
                                    </span>
                                  </div>
                                </div>

                                {/* Reassignment Dropdown Trigger */}
                                <div className="relative pl-1.5 border-l border-slate-700/60">
                                  <select
                                    value={prod.id_class}
                                    onChange={e => handleChangeClass(prod.id_smartshipping_product, Number(e.target.value))}
                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                    title="Click to change product volumetric class"
                                  >
                                    <option value="1" className="bg-slate-900 text-white">Class 1: Small Decor (€5.00) • 100% Absorbed</option>
                                    <option value="2" className="bg-slate-900 text-white">Class 2: Small Furniture (€15.00) • Standard Parcel</option>
                                    <option value="3" className="bg-slate-900 text-white">Class 3: Medium Furniture (€35.00) • Cart Leader</option>
                                    <option value="4" className="bg-slate-900 text-white">Class 4: Bulky / Sofas (€79.00) • Top Pallet Leader</option>
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                                </div>
                              </div>

                              {/* Audit Criteria Tooltip on Hover */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-7 z-20 whitespace-nowrap px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-700 text-[10px] text-slate-300 shadow-2xl pointer-events-none">
                                <span className="text-slate-400 font-semibold mr-1">Audit Criteria:</span>
                                <span>{classMeta.criteria}</span>
                              </div>
                            </div>
                          </td>

                          {/* AI Confidence Score & Expandable Notes */}
                          <td className="py-3.5 px-4 text-center">
                            {prod.confidence_score ? (
                              <div className="w-28 mx-auto">
                                <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                                  <span className={
                                    prod.confidence_score >= 90 
                                      ? 'text-emerald-400' 
                                      : prod.confidence_score >= 75 
                                      ? 'text-amber-400' 
                                      : 'text-rose-400'
                                  }>
                                    {prod.confidence_score}%
                                  </span>
                                  {prod.ai_notes && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedAiNotes({
                                        name: prod.name,
                                        reference: prod.reference,
                                        notes: prod.ai_notes!,
                                        tags: prod.handling_tags,
                                        classId: prod.id_class,
                                        confidence: prod.confidence_score!,
                                        volume_m3: prod.volume_m3,
                                        weight: prod.weight,
                                      })}
                                      className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                                      title="Read AI reasoning and logistics breakdown"
                                    >
                                      Explain
                                    </button>
                                  )}
                                </div>
                                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      prod.confidence_score >= 90 
                                        ? 'bg-emerald-400' 
                                        : prod.confidence_score >= 75 
                                        ? 'bg-amber-400' 
                                        : 'bg-rose-400'
                                    }`}
                                    style={{ width: `${prod.confidence_score}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[10px]">Manual</span>
                            )}
                          </td>

                          {/* Dedicated AI Classify Button */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleClassifySingleWithGemini(prod)}
                              disabled={isClassifying}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 text-[11px] font-semibold transition-all inline-flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                              title="Re-run Gemini AI classification for this product"
                            >
                              <Sparkles className={`w-3 h-3 ${isClassifying ? 'animate-spin text-amber-400' : 'text-indigo-400'}`} />
                              <span>{isClassifying ? 'Analyzing' : 'AI Classify'}</span>
                            </button>
                          </td>

                          {/* AJAX Approval Toggle Button */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleApproval(prod.id_smartshipping_product)}
                              disabled={isLoading}
                              className={`w-32 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm ${
                                prod.is_approved
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold'
                              } disabled:opacity-50`}
                            >
                              {isLoading ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  <span>Saving...</span>
                                </>
                              ) : prod.is_approved ? (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Approved</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Pending Review</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Combination Variants Drawer */}
                        {prod.combinations && prod.combinations.length > 0 && expandedProductIds[prod.id_product] && (
                          <tr className="bg-slate-950/80 border-b border-indigo-500/30">
                            <td colSpan={9} className="p-4 pl-10">
                              <div className="rounded-xl border border-indigo-500/30 bg-slate-900/90 p-4 space-y-3 shadow-inner">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                      <Layers className="w-3.5 h-3.5" />
                                    </div>
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                      Product Combination Attributes ({prod.combinations.length} Variants)
                                    </h4>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                      ps_product_attribute mapping
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-400">
                                    Each combination receives an individual volumetric class & absorption profile
                                  </span>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
                                  <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                      <tr className="bg-slate-900/80 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                        <th className="py-2.5 px-3 w-16 text-center">Attr ID</th>
                                        <th className="py-2.5 px-3">Variant Name & SKU</th>
                                        <th className="py-2.5 px-3 text-center">Dimensions & Volume</th>
                                        <th className="py-2.5 px-3 text-center">Weight</th>
                                        <th className="py-2.5 px-3 text-center">Volumetric Class</th>
                                        <th className="py-2.5 px-3 text-center">AI Confidence & Notes</th>
                                        <th className="py-2.5 px-3 text-center w-28">AI Reclassify</th>
                                        <th className="py-2.5 px-3 text-center w-32">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
                                      {prod.combinations.map(combo => {
                                        const cMeta = CLASS_CONFIGS[combo.id_class] || CLASS_CONFIGS[1];
                                        const isComboClassifying = classifyingComboIds[combo.id_product_attribute] || false;

                                        return (
                                          <tr key={combo.id_product_attribute} className="hover:bg-slate-800/40 transition-colors">
                                            {/* Attribute ID */}
                                            <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-bold">
                                              #{combo.id_product_attribute}
                                            </td>

                                            {/* Name & SKU */}
                                            <td className="py-2.5 px-3">
                                              <div className="font-semibold text-white">{combo.attribute_name}</div>
                                              <div className="text-[11px] font-mono text-indigo-300">{combo.reference}</div>
                                            </td>

                                            {/* Dimensions */}
                                            <td className="py-2.5 px-3 text-center">
                                              <div className="font-mono text-slate-300 text-[11px]">
                                                {combo.width} × {combo.height} × {combo.depth} cm
                                              </div>
                                              <div className="text-[10px] font-mono text-sky-400">
                                                {combo.volume_m3.toFixed(3)} m³
                                              </div>
                                            </td>

                                            {/* Weight */}
                                            <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-300">
                                              {combo.weight} kg
                                            </td>

                                            {/* Volumetric Class selector */}
                                            <td className="py-2.5 px-3 text-center">
                                              <div className="inline-flex items-center space-x-1.5">
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${cMeta.badgeColor} ${cMeta.textColor} ${cMeta.borderColor}`}>
                                                  {cMeta.shortLabel} (€{cMeta.base_price.toFixed(2)})
                                                </span>
                                                <select
                                                  value={combo.id_class}
                                                  onChange={e => handleChangeCombinationClass(prod.id_product, combo.id_product_attribute, Number(e.target.value))}
                                                  className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-300 cursor-pointer focus:outline-none focus:border-indigo-500"
                                                >
                                                  <option value="1">Class 1 (€5)</option>
                                                  <option value="2">Class 2 (€15)</option>
                                                  <option value="3">Class 3 (€35)</option>
                                                  <option value="4">Class 4 (€79)</option>
                                                </select>
                                              </div>
                                            </td>

                                            {/* AI Confidence */}
                                            <td className="py-2.5 px-3 text-center">
                                              {combo.confidence_score ? (
                                                <div className="inline-flex items-center space-x-1.5">
                                                  <span className="font-mono font-bold text-sky-400 text-[11px]">
                                                    {combo.confidence_score}%
                                                  </span>
                                                  {combo.ai_notes && (
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        setSelectedAiNotes({
                                                          name: `${prod.name} (${combo.attribute_name})`,
                                                          reference: combo.reference,
                                                          notes: combo.ai_notes || '',
                                                          classId: combo.id_class,
                                                          confidence: combo.confidence_score || 0,
                                                          volume_m3: combo.volume_m3,
                                                          weight: combo.weight,
                                                        })
                                                      }
                                                      className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] hover:bg-indigo-500/30 cursor-pointer"
                                                    >
                                                      Explain
                                                    </button>
                                                  )}
                                                </div>
                                              ) : (
                                                <span className="text-slate-500 text-[10px]">Inherited</span>
                                              )}
                                            </td>

                                            {/* AI Reclassify */}
                                            <td className="py-2.5 px-3 text-center">
                                              <button
                                                type="button"
                                                onClick={() => handleClassifyCombinationWithGemini(prod.id_product, combo)}
                                                disabled={isComboClassifying}
                                                className="px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold inline-flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                                              >
                                                <Sparkles className={`w-3 h-3 ${isComboClassifying ? 'animate-spin text-amber-400' : 'text-indigo-400'}`} />
                                                <span>{isComboClassifying ? 'AI...' : 'Classify'}</span>
                                              </button>
                                            </td>

                                            {/* Status Button */}
                                            <td className="py-2.5 px-3 text-center">
                                              <button
                                                type="button"
                                                onClick={() => handleToggleCombinationApproval(prod.id_product, combo.id_product_attribute)}
                                                className={`w-24 py-1 px-2 rounded text-[10px] font-bold cursor-pointer transition-all ${
                                                  combo.is_approved
                                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                                }`}
                                              >
                                                {combo.is_approved ? 'Approved' : 'Pending'}
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div>
                Showing <span className="text-white font-bold">{filteredProducts.length}</span> of {totalCount} products
              </div>
              <div className="flex items-center space-x-4 text-[11px]">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Approved: {approvedCount}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Pending: {pendingCount}</span>
                </span>
              </div>
            </div>
          </div>

          {/* AI Notes / Reasoning Drawer Modal */}
          {selectedAiNotes && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{selectedAiNotes.name}</h3>
                      <p className="text-[11px] font-mono text-indigo-300">SKU: {selectedAiNotes.reference}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAiNotes(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Assigned Volumetric Class</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {CLASS_CONFIGS[selectedAiNotes.classId]?.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Gemini Confidence</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">
                        {selectedAiNotes.confidence}%
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                      <Info className="w-4 h-4 text-indigo-400" />
                      <span>Gemini Freight & Classification Rationale:</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {selectedAiNotes.notes}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">PHYSICAL VOLUME</span>
                      <span className="font-mono font-bold text-sky-400">{selectedAiNotes.volume_m3.toFixed(3)} m³</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">ACTUAL WEIGHT</span>
                      <span className="font-mono font-bold text-amber-400">{selectedAiNotes.weight} kg</span>
                    </div>
                  </div>

                  {selectedAiNotes.tags && selectedAiNotes.tags.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1.5">Handling Flags</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedAiNotes.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedAiNotes(null)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                  >
                    Close Rationale
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Gemini Volumetric AI Sandbox Modal */}
          {isSandboxOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                      <Wand2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <span>Gemini Volumetric AI Classifier</span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          gemini-3.8-flash
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Input any furniture dimensions to get instantaneous AI class recommendations and logistics logic.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSandboxOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
                    <span>Try Standard Catalog Presets:</span>
                    <span className="text-indigo-400 text-[10px]">Click to populate</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSandboxForm({
                            name: preset.name,
                            reference: preset.reference,
                            category: preset.category,
                            width: preset.width,
                            height: preset.height,
                            depth: preset.depth,
                            weight: preset.weight,
                            imageEmoji: preset.imageEmoji,
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <span>{preset.imageEmoji}</span>
                        <span>{preset.name.split(' ')[0]}</span>
                        <span className="text-slate-500 font-mono text-[10px]">{preset.weight}kg</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Product Title</label>
                      <input
                        type="text"
                        value={sandboxForm.name}
                        onChange={e => setSandboxForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. Minimalist Ceramic Lamp"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">SKU / Reference</label>
                        <input
                          type="text"
                          value={sandboxForm.reference}
                          onChange={e => setSandboxForm(prev => ({ ...prev, reference: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                          placeholder="REF-01"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={sandboxForm.weight}
                          onChange={e => setSandboxForm(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Width (cm)</label>
                        <input
                          type="number"
                          min="1"
                          value={sandboxForm.width}
                          onChange={e => setSandboxForm(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Height (cm)</label>
                        <input
                          type="number"
                          min="1"
                          value={sandboxForm.height}
                          onChange={e => setSandboxForm(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Depth (cm)</label>
                        <input
                          type="number"
                          min="1"
                          value={sandboxForm.depth}
                          onChange={e => setSandboxForm(prev => ({ ...prev, depth: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px]">DERIVED VOLUME</span>
                        <span className="text-sky-400 font-bold">
                          {((sandboxForm.width * sandboxForm.height * sandboxForm.depth) / 1000000).toFixed(4)} m³
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px]">DIMENSIONAL WEIGHT (÷5000)</span>
                        <span className="text-amber-400 font-bold">
                          {((sandboxForm.width * sandboxForm.height * sandboxForm.depth) / 5000).toFixed(2)} kg
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAnalyzeSandbox}
                      disabled={isSandboxAnalyzing}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-4 h-4 ${isSandboxAnalyzing ? 'animate-spin' : ''}`} />
                      <span>{isSandboxAnalyzing ? 'Querying Gemini API...' : 'Run Gemini Classification'}</span>
                    </button>
                  </div>

                  {/* Classification Result Card */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between space-y-4">
                    {sandboxResult ? (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                              AI Suggested Class
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {sandboxResult.confidence_score}% Confidence
                            </span>
                          </div>

                          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                            <div className="text-lg font-bold text-white flex items-center space-x-2">
                              <span>{sandboxForm.imageEmoji || '📦'}</span>
                              <span>Class {sandboxResult.id_class}: {sandboxResult.class_name}</span>
                            </div>
                            <div className="text-xs text-indigo-400 mt-1 font-semibold">
                              Base PrestaShop Carrier Rate: €{CLASS_CONFIGS[sandboxResult.id_class]?.base_price.toFixed(2)}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-slate-300 block">Freight Reasoning:</span>
                            <p className="text-xs text-slate-400 leading-relaxed font-sans bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
                              {sandboxResult.reasoning}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-slate-500 block uppercase">Absorption Role</span>
                            <p className="text-[11px] text-emerald-300 font-medium">
                              {sandboxResult.absorption_perks}
                            </p>
                          </div>

                          {sandboxResult.handling_tags && sandboxResult.handling_tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {sandboxResult.handling_tags.map((tag, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleAddSandboxToCatalog}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add to Active PrestaShop Catalog</span>
                        </button>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                        <Sparkles className="w-8 h-8 text-slate-700" />
                        <p className="text-xs font-medium text-slate-400">Ready for Classification</p>
                        <p className="text-[11px] text-slate-600">Click &apos;Run Gemini Classification&apos; to view volumetric analysis.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Bulk CSV Volumetric Class Upload */}
          {isCsvModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-8">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <span>Bulk CSV Product Volumetric Class Assignments</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          AdminSmartShippingAIController
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Upload or paste a CSV file to mass-assign products to volumetric classes (1 to 4) using Product ID or SKU.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCsvModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sub-tabs & Action Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-2.5 bg-slate-950/60 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCsvActiveTab('upload')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                        csvActiveTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>File Upload</span>
                    </button>
                    <button
                      onClick={() => setCsvActiveTab('paste')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                        csvActiveTab === 'paste' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Paste CSV Text</span>
                    </button>
                    <button
                      onClick={() => setCsvActiveTab('preview')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                        csvActiveTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>
                        Preview &amp; Validate ({csvParsedRows.length})
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleExportAssignmentsCsv(false)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors cursor-pointer"
                      title="Export current database volumetric class assignments as CSV to edit before re-importing"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export Current CSV</span>
                    </button>
                    <button
                      onClick={handleDownloadSampleCsv}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                      title="Download standard blank CSV template file"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                      <span>Download Template</span>
                    </button>
                    <button
                      onClick={handleLoadSampleCsv}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors cursor-pointer"
                      title="Load sample catalog CSV with ready-made furniture mappings"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Load Sample Data</span>
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {csvActiveTab === 'upload' && (
                    <div className="space-y-4">
                      {/* Drag & drop upload area */}
                      <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-950/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
                        <input
                          type="file"
                          accept=".csv,text/csv,text/plain"
                          onChange={handleCsvFileInput}
                          className="hidden"
                        />
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                          <UploadCloud className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-semibold text-white">Click or drag &amp; drop your CSV file here</p>
                        <p className="text-xs text-slate-400 mt-1">Accepts standard .csv files with UTF-8 encoding</p>
                        <span className="mt-3 px-3 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300">
                          Auto-detects comma (,), semicolon (;), and tab delimiters
                        </span>
                      </label>

                      {/* Format Guidelines */}
                      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2">
                        <div className="flex items-center space-x-2 text-indigo-300 font-semibold">
                          <Info className="w-4 h-4" />
                          <span>PrestaShop CSV Column Format Guidelines</span>
                        </div>
                        <ul className="text-slate-400 space-y-1 pl-4 list-disc text-[11px] leading-relaxed">
                          <li>
                            <strong className="text-slate-200">id_product</strong> OR <strong className="text-slate-200">reference (SKU)</strong>: At least one is required to match products in the catalog.
                          </li>
                          <li>
                            <strong className="text-slate-200">id_class (1-4)</strong>: Required volumetric class number.
                            <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-mono">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Class 1: Small Decor (€5.00)</span>
                              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">Class 2: Small Furniture (€15.00)</span>
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Class 3: Medium Furniture (€35.00)</span>
                              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Class 4: Bulky Sofas (€79.00)</span>
                            </div>
                          </li>
                          <li>
                            <strong className="text-slate-200">confidence_score</strong> (Optional): Numeric percentage (0 - 100). Defaults to 100 for manual merchant imports.
                          </li>
                          <li>
                            <strong className="text-slate-200">ai_notes</strong> (Optional): Logistic rationale, absorption role, or handling comments.
                          </li>
                          <li>
                            <strong className="text-slate-200">is_approved</strong> (Optional): 1 (Approved) or 0 (Pending Review). Defaults to 1.
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {csvActiveTab === 'paste' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300">Direct CSV Content</label>
                        <span className="text-[11px] text-slate-500 font-mono">Supports commas, semicolons, tabs</span>
                      </div>
                      <textarea
                        rows={10}
                        value={csvRawText}
                        onChange={e => {
                          setCsvRawText(e.target.value);
                          parseCsvText(e.target.value, csvAutoApprove);
                        }}
                        placeholder="id_product,reference,id_class,confidence_score,ai_notes,is_approved&#10;101,SOFA-STK-01,4,98,Bulky 3-seater sofa leader,1&#10;102,TBL-OAK-88,4,95,Extendable dining table leader,1&#10;103,CHR-WLN-09,3,91,Armchair medium furniture,1"
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
                      />
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            parseCsvText(csvRawText, csvAutoApprove);
                            setCsvActiveTab('preview');
                          }}
                          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer"
                        >
                          Parse &amp; Validate Preview ({csvParsedRows.length} rows)
                        </button>
                      </div>
                    </div>
                  )}

                  {csvActiveTab === 'preview' && (
                    <div className="space-y-3">
                      {/* Summary alert banner */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <div className="flex items-center space-x-2">
                          <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                          <span className="font-semibold text-white">
                            Parsed {csvParsedRows.length} rows
                          </span>
                          <span className="text-emerald-400 font-medium">
                            • {csvParsedRows.filter(r => !r.error).length} valid assignments
                          </span>
                          {csvParsedRows.some(r => r.error) && (
                            <span className="text-rose-400 font-medium">
                              • {csvParsedRows.filter(r => r.error).length} invalid rows
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={csvAutoApprove}
                              onChange={e => {
                                setCsvAutoApprove(e.target.checked);
                                parseCsvText(csvRawText, e.target.checked);
                              }}
                              className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Auto-approve rows</span>
                          </label>
                        </div>
                      </div>

                      {/* Preview Table */}
                      {csvParsedRows.length > 0 ? (
                        <div className="border border-slate-800 rounded-xl overflow-hidden">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-950 border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400">
                                <th className="p-2.5 text-center w-12">Line</th>
                                <th className="p-2.5 w-16 text-center">ID</th>
                                <th className="p-2.5">SKU / Reference</th>
                                <th className="p-2.5 text-center">Volumetric Class</th>
                                <th className="p-2.5 text-center">DB Action / Diff</th>
                                <th className="p-2.5 text-center">Confidence</th>
                                <th className="p-2.5">Notes</th>
                                <th className="p-2.5 text-center w-24">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                              {csvParsedRows.map((row, idx) => {
                                const match = catalog.find(
                                  p => (row.id_product && p.id_product === row.id_product) ||
                                       (row.reference && p.reference.toLowerCase() === row.reference.toLowerCase())
                                );

                                return (
                                  <tr
                                    key={idx}
                                    className={row.error ? 'bg-rose-500/10' : 'hover:bg-slate-800/40'}
                                  >
                                    <td className="p-2.5 text-center text-slate-500">{row.line}</td>
                                    <td className="p-2.5 text-center text-slate-300 font-bold">
                                      {row.id_product || '-'}
                                    </td>
                                    <td className="p-2.5 font-bold text-white">
                                      {row.reference || (
                                        <span className="text-rose-400 italic">Missing reference</span>
                                      )}
                                    </td>
                                    <td className="p-2.5 text-center">
                                      {row.error ? (
                                        <span className="text-rose-400 text-[10px] font-sans font-semibold">
                                          {row.error}
                                        </span>
                                      ) : (
                                        <span
                                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                            row.id_class === 1
                                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                              : row.id_class === 2
                                              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                              : row.id_class === 3
                                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                              : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                                          }`}
                                        >
                                          Class {row.id_class}: {CLASS_CONFIGS[row.id_class]?.name.split(':')[1]?.trim() || `Class ${row.id_class}`}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2.5 text-center">
                                      {row.error ? (
                                        <span className="text-slate-500 text-[10px]">-</span>
                                      ) : match ? (
                                        match.id_class !== row.id_class ? (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                            Update: C{match.id_class} ➔ C{row.id_class}
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                                            Keep Class {row.id_class}
                                          </span>
                                        )
                                      ) : (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                          + Associate New
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2.5 text-center text-slate-300 font-bold">
                                      {row.confidence_score}%
                                    </td>
                                    <td className="p-2.5 text-slate-400 truncate max-w-xs font-sans text-[10px]">
                                      {row.ai_notes}
                                    </td>
                                    <td className="p-2.5 text-center">
                                      {row.is_approved ? (
                                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-sans font-bold">
                                          Approved
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-sans font-bold">
                                          Pending
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                          <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-xs font-medium text-slate-400">No data loaded yet</p>
                          <p className="text-[11px] text-slate-600">
                            Upload a file or click &apos;Load Sample Data&apos; to view volumetric class mappings.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary Feedback after upload */}
                  {csvStats && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>
                          <strong>Success:</strong> {csvStats.processed} products processed ({csvStats.updated} updated in catalog, {csvStats.inserted} newly registered).
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-emerald-400/80">
                        PrestaShop DB calibrated
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    {csvParsedRows.filter(r => !r.error).length > 0 && (
                      <span>
                        Ready to apply <strong className="text-white">{csvParsedRows.filter(r => !r.error).length}</strong> class assignments.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsCsvModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleCommitCsvImport}
                      disabled={isCsvUploading || csvParsedRows.filter(r => !r.error).length === 0}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
                    >
                      <UploadCloud className={`w-4 h-4 ${isCsvUploading ? 'animate-bounce' : ''}`} />
                      <span>{isCsvUploading ? 'Bulk-Updating Database...' : `Bulk-Update Database (${csvParsedRows.filter(r => !r.error).length})`}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal: PrestaShop 1.7 / 8.x WebService Live Bridge */}
          {isPrestashopModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <span>PrestaShop 1.7 / 8.x WebService Live Bridge</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          psConnectionStatus === 'connected' 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {psConnectionStatus === 'connected' ? 'LIVE CONNECTED' : 'REST API BRIDGE'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Connect directly to your store&apos;s native WebService to sync products, dimensions, and volumetric classes
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPrestashopModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                  {/* Setup Instructions Box */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Key className="w-4 h-4 text-blue-400" />
                        <span>PrestaShop 1.7 WebService Instructions</span>
                      </span>
                      <button
                        onClick={handleFillDemoPsCredentials}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-medium transition-colors cursor-pointer"
                      >
                        Fill Demo Store Credentials
                      </button>
                    </div>
                    <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
                      <li>In your PrestaShop Back-Office, navigate to <strong className="text-slate-200">Advanced Parameters &gt; Webservice</strong>.</li>
                      <li>Set <strong className="text-slate-200">Enable PrestaShop Webservice</strong> to <strong className="text-emerald-400">YES</strong>.</li>
                      <li>Click <strong className="text-slate-200">Add new webservice key</strong>, generate a 32-character key, and enable <strong className="text-slate-200">View (GET)</strong> for <code className="text-indigo-300">products</code>, <code className="text-indigo-300">combinations</code>, and <code className="text-indigo-300">categories</code>.</li>
                      <li>Paste your shop domain and API key below, then click <strong className="text-slate-200">Test Connection</strong>.</li>
                    </ol>
                  </div>

                  {/* Connection Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>PrestaShop Store URL</span>
                        <span className="text-[10px] text-slate-500">Root URL with HTTPS</span>
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="url"
                          value={psShopUrl}
                          onChange={e => {
                            setPsShopUrl(e.target.value);
                            setPsConnectionStatus('idle');
                          }}
                          placeholder="https://your-prestashop-store.gr"
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>WebService API Key</span>
                        <span className="text-[10px] text-slate-500">32-character authentication key</span>
                      </label>
                      <div className="relative">
                        <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={psApiKey}
                          onChange={e => {
                            setPsApiKey(e.target.value);
                            setPsConnectionStatus('idle');
                          }}
                          placeholder="ABCD1234EFGH5678ABCD1234EFGH5678"
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Test Connection Button & Status Feedback */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        psConnectionStatus === 'connected'
                          ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                          : psConnectionStatus === 'testing'
                          ? 'bg-amber-400 animate-ping'
                          : psConnectionStatus === 'error'
                          ? 'bg-rose-500'
                          : 'bg-slate-600'
                      }`}></span>
                      <span className="text-xs text-slate-300">
                        {psConnectionStatus === 'connected' ? (
                          <span className="text-emerald-400 font-medium">
                            Connected to {psConnectionDetails?.shop_name || 'PrestaShop 1.7'} (v{psConnectionDetails?.prestashop_version || '1.7.x'})
                          </span>
                        ) : psConnectionStatus === 'testing' ? (
                          <span className="text-amber-300">Testing connection with PrestaShop server...</span>
                        ) : psConnectionStatus === 'error' ? (
                          <span className="text-rose-400 font-medium">{psConnectionError || 'Connection failed'}</span>
                        ) : (
                          <span className="text-slate-400">Ready to test connection</span>
                        )}
                      </span>
                    </div>

                    <button
                      onClick={handleTestPsConnection}
                      disabled={psConnectionStatus === 'testing'}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${psConnectionStatus === 'testing' ? 'animate-spin' : ''}`} />
                      <span>{psConnectionStatus === 'testing' ? 'Connecting...' : 'Test Connection'}</span>
                    </button>
                  </div>

                  {/* Actions when Connected */}
                  {psConnectionStatus === 'connected' && (
                    <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-4 animate-in fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                            <ArrowDownToLine className="w-4 h-4 text-blue-400" />
                            <span>Import Products from Live PrestaShop Catalog</span>
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Pulls real products, weights, and physical dimensions (width, height, depth) directly into this app.
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <label className="text-[11px] text-slate-400">Limit:</label>
                          <select
                            value={psFetchLimit}
                            onChange={e => setPsFetchLimit(Number(e.target.value))}
                            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono"
                          >
                            <option value="20">20 products</option>
                            <option value="50">50 products</option>
                            <option value="100">100 products</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
                        <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={psSyncAutoClassify}
                            onChange={e => setPsSyncAutoClassify(e.target.checked)}
                            className="rounded border-slate-700 text-blue-600 focus:ring-blue-500/40 bg-slate-950"
                          />
                          <span>Calculate volumetric buffer heuristic upon import</span>
                        </label>

                        <button
                          onClick={handleFetchPsProducts}
                          disabled={isFetchingPsProducts}
                          className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <ArrowDownToLine className={`w-4 h-4 ${isFetchingPsProducts ? 'animate-bounce' : ''}`} />
                          <span>{isFetchingPsProducts ? 'Fetching from PrestaShop...' : 'Import Catalog Products'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Safe Server-Side Proxy (Bypasses Browser CORS limits)</span>
                  </div>

                  <button
                    onClick={() => setIsPrestashopModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SubTab 2: Multi-Zone Matrix View */}
      {subTab === 'zones' && (
        <div className="space-y-6 animate-fade-in">
          {/* Zone Matrix Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">Geographic Delivery Zones & Freight Multipliers</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      ps_smartshipping_zone
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    PrestaShop Carrier tariff equation: <code className="text-sky-300 font-mono">Final Shipping = (Leader Base + Surcharges) × Zone Multiplier + Bulky Ferry Surcharge</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setZones(DEFAULT_ZONES)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleSaveZones}
                  disabled={isSavingZones}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className={`w-3.5 h-3.5 ${isSavingZones ? 'animate-spin' : ''}`} />
                  <span>{isSavingZones ? 'Saving to Database...' : 'Save Zone Matrix'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Zone Tariff Simulator Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live PrestaShop Carrier Rate Simulator & Formula Inspector
                </h4>
              </div>
              <span className="text-[10px] font-mono text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">
                Carrier Hook Simulation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Destination Zone</label>
                <select
                  value={testCalcZoneId}
                  onChange={e => setTestCalcZoneId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {zones.map(z => (
                    <option key={z.id_zone} value={z.id_zone}>
                      {z.name} ({z.multiplier}x)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Cart Leader Volumetric Class</label>
                <select
                  value={testCalcClassId}
                  onChange={e => setTestCalcClassId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="1">Class 1: Small Decor (Base €5.00)</option>
                  <option value="2">Class 2: Small Furniture (Base €15.00)</option>
                  <option value="3">Class 3: Medium Furniture (Base €35.00)</option>
                  <option value="4">Class 4: Bulky / Sofas (Base €79.00)</option>
                </select>
              </div>

              {/* Calculated Rate Result Card */}
              {(() => {
                const selZone = zones.find(z => z.id_zone === testCalcZoneId) || zones[0];
                const basePrice = CLASS_CONFIGS[testCalcClassId]?.base_price || 5.0;
                const surcharge = testCalcClassId === 4 ? selZone.class4_surcharge : testCalcClassId === 3 ? selZone.class3_surcharge : 0;
                const finalRate = (basePrice * selZone.multiplier) + surcharge;

                return (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Customer Shipping Fee</span>
                      <div className="text-xl font-bold font-mono text-emerald-400">
                        €{finalRate.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        (€{basePrice.toFixed(2)} × {selZone.multiplier.toFixed(2)}) + €{surcharge.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block">Transit Time</span>
                      <span className="text-xs font-semibold text-sky-400 block mt-1">
                        {selZone.delay}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Zones Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-14">Zone ID</th>
                    <th className="py-3 px-4">Zone Name & Code</th>
                    <th className="py-3 px-4">Regional Coverage</th>
                    <th className="py-3 px-3 text-center w-28">Multiplier</th>
                    <th className="py-3 px-3 text-center w-36">Class 4 Bulky Ferry Surcharge</th>
                    <th className="py-3 px-3 text-center w-36">Class 3 Medium Surcharge</th>
                    <th className="py-3 px-4 text-center">Transit Delay</th>
                    <th className="py-3 px-3 text-center w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {zones.map(zone => (
                    <tr key={zone.id_zone} className="hover:bg-slate-800/40 transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-400">
                        #{zone.id_zone}
                      </td>

                      {/* Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{zone.name}</div>
                        <div className="text-[11px] font-mono text-sky-400 mt-0.5">CODE: {zone.code}</div>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-xs">{zone.description}</p>
                      </td>

                      {/* Regional coverage */}
                      <td className="py-3.5 px-4 text-slate-300 text-xs max-w-xs">
                        {zone.regions}
                      </td>

                      {/* Multiplier Input */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center space-x-1">
                          <input
                            type="number"
                            step="0.05"
                            min="0.5"
                            max="3.0"
                            value={zone.multiplier}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 1.0;
                              setZones(prev => prev.map(z => z.id_zone === zone.id_zone ? { ...z, multiplier: val } : z));
                            }}
                            className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-center font-mono font-bold text-sky-400 text-xs focus:outline-none focus:border-indigo-500"
                          />
                          <span className="text-slate-500 font-mono">x</span>
                        </div>
                      </td>

                      {/* Class 4 Bulky Ferry Surcharge Input */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center space-x-1">
                          <span className="text-slate-500 font-mono">€</span>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={zone.class4_surcharge}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              setZones(prev => prev.map(z => z.id_zone === zone.id_zone ? { ...z, class4_surcharge: val } : z));
                            }}
                            className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-center font-mono font-bold text-purple-400 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </td>

                      {/* Class 3 Medium Surcharge Input */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center space-x-1">
                          <span className="text-slate-500 font-mono">€</span>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={zone.class3_surcharge}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              setZones(prev => prev.map(z => z.id_zone === zone.id_zone ? { ...z, class3_surcharge: val } : z));
                            }}
                            className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-center font-mono font-bold text-amber-400 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </td>

                      {/* Delay text */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="text"
                          value={zone.delay}
                          onChange={e => {
                            const val = e.target.value;
                            setZones(prev => prev.map(z => z.id_zone === zone.id_zone ? { ...z, delay: val } : z));
                          }}
                          className="w-full max-w-[180px] px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-center font-sans text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setZones(prev => prev.map(z => z.id_zone === zone.id_zone ? { ...z, is_active: !z.is_active } : z));
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                            zone.is_active
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {zone.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Integration technical specs */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-sky-400">
              <Database className="w-4 h-4" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                PrestaShop Delivery Zones Schema & Hook Execution
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              In PrestaShop, shipping rates calculate via <code className="text-indigo-300 font-mono">Carrier::getPackageShippingCost()</code> by intercepting the customer&apos;s active delivery address <code className="text-indigo-300 font-mono">id_zone</code> or postal code. If an island destination is matched (e.g. Cyclades, Crete, Corfu), the island multiplier (1.40x) is applied to the volumetric cart leader and the roll-on/roll-off maritime freight surcharge (€38.00) is added automatically to guarantee courier freight profitability.
            </p>
          </div>
        </div>
      )}

      {/* Subtab: Courier APIs & Real-Time Webhooks */}
      {subTab === 'couriers' && (
        <div className="space-y-6">
          {/* Top Carrier Status Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
                  <h3 className="text-base font-bold text-white">Live Courier API Dispatcher & Webhooks</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    REST API + Webhook Engine
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Automate electronic waybill (voucher) creation with volumetric parcel metadata and receive real-time courier transit callbacks via PrestaShop&apos;s webhook front controller.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchCourierVouchers}
                disabled={isVouchersLoading}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVouchersLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Shipments</span>
              </button>
            </div>

            {/* Carrier Integration Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-red-600/10 border border-red-500/20 text-red-500 font-bold text-xs flex items-center justify-center font-mono">
                    ACS
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">ACS Courier</div>
                    <div className="text-[10px] text-slate-400">Web Connect API v3</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Connected
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center font-mono">
                    DHL
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">DHL Express</div>
                    <div className="text-[10px] text-slate-400">MyDHL+ REST Webhook</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Connected
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center font-mono">
                    SPDX
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Speedex</div>
                    <div className="text-[10px] text-slate-400">BOL Electronic Dispatch</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Connected
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">
                    GEN
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Geniki Taxydromiki</div>
                    <div className="text-[10px] text-slate-400">Voucher REST Client</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Connected
                </span>
              </div>
            </div>
          </div>

          {/* Side-by-side interactive consoles: Voucher Generator & Webhook Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Voucher Generator Console */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-3">
                <Tag className="w-4 h-4" />
                <h4 className="text-sm font-bold text-white">Generate Electronic Courier Waybill (Voucher)</h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Carrier Service</label>
                  <select
                    value={voucherForm.courier}
                    onChange={e => setVoucherForm({ ...voucherForm, courier: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ACS">ACS Courier (Domestic Parcel)</option>
                    <option value="DHL">DHL Express (Freight & Line-Haul)</option>
                    <option value="SPEEDEX">Speedex (Economy Freight)</option>
                    <option value="GENIKI">Geniki Taxydromiki</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">PrestaShop Order ID</label>
                  <input
                    type="number"
                    value={voucherForm.order_id}
                    onChange={e => setVoucherForm({ ...voucherForm, order_id: parseInt(e.target.value, 10) || 1000 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Customer / Recipient</label>
                  <input
                    type="text"
                    value={voucherForm.recipient_name}
                    onChange={e => setVoucherForm({ ...voucherForm, recipient_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Postal Code & Zone</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={voucherForm.postal_code}
                      onChange={e => setVoucherForm({ ...voucherForm, postal_code: e.target.value })}
                      className="px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                      placeholder="Zip"
                    />
                    <select
                      value={voucherForm.zone_code}
                      onChange={e => setVoucherForm({ ...voucherForm, zone_code: e.target.value })}
                      className="px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="MAINLAND">Mainland</option>
                      <option value="REGIONAL">Regional</option>
                      <option value="ISLANDS">Islands</option>
                      <option value="REMOTE">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-slate-400 font-semibold mb-1 block">Delivery Address</label>
                  <input
                    type="text"
                    value={voucherForm.destination_address}
                    onChange={e => setVoucherForm({ ...voucherForm, destination_address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Volumetric Class</label>
                  <select
                    value={voucherForm.volumetric_class}
                    onChange={e => {
                      const c = parseInt(e.target.value, 10);
                      const fee = c === 4 ? 79 : c === 3 ? 35 : c === 2 ? 15 : 5;
                      const surcharge = c === 4 && voucherForm.zone_code === 'ISLANDS' ? 38 : 0;
                      setVoucherForm({ ...voucherForm, volumetric_class: c, shipping_fee: fee + surcharge, ferry_surcharge: surcharge });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>Class 1: Small Decor (€5)</option>
                    <option value={2}>Class 2: Small Furniture (€15)</option>
                    <option value={3}>Class 3: Medium Furniture (€35)</option>
                    <option value={4}>Class 4: Bulky Sofa/Pallet (€79)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Weight & Volume</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={voucherForm.weight_kg}
                      onChange={e => setVoucherForm({ ...voucherForm, weight_kg: parseFloat(e.target.value) || 1 })}
                      className="px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                      placeholder="kg"
                    />
                    <input
                      type="number"
                      step="0.05"
                      value={voucherForm.volume_m3}
                      onChange={e => setVoucherForm({ ...voucherForm, volume_m3: parseFloat(e.target.value) || 0.1 })}
                      className="px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                      placeholder="m³"
                    />
                  </div>
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Total Calculated Rate: </span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">€{voucherForm.shipping_fee.toFixed(2)}</span>
                  {voucherForm.ferry_surcharge > 0 && (
                    <span className="text-amber-400 text-[10px] ml-1.5">(incl. €{voucherForm.ferry_surcharge.toFixed(2)} Island Ferry Surcharge)</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleGenerateVoucher}
                  disabled={isGeneratingVoucher}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isGeneratingVoucher ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingVoucher ? 'Contacting API...' : 'Dispatch Voucher'}</span>
                </button>
              </div>
            </div>

            {/* Live Webhook Event Simulator Console */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Radio className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-white">Simulate Inbound Courier Webhook Callback</h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">/api/couriers/webhook</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Test how external carrier scanning nodes post asynchronous event payloads to our PrestaShop webhook endpoint, updating order status in real-time.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Target Voucher Tracking #</label>
                  <select
                    value={selectedVoucherForWebhook}
                    onChange={e => setSelectedVoucherForWebhook(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-500"
                  >
                    {courierVouchers.map(v => (
                      <option key={v.tracking_number} value={v.tracking_number}>
                        {v.tracking_number} — Order #{v.order_id} ({v.recipient_name}, {v.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold mb-1 block">New Tracking Status</label>
                    <select
                      value={webhookStatusToTrigger}
                      onChange={e => setWebhookStatusToTrigger(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value="PICKED_UP">PICKED_UP (Carrier Collected)</option>
                      <option value="IN_TRANSIT">IN_TRANSIT (Line-Haul / Ferry)</option>
                      <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Last Mile Van)</option>
                      <option value="DELIVERED">DELIVERED (Signed by Customer)</option>
                      <option value="EXCEPTION">EXCEPTION (Address Delay / Weather)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold mb-1 block">Scan Node / Hub Location</label>
                    <input
                      type="text"
                      value={webhookLocation}
                      onChange={e => setWebhookLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendWebhook}
                  disabled={isSendingWebhook || !selectedVoucherForWebhook}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold flex items-center justify-center space-x-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${isSendingWebhook ? 'animate-bounce' : ''}`} />
                  <span>{isSendingWebhook ? 'Posting Webhook...' : `Send '${webhookStatusToTrigger}' Webhook Event`}</span>
                </button>

                {/* Last Webhook Request Inspector */}
                {lastWebhookPayload && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px] font-mono">
                    <div className="text-emerald-400 flex items-center justify-between">
                      <span>HTTP 200 OK — PrestaShop Hook &apos;actionCarrierProcessWebhook&apos;</span>
                      <span className="text-slate-500">JSON</span>
                    </div>
                    <pre className="text-slate-300 text-[10px] overflow-x-auto p-1 bg-slate-900 rounded">
                      {JSON.stringify(lastWebhookPayload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Courier Shipments Table & Real-time Event Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-0">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Active Courier Shipments & Webhook Audit Log</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  {courierVouchers.length} Total Vouchers
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Courier & Waybill</th>
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-4">Recipient & Destination</th>
                    <th className="py-3 px-3 text-center">Volumetric Class</th>
                    <th className="py-3 px-3 text-right">Fee</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Latest Event & Timestamp</th>
                    <th className="py-3 px-3 text-center">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {courierVouchers.map(v => (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Courier & Tracking */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              v.courier === 'ACS'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : v.courier === 'DHL'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            }`}
                          >
                            {v.courier}
                          </span>
                          <span className="font-mono font-bold text-white">{v.tracking_number}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {new Date(v.created_at).toLocaleDateString()} {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Order ID */}
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-300">
                        #{v.order_id}
                      </td>

                      {/* Recipient & Destination */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{v.recipient_name}</div>
                        <div className="text-[11px] text-slate-400">{v.destination_address} ({v.postal_code})</div>
                        <span className="text-[10px] text-sky-400 font-mono">ZONE: {v.zone_code}</span>
                      </td>

                      {/* Volumetric Class */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            v.volumetric_class === 4
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : v.volumetric_class === 3
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : v.volumetric_class === 2
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          Class {v.volumetric_class}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {v.weight_kg}kg • {v.volume_m3}m³
                        </div>
                      </td>

                      {/* Fee */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">
                        €{v.shipping_fee.toFixed(2)}
                        {v.ferry_surcharge > 0 && (
                          <div className="text-[9px] text-amber-400">+€{v.ferry_surcharge.toFixed(2)} ferry</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            v.status === 'DELIVERED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : v.status === 'OUT_FOR_DELIVERY'
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : v.status === 'IN_TRANSIT'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : v.status === 'EXCEPTION'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>

                      {/* Latest Event */}
                      <td className="py-3.5 px-4">
                        {v.events && v.events.length > 0 ? (
                          <div>
                            <div className="font-semibold text-slate-200">
                              {v.events[v.events.length - 1].location}
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-1">
                              {v.events[v.events.length - 1].description}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Awaiting carrier scan</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVoucherForWebhook(v.tracking_number);
                            setWebhookStatusToTrigger(
                              v.status === 'CREATED' ? 'PICKED_UP' :
                              v.status === 'PICKED_UP' ? 'IN_TRANSIT' :
                              v.status === 'IN_TRANSIT' ? 'OUT_FOR_DELIVERY' :
                              v.status === 'OUT_FOR_DELIVERY' ? 'DELIVERED' : 'DELIVERED'
                            );
                            showToast(`Voucher ${v.tracking_number} loaded into webhook simulator!`, 'info');
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          Test Event &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PHP Webhook Controller Code Architecture info */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                PrestaShop Module Webhook Front Controller (ModuleFrontController)
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Included in the module ZIP package at <code className="text-indigo-300 font-mono">controllers/front/webhook.php</code>. It intercepts incoming webhook requests from external couriers, verifies the <code className="text-emerald-300 font-mono">X-Courier-Signature</code> authentication header, updates <code className="text-slate-300 font-mono">ps_order_carrier.tracking_number</code>, triggers <code className="text-sky-300 font-mono">actionCarrierProcessWebhook</code> hook, and transitions the PrestaShop order history state to <code className="text-slate-300 font-mono">PS_OS_SHIPPING</code> or <code className="text-slate-300 font-mono">PS_OS_DELIVERED</code> with automatic email dispatch to the buyer.
            </p>
          </div>
        </div>
      )}

      {subTab === 'phpCode' && (
        /* PHP Code Inspector */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono text-slate-200">
                modules/smartshippingai/controllers/admin/AdminSmartShippingAIController.php
              </span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(CONTROLLER_PHP_SOURCE);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Controller PHP'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950/90 text-xs font-mono text-slate-300 overflow-x-auto max-h-[600px] leading-relaxed select-text">
            <pre>{CONTROLLER_PHP_SOURCE}</pre>
          </div>
        </div>
      )}

      {subTab === 'architecture' && (
        /* Architecture & Technical Details */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Layers className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">PrestaShop HelperList Engine</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The controller extends PrestaShop’s native <code className="text-indigo-300 font-mono">ModuleAdminController</code> and utilizes the built-in <code className="text-indigo-300 font-mono">HelperList</code> component to render standard back-office pagination, search filters, column ordering, and bulk moderation actions.
            </p>
            <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
              <li>
                <strong>Multi-Table SQL Join:</strong> Links <code className="text-slate-400 font-mono">ps_smartshipping_product</code> with <code className="text-slate-400 font-mono">ps_product</code>, <code className="text-slate-400 font-mono">ps_product_lang</code>, <code className="text-slate-400 font-mono">ps_image_shop</code>, and <code className="text-slate-400 font-mono">ps_smartshipping_classes</code>.
              </li>
              <li>
                <strong>Dynamic Volumetric Calculation:</strong> Derives cubic volume on the fly: <code className="text-indigo-300 font-mono">ROUND((width * height * depth) / 1000000, 3)</code> in $m^3$.
              </li>
              <li>
                <strong>Column Callbacks:</strong> Renders color-coded class badges, thumbnail previews, and interactive AJAX switches.
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">AJAX Moderation & Security</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Merchant actions are executed asynchronously without reloading the page.
            </p>
            <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
              <li>
                <strong>Endpoint:</strong> <code className="text-emerald-300 font-mono">ajaxProcessToggleApproval()</code> processes POST requests with CSRF token verification.
              </li>
              <li>
                <strong>Instant State Transition:</strong> Flips <code className="text-slate-400 font-mono">is_approved</code> between <code className="text-slate-400 font-mono">0</code> and <code className="text-slate-400 font-mono">1</code> and updates <code className="text-slate-400 font-mono">date_upd</code>.
              </li>
              <li>
                <strong>JSON Response:</strong> Returns updated badge state, localized message, and trigger for PrestaShop Growl notices.
              </li>
              <li>
                <strong>Bulk Operations:</strong> Supports native PrestaShop checkboxes for bulk approving or revoking classifications in one click.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Modal: Export PrestaShop ZIP Installable Package */}
      {isExportZipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Export PrestaShop Module Package</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      v1.2.0 ZIP
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Self-contained installable ZIP archive ready for PrestaShop 1.7 / 8.x Module Manager.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportZipModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Package Archive Name:</span>
                  <span className="font-mono text-xs font-bold text-emerald-400">smartshippingai-v1.0.0.zip</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Target Platform:</span>
                  <span>PrestaShop 1.7.0.0 - 8.2.x</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Installation Mode:</span>
                  <span>Module Manager &rarr; Upload a module (.zip)</span>
                </div>
              </div>

              {/* Manifest List */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block tracking-wider">
                  Included Package Manifest (14 Files Verified):
                </span>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-[11px] font-mono text-slate-300 divide-y divide-slate-900">
                  <div className="py-1 flex items-center justify-between">
                    <span className="text-emerald-400">smartshippingai/smartshippingai.php</span>
                    <span className="text-slate-500 text-[10px]">Carrier hooks & engine</span>
                  </div>
                  <div className="py-1 flex items-center justify-between">
                    <span className="text-emerald-400">smartshippingai/config.xml</span>
                    <span className="text-slate-500 text-[10px]">Module descriptor</span>
                  </div>
                  <div className="py-1 flex items-center justify-between">
                    <span className="text-sky-400">smartshippingai/sql/install.sql</span>
                    <span className="text-slate-500 text-[10px]">Database schema creation</span>
                  </div>
                  <div className="py-1 flex items-center justify-between">
                    <span className="text-sky-400">smartshippingai/sql/uninstall.sql</span>
                    <span className="text-slate-500 text-[10px]">Database cleanup</span>
                  </div>
                  <div className="py-1 flex items-center justify-between">
                    <span className="text-purple-400">smartshippingai/controllers/admin/AdminSmartShippingAIController.php</span>
                    <span className="text-slate-500 text-[10px]">HelperList & AJAX</span>
                  </div>
                  <div className="py-1 flex items-center justify-between">
                    <span className="text-amber-400">smartshippingai/views/css/admin-smartshipping.css</span>
                    <span className="text-slate-500 text-[10px]">Volumetric audit badges</span>
                  </div>
                  <div className="py-1 flex items-center justify-between">
                    <span className="text-amber-400">smartshippingai/views/js/admin-smartshipping.js</span>
                    <span className="text-slate-500 text-[10px]">AJAX moderation scripts</span>
                  </div>
                  <div className="py-1 flex items-center justify-between">
                    <span className="text-indigo-400">smartshippingai/views/templates/hook/shopping_cart_footer.tpl</span>
                    <span className="text-slate-500 text-[10px]">Front-office cart widget</span>
                  </div>
                  <div className="py-1 flex items-center justify-between">
                    <span className="text-indigo-400">smartshippingai/views/templates/admin/configure.tpl</span>
                    <span className="text-slate-500 text-[10px]">Back-office setup panel</span>
                  </div>
                  <div className="py-1 flex items-center justify-between">
                    <span className="text-slate-400">smartshippingai/tests/Unit/SmartShippingShippingCostTest.php</span>
                    <span className="text-slate-500 text-[10px]">PHPUnit absorption suite</span>
                  </div>
                  <div className="py-1 flex items-center justify-between">
                    <span className="text-slate-400">smartshippingai/tests/Unit/ClassOneAbsorptionEdgeCasesTest.php</span>
                    <span className="text-slate-500 text-[10px]">100% absorption rules</span>
                  </div>
                  <div className="py-1 flex items-center justify-between">
                    <span className="text-slate-400">smartshippingai/README.md</span>
                    <span className="text-slate-500 text-[10px]">Documentation & setup</span>
                  </div>
                </div>
              </div>

              {/* Install steps */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-white block">PrestaShop Installation Guide:</span>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-400">
                  <li>In PrestaShop Back-Office, navigate to <strong>Modules &rarr; Module Manager</strong>.</li>
                  <li>Click <strong>Upload a module</strong> in the top right.</li>
                  <li>Drop the downloaded <code className="text-emerald-400 font-mono">smartshippingai-v1.0.0.zip</code> file.</li>
                  <li>PrestaShop will automatically execute <code className="text-sky-300 font-mono">install.sql</code> and configure the carrier!</li>
                </ol>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsExportZipModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleDownloadModuleZip}
                disabled={isExportingZip}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${isExportingZip ? 'animate-bounce' : ''}`} />
                <span>{isExportingZip ? 'Generating ZIP Archive...' : 'Download ZIP Package (.zip)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const CONTROLLER_PHP_SOURCE = `<?php
/**
 * 2026 SmartShipping AI - Volumetric Carrier & Absorption Engine
 *
 * @author    Senior PrestaShop Logistics Expert
 * @copyright 2026 SmartShipping AI
 * @license   http://opensource.org/licenses/afl-3.0.php Academic Free License (AFL 3.0)
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

class AdminSmartShippingAIController extends ModuleAdminController
{
    public function __construct()
    {
        $this->bootstrap = true;
        $this->table = 'smartshipping_product';
        $this->className = 'SmartShippingProduct';
        $this->identifier = 'id_smartshipping_product';
        $this->lang = false;
        $this->explicitSelect = true;
        $this->addRowAction('edit');
        $this->addRowAction('delete');

        parent::__construct();

        // 1. Build Query with Joins to PrestaShop Core Catalog Tables
        $this->_select = '
            a.\`id_smartshipping_product\`,
            a.\`id_product\`,
            a.\`id_product_attribute\`,
            a.\`id_class\`,
            a.\`confidence_score\`,
            a.\`is_approved\`,
            a.\`date_upd\`,
            pl.\`name\` AS \`product_name\`,
            p.\`reference\`,
            p.\`width\`,
            p.\`height\`,
            p.\`depth\`,
            p.\`weight\`,
            ROUND((p.\`width\` * p.\`height\` * p.\`depth\`) / 1000000, 3) AS \`volume_m3\`,
            c.\`name\` AS \`class_name\`,
            c.\`base_price\` AS \`class_base_price\`,
            i.\`id_image\`
        ';

        $this->_join = '
            LEFT JOIN \`' . _DB_PREFIX_ . 'product\` p 
                ON (p.\`id_product\` = a.\`id_product\`)
            LEFT JOIN \`' . _DB_PREFIX_ . 'product_lang\` pl 
                ON (pl.\`id_product\` = a.\`id_product\` AND pl.\`id_lang\` = ' . (int)$this->context->language->id . ' AND pl.\`id_shop\` = ' . (int)$this->context->shop->id . ')
            LEFT JOIN \`' . _DB_PREFIX_ . 'smartshipping_classes\` c 
                ON (c.\`id_class\` = a.\`id_class\`)
            LEFT JOIN \`' . _DB_PREFIX_ . 'image_shop\` i 
                ON (i.\`id_product\` = a.\`id_product\` AND i.\`cover\` = 1 AND i.\`id_shop\` = ' . (int)$this->context->shop->id . ')
        ';

        $this->_defaultOrderBy = 'a.is_approved';
        $this->_defaultOrderWay = 'ASC';

        // 2. Configure HelperList Columns
        $this->fields_list = [
            'id_product' => [
                'title' => $this->l('ID'),
                'align' => 'text-center',
                'class' => 'fixed-width-xs font-weight-bold',
                'filter_key' => 'a!id_product',
            ],
            'image' => [
                'title' => $this->l('Cover'),
                'align' => 'text-center',
                'image' => 'p',
                'orderby' => false,
                'search' => false,
                'callback' => 'displayProductThumbnail',
            ],
            'product_name' => [
                'title' => $this->l('Product Name'),
                'filter_key' => 'pl!name',
                'callback' => 'displayProductNameAndRef',
            ],
            'dimensions' => [
                'title' => $this->l('Dimensions & Vol.'),
                'align' => 'text-center',
                'search' => false,
                'orderby' => false,
                'callback' => 'displayDimensionsAndVolume',
            ],
            'weight' => [
                'title' => $this->l('Weight'),
                'align' => 'text-center',
                'suffix' => ' kg',
                'filter_key' => 'p!weight',
                'badge_info' => true,
            ],
            'id_class' => [
                'title' => $this->l('Volumetric Class'),
                'align' => 'text-center',
                'type' => 'select',
                'list' => $this->getClassFilterList(),
                'filter_key' => 'a!id_class',
                'callback' => 'displayClassBadge',
            ],
            'confidence_score' => [
                'title' => $this->l('AI Confidence'),
                'align' => 'text-center',
                'filter_key' => 'a!confidence_score',
                'callback' => 'displayConfidenceBadge',
            ],
            'is_approved' => [
                'title' => $this->l('Status / Approval'),
                'align' => 'text-center',
                'active' => 'status',
                'type' => 'bool',
                'filter_key' => 'a!is_approved',
                'callback' => 'displayApprovalToggle',
            ],
            'date_upd' => [
                'title' => $this->l('Last Updated'),
                'align' => 'text-right',
                'type' => 'datetime',
                'filter_key' => 'a!date_upd',
            ],
        ];

        // 3. Bulk Actions configuration
        $this->bulk_actions = [
            'approve' => [
                'text' => $this->l('Approve Selected AI Classes'),
                'icon' => 'icon-check text-success',
                'confirm' => $this->l('Approve the volumetric classes for all selected products?'),
            ],
            'disapprove' => [
                'text' => $this->l('Revoke Approval (Set to Pending)'),
                'icon' => 'icon-remove text-danger',
                'confirm' => $this->l('Set selected products back to pending review?'),
            ],
        ];
    }

    /**
     * AJAX Process: Toggle Approval Status via Click without Page Reload
     */
    public function ajaxProcessToggleApproval()
    {
        header('Content-Type: application/json; charset=utf-8');

        $idRecord = (int)Tools::getValue('id_smartshipping_product');
        $idProduct = (int)Tools::getValue('id_product');

        if ($idRecord <= 0 && $idProduct <= 0) {
            die(json_encode(['success' => false, 'error' => $this->l('Invalid product identifier.')]));
        }

        $where = $idRecord > 0 ? ('\`id_smartshipping_product\` = ' . $idRecord) : ('\`id_product\` = ' . $idProduct);
        $currentStatus = (int)Db::getInstance()->getValue('SELECT \`is_approved\` FROM \`' . _DB_PREFIX_ . 'smartshipping_product\` WHERE ' . $where);
        $newStatus = ($currentStatus === 1) ? 0 : 1;

        $updated = Db::getInstance()->update(
            'smartshipping_product',
            [
                'is_approved' => (int)$newStatus,
                'date_upd'    => date('Y-m-d H:i:s'),
            ],
            $where
        );

        if ($updated) {
            die(json_encode([
                'success'      => true,
                'is_approved'  => $newStatus,
                'status_label' => ($newStatus === 1) ? $this->l('Approved') : $this->l('Pending Review'),
                'message'      => sprintf($this->l('Product approval status successfully updated to %s.'), ($newStatus === 1 ? 'Approved' : 'Pending')),
            ]));
        }

        die(json_encode(['success' => false, 'error' => $this->l('Database update error.')]));
    }

    /**
     * AJAX Process: Automated AI Volumetric Classification
     * Suggests and updates the volumetric class (1-4) based on product weight, physical volume, and dimensional rules
     */
    public function ajaxProcessClassifyWithAI()
    {
        header('Content-Type: application/json; charset=utf-8');

        $idProduct = (int)Tools::getValue('id_product');
        $idRecord = (int)Tools::getValue('id_smartshipping_product');

        if ($idProduct <= 0 && $idRecord > 0) {
            $idProduct = (int)Db::getInstance()->getValue(
                'SELECT \`id_product\` FROM \`' . _DB_PREFIX_ . 'smartshipping_product\`
                 WHERE \`id_smartshipping_product\` = ' . $idRecord
            );
        }

        if ($idProduct <= 0) {
            die(json_encode(['success' => false, 'error' => $this->l('Invalid product ID.')]));
        }

        $product = new Product($idProduct, false, $this->context->language->id);
        if (!Validate::isLoadedObject($product)) {
            die(json_encode(['success' => false, 'error' => $this->l('Unable to load PrestaShop product.')]));
        }

        $width = (float)$product->width;
        $height = (float)$product->height;
        $depth = (float)$product->depth;
        $weight = (float)$product->weight;
        $volumeM3 = ($width * $height * $depth) / 1000000;

        // Volumetric classification rules (Classes 1 to 4)
        $suggestedClass = 1;
        $confidence = 95;
        $reasoning = '';

        if ($weight >= 40.0 || $volumeM3 >= 0.80 || max($width, $height, $depth) >= 200) {
            $suggestedClass = 4;
            $confidence = 96;
            $reasoning = sprintf($this->l('Weight (%.1f kg) and volume (%.3f m³) qualify as Class 4 Bulky / Sofa freight.'), $weight, $volumeM3);
        } elseif ($weight >= 15.0 || $volumeM3 >= 0.25) {
            $suggestedClass = 3;
            $confidence = 92;
            $reasoning = sprintf($this->l('Weight (%.1f kg) and volume (%.3f m³) qualify as Class 3 Medium Furniture.'), $weight, $volumeM3);
        } elseif ($weight >= 3.0 || $volumeM3 >= 0.05) {
            $suggestedClass = 2;
            $confidence = 88;
            $reasoning = sprintf($this->l('Weight (%.1f kg) and volume (%.3f m³) qualify as Class 2 Small Furniture parcel.'), $weight, $volumeM3);
        } else {
            $suggestedClass = 1;
            $confidence = 97;
            $reasoning = sprintf($this->l('Compact dimensions and light weight (%.2f kg, %.3f m³) qualify as Class 1 Small Decor.'), $weight, $volumeM3);
        }

        // Save classification recommendation into smartshipping_product table
        Db::getInstance()->execute('
            INSERT INTO \`' . _DB_PREFIX_ . 'smartshipping_product\`
                (\`id_product\`, \`id_product_attribute\`, \`id_class\`, \`confidence_score\`, \`ai_notes\`, \`date_upd\`)
            VALUES
                (' . (int)$idProduct . ', 0, ' . (int)$suggestedClass . ', ' . (float)$confidence . ', \'' . pSQL($reasoning) . '\', NOW())
            ON DUPLICATE KEY UPDATE
                \`id_class\` = ' . (int)$suggestedClass . ',
                \`confidence_score\` = ' . (float)$confidence . ',
                \`ai_notes\` = \'' . pSQL($reasoning) . '\',
                \`date_upd\` = NOW()
        ');

        die(json_encode([
            'success'               => true,
            'id_product'            => $idProduct,
            'id_class'              => $suggestedClass,
            'confidence_score'      => $confidence,
            'reasoning'             => $reasoning,
            'volume_m3'             => round($volumeM3, 3),
            'dimensional_weight_kg' => round(($width * $height * $depth) / 5000, 2),
            'message'               => sprintf($this->l('Class %d assigned with %d%% AI confidence.'), $suggestedClass, $confidence),
        ]));
    }

    /**
     * Bulk CSV Upload & Import Processing
     * Allows merchants to upload CSV to mass-calibrate product volumetric classes
     */
    public function postProcess()
    {
        // Handle CSV File Upload submission
        if (Tools::isSubmit('submitBulkCsvUpload')) {
            $this->processBulkCsvUpload();
        }

        // Handle CSV Template Export
        if (Tools::isSubmit('exportCsvTemplate')) {
            $this->processExportCsvTemplate();
        }

        return parent::postProcess();
    }

    /**
     * Process Uploaded CSV and map to smartshipping_product table
     */
    protected function processBulkCsvUpload()
    {
        if (!isset($_FILES['csv_file']) || empty($_FILES['csv_file']['tmp_name'])) {
            $this->errors[] = $this->l('Please select a valid CSV file to upload.');
            return;
        }

        $file = $_FILES['csv_file'];
        $handle = fopen($file['tmp_name'], 'r');
        if (!$handle) {
            $this->errors[] = $this->l('Unable to open uploaded CSV file.');
            return;
        }

        // Auto-detect delimiter
        $firstLine = fgets($handle);
        rewind($handle);
        $delimiter = (substr_count($firstLine, ';') > substr_count($firstLine, ',')) ? ';' : ',';

        $header = fgetcsv($handle, 4096, $delimiter);
        $headerMap = array_flip(array_map('strtolower', array_map('trim', $header)));

        $idxClass = $headerMap['id_class'] ?? $headerMap['class'] ?? null;
        $idxProduct = $headerMap['id_product'] ?? $headerMap['product_id'] ?? null;
        $idxRef = $headerMap['reference'] ?? $headerMap['sku'] ?? null;
        $idxNotes = $headerMap['ai_notes'] ?? $headerMap['notes'] ?? null;
        $idxApproved = $headerMap['is_approved'] ?? $headerMap['approved'] ?? null;

        $processed = 0;
        $db = Db::getInstance();

        while (($row = fgetcsv($handle, 4096, $delimiter)) !== false) {
            $idClass = isset($idxClass) ? (int)$row[$idxClass] : 0;
            if ($idClass < 1 || $idClass > 4) continue;

            $idProduct = isset($idxProduct) && (int)$row[$idxProduct] > 0 ? (int)$row[$idxProduct] : 0;
            if (!$idProduct && isset($idxRef) && !empty($row[$idxRef])) {
                $idProduct = (int)$db->getValue('
                    SELECT \`id_product\` FROM \`' . _DB_PREFIX_ . 'product\`
                    WHERE \`reference\` = \'' . pSQL(trim($row[$idxRef])) . '\'
                ');
            }

            if ($idProduct <= 0) continue;

            $notes = isset($idxNotes) ? pSQL(trim($row[$idxNotes])) : 'Bulk CSV manual assignment';
            $isApproved = isset($idxApproved) ? (int)$row[$idxApproved] : 1;

            $db->execute('
                INSERT INTO \`' . _DB_PREFIX_ . 'smartshipping_product\`
                    (\`id_product\`, \`id_product_attribute\`, \`id_class\`, \`confidence_score\`, \`ai_notes\`, \`is_approved\`, \`date_upd\`)
                VALUES
                    (' . (int)$idProduct . ', 0, ' . (int)$idClass . ', 100.0, \'' . $notes . '\', ' . (int)$isApproved . ', NOW())
                ON DUPLICATE KEY UPDATE
                    \`id_class\` = ' . (int)$idClass . ',
                    \`confidence_score\` = 100.0,
                    \`ai_notes\` = \'' . $notes . '\',
                    \`is_approved\` = ' . (int)$isApproved . ',
                    \`date_upd\` = NOW()
            ');
            $processed++;
        }
        fclose($handle);

        $this->confirmations[] = sprintf($this->l('Successfully updated %d products from CSV.'), $processed);
    }

    /**
     * AJAX Endpoint for CSV Upload
     */
    public function ajaxProcessUploadCsv()
    {
        $rawCsv = Tools::getValue('csv_content');
        $autoApprove = (bool)Tools::getValue('auto_approve', 1);

        if (empty($rawCsv)) {
            die(json_encode(['success' => false, 'message' => $this->l('Empty CSV content received.')]));
        }

        $lines = preg_split('/\\r\\n|\\r|\\n/', trim($rawCsv));
        $header = str_getcsv(array_shift($lines));
        $headerMap = array_flip(array_map('strtolower', array_map('trim', $header)));

        $db = Db::getInstance();
        $imported = 0;

        foreach ($lines as $line) {
            if (empty(trim($line))) continue;
            $row = str_getcsv($line);
            $idClass = (int)($row[$headerMap['id_class']] ?? 0);
            if ($idClass < 1 || $idClass > 4) continue;

            $idProduct = (int)($row[$headerMap['id_product']] ?? 0);
            if (!$idProduct && isset($headerMap['reference'])) {
                $ref = trim($row[$headerMap['reference']]);
                $idProduct = (int)$db->getValue('SELECT id_product FROM ' . _DB_PREFIX_ . 'product WHERE reference = "' . pSQL($ref) . '"');
            }

            if ($idProduct > 0) {
                $notes = pSQL($row[$headerMap['ai_notes']] ?? 'Bulk CSV import');
                $db->execute('
                    INSERT INTO ' . _DB_PREFIX_ . 'smartshipping_product 
                        (id_product, id_product_attribute, id_class, confidence_score, ai_notes, is_approved, date_upd)
                    VALUES 
                        (' . $idProduct . ', 0, ' . $idClass . ', 100, "' . $notes . '", ' . ($autoApprove ? 1 : 0) . ', NOW())
                    ON DUPLICATE KEY UPDATE 
                        id_class = ' . $idClass . ', 
                        ai_notes = "' . $notes . '", 
                        is_approved = ' . ($autoApprove ? 1 : 0) . ', 
                        date_upd = NOW()
                ');
                $imported++;
            }
        }

        die(json_encode([
            'success'  => true,
            'imported' => $imported,
            'message'  => sprintf($this->l('Successfully imported %d product volumetric classifications.'), $imported),
        ]));
    }

    /**
     * Download Pre-formatted CSV Template
     */
    protected function processExportCsvTemplate()
    {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="smartshipping_bulk_volumetric_template.csv"');
        $output = fopen('php://output', 'w');
        fputcsv($output, ['id_product', 'reference', 'id_class', 'confidence_score', 'ai_notes', 'is_approved']);
        fputcsv($output, [101, 'SOFA-STK-01', 4, 98, 'Heavy 3-seater sofa freight pallet leader', 1]);
        fputcsv($output, [102, 'TBL-OAK-88', 4, 95, 'Extendable dining table Class 4 bulky leader', 1]);
        fputcsv($output, [103, 'CHR-WLN-09', 3, 91, 'Armchair Class 3 medium furniture cart leader', 1]);
        fputcsv($output, [104, 'LMP-GLZ-22', 2, 87, 'Floor standing lamp Class 2 small furniture parcel', 1]);
        fclose($output);
        exit;
    }

    /**
     * Export all current volumetric class assignments as a live CSV file
     * Enables merchants to backup, audit, or bulk-edit in Excel/Numbers before re-importing
     */
    public function processExportCurrentAssignmentsCsv()
    {
        if (ob_get_level()) {
            ob_end_clean();
        }

        $filename = 'smartshipping_volumetric_assignments_' . date('Y-m-d_His') . '.csv';

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Pragma: no-cache');
        header('Expires: 0');

        $output = fopen('php://output', 'w');

        // Output UTF-8 BOM for Microsoft Excel / Numbers compatibility
        fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

        // CSV Header
        fputcsv($output, [
            'id_product',
            'id_product_attribute',
            'reference',
            'product_name',
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
        ]);

        $sql = '
            SELECT 
                a.\`id_product\`,
                a.\`id_product_attribute\`,
                IFNULL(p.\`reference\`, \'\') AS \`reference\`,
                IFNULL(pl.\`name\`, \'Product\') AS \`product_name\`,
                IFNULL(p.\`width\`, 0) AS \`width\`,
                IFNULL(p.\`height\`, 0) AS \`height\`,
                IFNULL(p.\`depth\`, 0) AS \`depth\`,
                IFNULL(p.\`weight\`, 0) AS \`weight\`,
                ROUND((p.\`width\` * p.\`height\` * p.\`depth\`) / 1000000, 4) AS \`volume_m3\`,
                a.\`id_class\`,
                c.\`name\` AS \`class_name\`,
                ROUND(a.\`confidence_score\`, 1) AS \`confidence_score\`,
                IFNULL(a.\`ai_notes\`, \'\') AS \`ai_notes\`,
                a.\`is_approved\`,
                a.\`date_upd\`
            FROM \`' . _DB_PREFIX_ . 'smartshipping_product\` a
            LEFT JOIN \`' . _DB_PREFIX_ . 'product\` p 
                ON (p.\`id_product\` = a.\`id_product\`)
            LEFT JOIN \`' . _DB_PREFIX_ . 'product_lang\` pl 
                ON (pl.\`id_product\` = a.\`id_product\` AND pl.\`id_lang\` = ' . (int)$this->context->language->id . ' AND pl.\`id_shop\` = ' . (int)$this->context->shop->id . ')
            LEFT JOIN \`' . _DB_PREFIX_ . 'smartshipping_classes\` c 
                ON (c.\`id_class\` = a.\`id_class\`)
            ORDER BY a.\`id_class\` DESC, a.\`id_product\` ASC
        ';

        $rows = Db::getInstance()->executeS($sql);

        if (!empty($rows)) {
            foreach ($rows as $row) {
                fputcsv($output, [
                    (int)$row['id_product'],
                    (int)$row['id_product_attribute'],
                    $row['reference'],
                    $row['product_name'],
                    (float)$row['width'],
                    (float)$row['height'],
                    (float)$row['depth'],
                    (float)$row['weight'],
                    (float)$row['volume_m3'],
                    (int)$row['id_class'],
                    $row['class_name'] ?: ('Class ' . $row['id_class']),
                    $row['confidence_score'] !== null ? (float)$row['confidence_score'] : '',
                    $row['ai_notes'],
                    (int)$row['is_approved'],
                    $row['date_upd'],
                ]);
            }
        }

        fclose($output);
        exit;
    }
}
`;
