# SmartShipping AI - PrestaShop Volumetric Freight & Multi-Zone Module

SmartShipping AI is a production-ready PrestaShop module for furniture, decor, and e-commerce merchants with multi-item, volumetric freight requirements.

## Key Features
1. **Dynamic Cart Leader & Total Absorption Matrix**:
   - The largest volumetric item sets the base cart shipping fee (e.g., Class 4 Sofa @ €79).
   - Lightweight Class 1 items (cushions, candles) are 100% absorbed for FREE.
2. **Product Combination Attributes Support**:
   - Individual volumetric classes per product attribute variation (`id_product_attribute`).
3. **Multi-Zone Matrix (Continental vs Island vs Remote)**:
   - Regional multipliers and dedicated maritime ferry pallet surcharges for Class 4 bulky freight.
4. **Google Gemini Multimodal AI Classification**:
   - Automated dimension, volume, and packaging threshold analysis.
5. **Back-Office HelperList Controller & Bulk CSV Importer**:
   - Color-coded audit badges, fast CSV imports, and 1-click status moderation.

## Installation in PrestaShop
1. Go to **Modules > Module Manager** in your PrestaShop Back-Office.
2. Click **Upload a module** and select `smartshippingai-v1.0.0.zip`.
3. PrestaShop automatically registers the database schema, installs the custom Carrier, and registers hooks.
4. Access **Shipping > SmartShipping AI** in your Back-Office menu.
