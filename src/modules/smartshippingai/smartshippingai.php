<?php
/**
 * SmartShipping AI - Volumetric Carrier Module for PrestaShop 1.7
 *
 * @author    SmartShipping Logistics Team <support@smartshippingai.io>
 * @copyright 2026 SmartShipping AI
 * @license   Commercial License
 * @version   1.0.0
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

class SmartShippingAI extends CarrierModule
{
    const CONFIG_CARRIER_ID  = 'SMARTSHIPPINGAI_CARRIER_ID';
    const CONFIG_CARRIER_REF = 'SMARTSHIPPINGAI_CARRIER_REF';

    /** @var int Current carrier ID */
    public $id_carrier;

    public function __construct()
    {
        $this->name = 'smartshippingai';
        $this->tab = 'shipping_logistics';
        $this->version = '1.0.0';
        $this->author = 'Senior PrestaShop Logistics Expert';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = [
            'min' => '1.7.0.0',
            'max' => '1.7.8.99',
        ];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('SmartShipping AI - Volumetric Carrier');
        $this->description = $this->l('Dynamic volumetric class shipping engine with multi-item volume absorption matrix and AOV psychological triggers.');
        $this->confirmUninstall = $this->l('Are you sure you want to uninstall SmartShipping AI? All volumetric rate rules and class associations will be preserved or removed based on configuration.');
    }

    /**
     * Module Installation
     *
     * @return bool
     */
    public function install()
    {
        if (Shop::isFeatureActive()) {
            Shop::setContext(Shop::CONTEXT_ALL);
        }

        // 1. Core CarrierModule and parent install check
        if (!parent::install()) {
            return false;
        }

        // 2. Register required hooks
        $hooks = [
            'displayShoppingCartFooter',
            'displayCarrierExtraContent',
            'actionCarrierUpdate',
        ];

        foreach ($hooks as $hook) {
            if (!$this->registerHook($hook)) {
                $this->_errors[] = sprintf($this->l('Failed to register hook: %s'), $hook);
                return false;
            }
        }

        // 3. Create Custom Database Tables
        if (!$this->createDatabaseTables()) {
            $this->_errors[] = $this->l('Database tables creation failed.');
            return false;
        }

        // 4. Seed initial default classes and geo zones
        $this->seedInitialData();

        // 5. Create the dedicated PrestaShop Carrier
        if (!$this->createCarrier()) {
            $this->_errors[] = $this->l('Carrier creation failed.');
            return false;
        }

        // 6. Install Back-Office Controller Tab
        if (!$this->installTab()) {
            $this->_errors[] = $this->l('Admin Tab creation failed.');
            return false;
        }

        return true;
    }

    /**
     * Module Uninstallation
     *
     * @return bool
     */
    public function uninstall()
    {
        // 1. Uninstall Back-Office Controller Tab
        $this->uninstallTab();

        // 2. Soft-delete / disable the custom Carrier
        $this->deleteCarrier();

        // 3. Unregister hooks & delete configurations
        Configuration::deleteByName(self::CONFIG_CARRIER_ID);
        Configuration::deleteByName(self::CONFIG_CARRIER_REF);

        // 4. Drop tables (Optional: in production may retain, but follows standard PS practices)
        $this->dropDatabaseTables();

        return parent::uninstall();
    }

    /**
     * Installs the Back-Office Admin Tab for AdminSmartShippingAIController
     *
     * @return bool
     */
    public function installTab()
    {
        $idParent = (int)Tab::getIdFromClassName('AdminParentShipping');
        if (!$idParent) {
            $idParent = (int)Tab::getIdFromClassName('AdminShipping');
        }

        $tab = new Tab();
        $tab->active = 1;
        $tab->class_name = 'AdminSmartShippingAI';
        $tab->name = [];
        foreach (Language::getLanguages(true) as $lang) {
            $tab->name[$lang['id_lang']] = 'SmartShipping Classes';
        }
        $tab->id_parent = $idParent > 0 ? $idParent : 0;
        $tab->module = $this->name;
        $tab->icon = 'local_shipping';

        return (bool)$tab->add();
    }

    /**
     * Uninstalls the Back-Office Admin Tab
     *
     * @return bool
     */
    public function uninstallTab()
    {
        $idTab = (int)Tab::getIdFromClassName('AdminSmartShippingAI');
        if ($idTab) {
            $tab = new Tab($idTab);
            return (bool)$tab->delete();
        }
        return true;
    }

    /**
     * Creates custom DB tables using standard PrestaShop conventions:
     * - ps_smartshipping_classes
     * - ps_smartshipping_product
     * - ps_smartshipping_geo_zones
     *
     * @return bool
     */
    protected function createDatabaseTables()
    {
        $sql = [];

        // Table 1: ps_smartshipping_classes
        $sql[] = 'CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . 'smartshipping_classes` (
            `id_class` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            `name` VARCHAR(64) NOT NULL,
            `base_price` DECIMAL(10, 2) NOT NULL DEFAULT "0.00",
            `absorption_power` INT(11) NOT NULL DEFAULT 1,
            `date_add` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `date_upd` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id_class`)
        ) ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8mb4;';

        // Table 2: ps_smartshipping_product
        $sql[] = 'CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . 'smartshipping_product` (
            `id_product` INT(11) UNSIGNED NOT NULL,
            `id_product_attribute` INT(11) UNSIGNED NOT NULL DEFAULT 0,
            `id_class` INT(11) UNSIGNED NOT NULL DEFAULT 1,
            `is_approved` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
            `confidence_score` DECIMAL(5, 2) NULL DEFAULT NULL,
            `ai_notes` VARCHAR(255) NULL DEFAULT NULL,
            `date_upd` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id_product`, `id_product_attribute`),
            KEY `idx_class` (`id_class`),
            KEY `idx_approved` (`is_approved`)
        ) ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8mb4;';

        // Table 3: ps_smartshipping_geo_zones
        $sql[] = 'CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . 'smartshipping_geo_zones` (
            `id_zone_rule` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            `zip_code` VARCHAR(32) NOT NULL,
            `zone_type` ENUM("A", "B", "C") NOT NULL DEFAULT "A",
            `multiplier` DECIMAL(5, 2) NOT NULL DEFAULT "1.00",
            `label` VARCHAR(128) NULL DEFAULT NULL,
            `date_upd` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id_zone_rule`),
            KEY `idx_zip` (`zip_code`)
        ) ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8mb4;';

        foreach ($sql as $query) {
            if (!Db::getInstance()->execute($query)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Seed initial volumetric classes (1 to 4) and baseline geo-zones
     *
     * @return void
     */
    protected function seedInitialData()
    {
        $db = Db::getInstance();

        // Check if classes already populated
        $count = (int)$db->getValue('SELECT COUNT(*) FROM `' . _DB_PREFIX_ . 'smartshipping_classes`');
        if ($count === 0) {
            $classes = [
                ['id_class' => 1, 'name' => 'Class 1: Small Decor & Accessories', 'base_price' => 5.00,  'absorption_power' => 1],
                ['id_class' => 2, 'name' => 'Class 2: Small Furniture & Lamps',   'base_price' => 15.00, 'absorption_power' => 2],
                ['id_class' => 3, 'name' => 'Class 3: Medium Furniture & Chairs', 'base_price' => 35.00, 'absorption_power' => 3],
                ['id_class' => 4, 'name' => 'Class 4: Bulky Volumetric / Sofas',  'base_price' => 79.00, 'absorption_power' => 4],
            ];

            foreach ($classes as $class) {
                $db->insert('smartshipping_classes', $class);
            }
        }

        // Seed initial geo zones if empty
        $zoneCount = (int)$db->getValue('SELECT COUNT(*) FROM `' . _DB_PREFIX_ . 'smartshipping_geo_zones`');
        if ($zoneCount === 0) {
            $zones = [
                ['zip_code' => '75001', 'zone_type' => 'A', 'multiplier' => 1.00, 'label' => 'Metropolitan Core (Standard)'],
                ['zip_code' => '69001', 'zone_type' => 'A', 'multiplier' => 1.00, 'label' => 'Major Urban Hub'],
                ['zip_code' => '13001', 'zone_type' => 'B', 'multiplier' => 1.15, 'label' => 'Suburban / Regional Hub'],
                ['zip_code' => '20000', 'zone_type' => 'C', 'multiplier' => 1.45, 'label' => 'High-Density / Island Logistics'],
            ];

            foreach ($zones as $zone) {
                $db->insert('smartshipping_geo_zones', $zone);
            }
        }
    }

    /**
     * Drops custom tables upon uninstall
     *
     * @return bool
     */
    protected function dropDatabaseTables()
    {
        $tables = [
            'smartshipping_classes',
            'smartshipping_product',
            'smartshipping_geo_zones',
        ];

        foreach ($tables as $table) {
            Db::getInstance()->execute('DROP TABLE IF EXISTS `' . _DB_PREFIX_ . pSQL($table) . '`');
        }

        return true;
    }

    /**
     * Create the custom Carrier object in PrestaShop
     *
     * @return bool
     */
    protected function createCarrier()
    {
        $carrier = new Carrier();
        $carrier->name = 'SmartShipping AI (Volumetric)';
        $carrier->id_tax_rules_group = 0;
        $carrier->active = true;
        $carrier->deleted = 0;
        $carrier->shipping_handling = false;
        $carrier->range_behavior = 0;
        $carrier->is_module = true;
        $carrier->shipping_external = true;
        $carrier->external_module_name = $this->name;
        $carrier->need_range = true;
        $carrier->max_width = 300;
        $carrier->max_height = 250;
        $carrier->max_depth = 250;
        $carrier->max_weight = 500;
        $carrier->grade = 5;

        // Multilingual delay description
        $languages = Language::getLanguages(true);
        foreach ($languages as $language) {
            $carrier->delay[(int)$language['id_lang']] = '24-48h Smart Volumetric Delivery (Optimized Routing)';
        }

        if (!$carrier->add()) {
            return false;
        }

        // Assign to all active shop zones
        $zones = Zone::getZones(true);
        foreach ($zones as $zone) {
            $carrier->addZone((int)$zone['id_zone']);
        }

        // Assign to all customer groups
        $groups = Group::getGroups(true);
        foreach ($groups as $group) {
            Db::getInstance()->insert('carrier_group', [
                'id_carrier' => (int)$carrier->id,
                'id_group'   => (int)$group['id_group'],
            ]);
        }

        // Create initial price/weight ranges so PrestaShop lists the carrier during checkout
        $rangePrice = new RangePrice();
        $rangePrice->id_carrier = (int)$carrier->id;
        $rangePrice->delimiter1 = 0;
        $rangePrice->delimiter2 = 100000;
        $rangePrice->add();

        $rangeWeight = new RangeWeight();
        $rangeWeight->id_carrier = (int)$carrier->id;
        $rangeWeight->delimiter1 = 0;
        $rangeWeight->delimiter2 = 100000;
        $rangeWeight->add();

        // Enable delivery pricing for zones
        foreach ($zones as $zone) {
            Db::getInstance()->insert('delivery', [
                'id_carrier'      => (int)$carrier->id,
                'id_range_price'  => (int)$rangePrice->id,
                'id_range_weight' => null,
                'id_zone'         => (int)$zone['id_zone'],
                'price'           => 0.00,
            ]);

            Db::getInstance()->insert('delivery', [
                'id_carrier'      => (int)$carrier->id,
                'id_range_price'  => null,
                'id_range_weight' => (int)$rangeWeight->id,
                'id_zone'         => (int)$zone['id_zone'],
                'price'           => 0.00,
            ]);
        }

        // Persist carrier ID and Reference ID in Configuration
        Configuration::updateValue(self::CONFIG_CARRIER_ID, (int)$carrier->id);
        Configuration::updateValue(self::CONFIG_CARRIER_REF, (int)$carrier->id);

        // Copy carrier logo if available
        $sourceLogo = dirname(__FILE__) . '/views/img/carrier_logo.png';
        $destLogo   = _PS_SHIP_IMG_DIR_ . (int)$carrier->id . '.jpg';
        if (file_exists($sourceLogo)) {
            copy($sourceLogo, $destLogo);
        }

        return true;
    }

    /**
     * Soft delete custom Carrier
     *
     * @return bool
     */
    protected function deleteCarrier()
    {
        $carrierId = (int)Configuration::get(self::CONFIG_CARRIER_ID);
        if ($carrierId) {
            $carrier = new Carrier($carrierId);
            if (Validate::isLoadedObject($carrier)) {
                $carrier->deleted = 1;
                $carrier->active = 0;
                $carrier->save();
            }
        }
        return true;
    }

    /**
     * PrestaShop 1.7 Hook: actionCarrierUpdate
     * Handles carrier ID updates when carrier settings are edited in Back Office.
     * In PS 1.7, updating a carrier marks the old one deleted and creates a new ID.
     *
     * @param array $params ['id_carrier' => int, 'carrier' => Carrier]
     * @return void
     */
    public function hookActionCarrierUpdate($params)
    {
        if ((int)$params['id_carrier'] === (int)Configuration::get(self::CONFIG_CARRIER_ID)) {
            Configuration::updateValue(self::CONFIG_CARRIER_ID, (int)$params['carrier']->id);
        }
    }

    /**
     * PrestaShop CarrierModule required method:
     * Calculates shipping cost for external module carriers using the Volume Absorption Matrix algorithm.
     *
     * Rules:
     * 1. Cart line items are expanded by quantity and assigned their volumetric class (1 to 4).
     * 2. The item with the highest class (and highest base price) is elected as the "Leader".
     * 3. Subordinated items undergo volumetric absorption:
     *    - If class is >= 2 levels below Leader (e.g. Class 1 or 2 under Class 4 Leader, or Class 1 under Class 3 Leader):
     *      100% Free Absorption (absorbed inside the dimensional buffer of bulky items). Cost = +0.00.
     *    - If Leader is Class 4 and subordinated item is Class 3:
     *      Flat handling fee of +10.00 EUR per item.
     *    - If subordinated item is the same class as Leader (co-leader):
     *      Additional units add 40% of the Leader base price.
     *    - Other adjacent subordinated items:
     *      Add 30% of their respective base price.
     * 4. Multiplier is fetched from ps_smartshipping_geo_zones based on delivery address postal code (Zone A: 1.00, Zone B: 1.15, Zone C: 1.45).
     * 5. Final rate is: round(running_cost * multiplier, 2).
     *
     * @param Cart  $params Cart object
     * @param float $shipping_cost Standard shipping cost
     * @return float|false Shipping cost or false if not applicable
     */
    public function getOrderShippingCost($params, $shipping_cost)
    {
        // 1. Verify Cart instance
        $cart = $params;
        if (!Validate::isLoadedObject($cart) && isset($this->context->cart)) {
            $cart = $this->context->cart;
        }

        if (!Validate::isLoadedObject($cart)) {
            return false;
        }

        $products = $cart->getProducts();
        if (empty($products)) {
            return 0.00;
        }

        // 2. Fetch Delivery Address & ZIP Code Multiplier
        $multiplier = $this->getDeliveryZipMultiplier((int)$cart->id_address_delivery);

        // 3. Pre-fetch volumetric class definitions from database (cached in memory)
        $classesCatalog = $this->getVolumetricClassesCatalog();

        // 4. Flatten cart products by quantity with their respective volumetric classes
        $flattenedItems = [];
        $productClassCache = [];

        foreach ($products as $product) {
            $idProduct = (int)$product['id_product'];
            $idProductAttribute = (int)($product['id_product_attribute'] ?? 0);
            $qty = max(1, (int)($product['cart_quantity'] ?? 1));

            // Resolve class for product
            $cacheKey = $idProduct . '_' . $idProductAttribute;
            if (!isset($productClassCache[$cacheKey])) {
                $productClassCache[$cacheKey] = $this->getProductVolumetricClass($idProduct, $idProductAttribute);
            }

            $idClass = (int)$productClassCache[$cacheKey];
            $classData = $classesCatalog[$idClass] ?? [
                'name' => 'Class 1: Small Decor',
                'base_price' => 5.00,
                'absorption_power' => 1
            ];

            for ($i = 0; $i < $qty; $i++) {
                $flattenedItems[] = [
                    'id_product'           => $idProduct,
                    'id_product_attribute' => $idProductAttribute,
                    'name'                 => $product['name'] ?? 'Product',
                    'id_class'             => $idClass,
                    'base_price'           => (float)$classData['base_price'],
                    'absorption_power'     => (int)$classData['absorption_power'],
                ];
            }
        }

        if (empty($flattenedItems)) {
            return 0.00;
        }

        // 5. Identify the Leader Product: highest id_class, then highest base_price
        usort($flattenedItems, function ($a, $b) {
            if ($b['id_class'] !== $a['id_class']) {
                return $b['id_class'] <=> $a['id_class'];
            }
            return $b['base_price'] <=> $a['base_price'];
        });

        // The first element is the Leader
        $leader = $flattenedItems[0];
        $leaderClassId = (int)$leader['id_class'];
        $leaderBasePrice = (float)$leader['base_price'];

        $runningCost = $leaderBasePrice;

        // 6. Execute Volume Absorption Loop for subordinated items
        $totalItems = count($flattenedItems);
        for ($i = 1; $i < $totalItems; $i++) {
            $subItem = $flattenedItems[$i];
            $subClassId = (int)$subItem['id_class'];
            $subBasePrice = (float)$subItem['base_price'];

            if (($leaderClassId - $subClassId) >= 2) {
                // Rule A: >= 2 levels below Leader -> 100% Free Absorption inside dimensional buffer (+0.00 EUR)
                $runningCost += 0.00;
            } elseif ($leaderClassId === 4 && $subClassId === 3) {
                // Rule B: Leader is Class 4 and subordinated item is Class 3 -> Flat handling fee of +10.00 EUR
                $runningCost += 10.00;
            } elseif ($subClassId === $leaderClassId) {
                // Rule C: Same volumetric class as Leader -> 40% of Leader base rate
                $runningCost += (0.40 * $leaderBasePrice);
            } else {
                // Rule D: Adjacent class (e.g. Class 2 under Class 3 Leader) -> 30% of item base rate
                $runningCost += (0.30 * $subBasePrice);
            }
        }

        // 7. Apply Geo-Zone Logistics Friction Multiplier & Rounding
        $finalCost = (float)round($runningCost * $multiplier, 2);

        return $finalCost;
    }

    /**
     * Resolves the delivery postal code multiplier from ps_smartshipping_geo_zones
     *
     * @param int $idAddress Delivery address ID
     * @return float Multiplier (e.g. 1.00 for Zone A, 1.15 for Zone B, 1.45 for Zone C)
     */
    public function getDeliveryZipMultiplier($idAddress)
    {
        if (empty($idAddress)) {
            return 1.00;
        }

        $address = new Address((int)$idAddress);
        if (!Validate::isLoadedObject($address) || empty($address->postcode)) {
            return 1.00;
        }

        $postcode = trim((string)$address->postcode);

        // Exact ZIP match query
        $sql = 'SELECT `multiplier` FROM `' . _DB_PREFIX_ . 'smartshipping_geo_zones`
                WHERE `zip_code` = \'' . pSQL($postcode) . '\' LIMIT 1';
        $multiplier = Db::getInstance()->getValue($sql);

        // Fallback: 2-digit department match (e.g. '13' prefix in France)
        if ($multiplier === false && strlen($postcode) >= 2) {
            $deptPrefix = substr($postcode, 0, 2);
            $sqlDept = 'SELECT `multiplier` FROM `' . _DB_PREFIX_ . 'smartshipping_geo_zones`
                        WHERE `zip_code` = \'' . pSQL($deptPrefix) . '\' OR `zip_code` LIKE \'' . pSQL($deptPrefix) . '%\'
                        ORDER BY LENGTH(`zip_code`) DESC LIMIT 1';
            $multiplier = Db::getInstance()->getValue($sqlDept);
        }

        if ($multiplier !== false && is_numeric($multiplier) && (float)$multiplier > 0) {
            return (float)$multiplier;
        }

        // Safe fallback default: 1.00
        return 1.00;
    }

    /**
     * Fetches all registered volumetric classes with in-memory caching
     *
     * @return array [id_class => ['name' => ..., 'base_price' => ..., 'absorption_power' => ...]]
     */
    public function getVolumetricClassesCatalog()
    {
        static $classesCatalog = null;
        if ($classesCatalog !== null) {
            return $classesCatalog;
        }

        $sql = 'SELECT `id_class`, `name`, `base_price`, `absorption_power`
                FROM `' . _DB_PREFIX_ . 'smartshipping_classes`';
        $rows = Db::getInstance()->executeS($sql);

        $classesCatalog = [];
        if (!empty($rows)) {
            foreach ($rows as $row) {
                $classesCatalog[(int)$row['id_class']] = [
                    'name'             => (string)$row['name'],
                    'base_price'       => (float)$row['base_price'],
                    'absorption_power' => (int)$row['absorption_power'],
                ];
            }
        }

        // Default baseline fallback if table not yet seeded
        if (empty($classesCatalog)) {
            $classesCatalog = [
                1 => ['name' => 'Class 1: Small Decor',     'base_price' => 5.00,  'absorption_power' => 1],
                2 => ['name' => 'Class 2: Small Furniture', 'base_price' => 15.00, 'absorption_power' => 2],
                3 => ['name' => 'Class 3: Medium Furniture','base_price' => 35.00, 'absorption_power' => 3],
                4 => ['name' => 'Class 4: Bulky / Sofas',   'base_price' => 79.00, 'absorption_power' => 4],
            ];
        }

        return $classesCatalog;
    }

    /**
     * Resolves the assigned volumetric class ID for a specific product and combination
     *
     * @param int $idProduct
     * @param int $idProductAttribute
     * @return int Volumetric class ID (1 to 4)
     */
    public function getProductVolumetricClass($idProduct, $idProductAttribute = 0)
    {
        $idProduct = (int)$idProduct;
        $idProductAttribute = (int)$idProductAttribute;

        // 1. Try exact combination match
        if ($idProductAttribute > 0) {
            $sqlAttr = 'SELECT `id_class` FROM `' . _DB_PREFIX_ . 'smartshipping_product`
                        WHERE `id_product` = ' . $idProduct . '
                          AND `id_product_attribute` = ' . $idProductAttribute . '
                          AND `is_approved` = 1 LIMIT 1';
            $classId = Db::getInstance()->getValue($sqlAttr);
            if ($classId && (int)$classId > 0) {
                return (int)$classId;
            }
        }

        // 2. Try default product master match
        $sqlProd = 'SELECT `id_class` FROM `' . _DB_PREFIX_ . 'smartshipping_product`
                    WHERE `id_product` = ' . $idProduct . '
                      AND `id_product_attribute` = 0
                      AND `is_approved` = 1 LIMIT 1';
        $classId = Db::getInstance()->getValue($sqlProd);
        if ($classId && (int)$classId > 0) {
            return (int)$classId;
        }

        // 3. Fallback: Heuristic based on dimensions/weight if product is not yet classified
        $product = new Product($idProduct, false);
        if (Validate::isLoadedObject($product)) {
            $weight = (float)$product->weight;
            $volume = ((float)$product->width * (float)$product->height * (float)$product->depth) / 1000000; // m3

            if ($weight >= 40 || $volume >= 0.8) {
                return 4; // Class 4 Bulky
            }
            if ($weight >= 15 || $volume >= 0.25) {
                return 3; // Class 3 Medium
            }
            if ($weight >= 3 || $volume >= 0.05) {
                return 2; // Class 2 Small Furniture
            }
        }

        // Default baseline
        return 1;
    }

    /**
     * Required for carrier calculation when shipping outside normal carrier rules
     *
     * @param mixed $params
     * @return float|false
     */
    public function getOrderShippingCostExternal($params)
    {
        return $this->getOrderShippingCost($params, 0.0);
    }

    /**
     * Resolves the cart's Leader product based on volumetric class and base price
     *
     * @param Cart|object $cart PrestaShop Cart object
     * @return array|null Flattened leader product array or null if cart is empty
     */
    public function getCartLeader($cart)
    {
        if (!Validate::isLoadedObject($cart)) {
            return null;
        }

        $products = $cart->getProducts();
        if (empty($products) || !is_array($products)) {
            return null;
        }

        $classesCatalog = $this->getVolumetricClassesCatalog();
        $flattenedItems = [];
        $productClassCache = [];

        foreach ($products as $product) {
            $idProduct = (int)$product['id_product'];
            $idProductAttribute = (int)($product['id_product_attribute'] ?? 0);
            $qty = max(1, (int)($product['cart_quantity'] ?? 1));

            $cacheKey = $idProduct . '_' . $idProductAttribute;
            if (!isset($productClassCache[$cacheKey])) {
                $productClassCache[$cacheKey] = $this->getProductVolumetricClass($idProduct, $idProductAttribute);
            }

            $idClass = (int)$productClassCache[$cacheKey];
            $classData = $classesCatalog[$idClass] ?? [
                'name' => 'Class 1: Small Decor',
                'base_price' => 5.00,
                'absorption_power' => 1,
            ];

            for ($i = 0; $i < $qty; $i++) {
                $flattenedItems[] = [
                    'id_product'           => $idProduct,
                    'id_product_attribute' => $idProductAttribute,
                    'name'                 => $product['name'] ?? 'Product',
                    'id_class'             => $idClass,
                    'base_price'           => (float)$classData['base_price'],
                    'absorption_power'     => (int)$classData['absorption_power'],
                ];
            }
        }

        if (empty($flattenedItems)) {
            return null;
        }

        usort($flattenedItems, function ($a, $b) {
            if ($b['id_class'] !== $a['id_class']) {
                return $b['id_class'] <=> $a['id_class'];
            }
            return $b['base_price'] <=> $a['base_price'];
        });

        return $flattenedItems[0];
    }

    /**
     * Hook: displayShoppingCartFooter
     * Checks if the cart leader is Class 3 or 4, and if so, passes Smarty variables
     * to display the promotional AOV banner encouraging free shipping absorption.
     *
     * @param array $params Hook parameters including 'cart'
     * @return string Rendered Smarty template HTML or empty string
     */
    public function hookDisplayShoppingCartFooter($params)
    {
        $cart = null;
        if (isset($params['cart']) && Validate::isLoadedObject($params['cart'])) {
            $cart = $params['cart'];
        } elseif (isset($this->context->cart) && Validate::isLoadedObject($this->context->cart)) {
            $cart = $this->context->cart;
        }

        if (!Validate::isLoadedObject($cart)) {
            return '';
        }

        $leader = $this->getCartLeader($cart);
        $leaderClassId = $leader ? (int)$leader['id_class'] : 0;

        // Check if the cart leader is Class 3 or 4
        $showPromoBanner = in_array($leaderClassId, [3, 4], true);

        if (!$showPromoBanner) {
            if (isset($this->context->smarty)) {
                $this->context->smarty->assign([
                    'smartshipping_show_promo_banner' => false,
                    'show_promo_banner'               => false,
                ]);
            }
            return '';
        }

        // Pass Smarty variables to display the promotional banner
        if (isset($this->context->smarty)) {
            $this->context->smarty->assign([
                'smartshipping_show_promo_banner' => true,
                'show_promo_banner'               => true,
                'smartshipping_leader'            => $leader,
                'smartshipping_leader_class'      => $leaderClassId,
                'smartshipping_leader_name'       => $leader['name'] ?? '',
                'smartshipping_promo_title'       => $this->l('Your large item shipping is secured!'),
                'smartshipping_promo_subtitle'    => $leaderClassId === 4
                    ? $this->l('Add small furniture & home decor (Class 1 & 2) with 100% FREE shipping in this order.')
                    : $this->l('Add small decor & accessories (Class 1) with 100% FREE shipping in this order.'),
                'smartshipping_eligible_classes'  => $leaderClassId === 4 ? [1, 2] : [1],
                'smartshipping_savings_label'     => $this->l('100% Free Shipping Absorption'),
            ]);
        }

        return $this->display(__FILE__, 'views/templates/hook/shopping_cart_footer.tpl');
    }

    /**
     * Hook: displayCarrierExtraContent
     * PrestaShop 1.7 Hook rendered in Checkout Step 3 (Delivery Options).
     * Displays real-time volumetric freight calculation breakdown,
     * highlighting 100% free absorption strikethroughs and zone multiplier details.
     *
     * @param array $params ['carrier' => Carrier, 'cart' => Cart]
     * @return string Rendered Smarty template HTML or empty string
     */
    public function hookDisplayCarrierExtraContent($params)
    {
        $carrier = $params['carrier'] ?? null;
        $configuredCarrierId = (int)Configuration::get(self::CONFIG_CARRIER_ID);
        $configuredCarrierRef = (int)Configuration::get(self::CONFIG_CARRIER_REF);

        // Verify that this extra content belongs to SmartShipping AI Carrier
        if ($carrier && is_object($carrier)) {
            $carrierId = (int)$carrier->id;
            $carrierRef = (int)($carrier->id_reference ?? 0);
            if ($carrierId !== $configuredCarrierId && $carrierRef !== $configuredCarrierRef) {
                return '';
            }
        }

        $cart = null;
        if (isset($params['cart']) && Validate::isLoadedObject($params['cart'])) {
            $cart = $params['cart'];
        } elseif (isset($this->context->cart) && Validate::isLoadedObject($this->context->cart)) {
            $cart = $this->context->cart;
        }

        if (!Validate::isLoadedObject($cart)) {
            return '';
        }

        $calc = $this->calculateCartShippingDetails($cart);
        if (!$calc || empty($calc['items'])) {
            return '';
        }

        if (isset($this->context->smarty)) {
            $this->context->smarty->assign([
                'smartshipping_carrier_active'  => true,
                'smartshipping_leader'          => $calc['leader'],
                'smartshipping_item_details'    => $calc['items'],
                'smartshipping_subtotal'        => $calc['subtotal'],
                'smartshipping_multiplier'      => $calc['multiplier'],
                'smartshipping_zone_label'      => $calc['zone_label'],
                'smartshipping_ferry_surcharge' => $calc['ferry_surcharge'],
                'smartshipping_total_fee'       => $calc['total'],
                'smartshipping_total_savings'   => $calc['savings'],
            ]);
        }

        return $this->display(__FILE__, 'views/templates/hook/carrier_extra_content.tpl');
    }

    /**
     * Helper: Computes itemized volumetric calculation details for transparent front-end display
     *
     * @param Cart $cart
     * @return array Calculation breakdown details
     */
    public function calculateCartShippingDetails($cart)
    {
        if (!Validate::isLoadedObject($cart)) {
            return [];
        }

        $products = $cart->getProducts();
        if (empty($products) || !is_array($products)) {
            return [];
        }

        $classesCatalog = $this->getVolumetricClassesCatalog();
        $flattenedItems = [];
        $productClassCache = [];

        foreach ($products as $product) {
            $idProduct = (int)$product['id_product'];
            $idProductAttribute = (int)($product['id_product_attribute'] ?? 0);
            $qty = max(1, (int)($product['cart_quantity'] ?? 1));

            $cacheKey = $idProduct . '_' . $idProductAttribute;
            if (!isset($productClassCache[$cacheKey])) {
                $productClassCache[$cacheKey] = $this->getProductVolumetricClass($idProduct, $idProductAttribute);
            }

            $idClass = (int)$productClassCache[$cacheKey];
            $classData = $classesCatalog[$idClass] ?? [
                'name' => 'Class 1: Small Decor',
                'base_price' => 5.00,
                'absorption_power' => 1,
            ];

            for ($i = 0; $i < $qty; $i++) {
                $flattenedItems[] = [
                    'id_product'           => $idProduct,
                    'id_product_attribute' => $idProductAttribute,
                    'name'                 => $product['name'] ?? 'Product',
                    'id_class'             => $idClass,
                    'base_price'           => (float)$classData['base_price'],
                    'absorption_power'     => (int)$classData['absorption_power'],
                ];
            }
        }

        if (empty($flattenedItems)) {
            return [];
        }

        // Sort: Class DESC, Base Price DESC
        usort($flattenedItems, function ($a, $b) {
            if ($b['id_class'] !== $a['id_class']) {
                return $b['id_class'] <=> $a['id_class'];
            }
            return $b['base_price'] <=> $a['base_price'];
        });

        $leader = $flattenedItems[0];
        $leaderClassId = (int)$leader['id_class'];
        $leaderBasePrice = (float)$leader['base_price'];

        $subtotal = $leaderBasePrice;
        $standardCostWithoutAbsorption = $leaderBasePrice;
        $itemsBreakdown = [];

        $itemsBreakdown[] = [
            'name'         => $leader['name'],
            'id_class'     => $leader['id_class'],
            'isLeader'     => true,
            'feeAdded'     => $leaderBasePrice,
            'standardFee'  => $leaderBasePrice,
            'ruleApplied'  => 'Elected Freight Leader (Class ' . $leaderClassId . ')',
            'isAbsorbed'   => false,
        ];

        $totalItems = count($flattenedItems);
        for ($i = 1; $i < $totalItems; $i++) {
            $subItem = $flattenedItems[$i];
            $subClassId = (int)$subItem['id_class'];
            $subBasePrice = (float)$subItem['base_price'];
            $standardCostWithoutAbsorption += $subBasePrice;

            $addedFee = 0.00;
            $ruleDesc = '';
            $absorbed = false;

            if (($leaderClassId - $subClassId) >= 2) {
                $addedFee = 0.00;
                $absorbed = true;
                $ruleDesc = '100% Free Absorption inside Class ' . $leaderClassId . ' buffer';
            } elseif ($leaderClassId === 4 && $subClassId === 3) {
                $addedFee = 10.00;
                $ruleDesc = 'Flat handling fee for Class 3 with Class 4 Leader';
            } elseif ($subClassId === $leaderClassId) {
                $addedFee = 0.40 * $leaderBasePrice;
                $ruleDesc = 'Co-Leader 60% buffer discount (40% rate applied)';
            } else {
                $addedFee = 0.30 * $subBasePrice;
                $ruleDesc = 'Adjacent class 70% consolidation discount (30% rate applied)';
            }

            $subtotal += $addedFee;
            $itemsBreakdown[] = [
                'name'        => $subItem['name'],
                'id_class'    => $subClassId,
                'isLeader'    => false,
                'feeAdded'    => $addedFee,
                'standardFee' => $subBasePrice,
                'ruleApplied' => $ruleDesc,
                'isAbsorbed'  => $absorbed,
            ];
        }

        $multiplier = $this->getDeliveryZipMultiplier((int)$cart->id_address_delivery);
        $ferrySurcharge = 0.00;

        // Check if destination is Island / Remote Zone and leader is Class 4
        if ($multiplier >= 1.40 && $leaderClassId === 4) {
            $ferrySurcharge = 35.00; // Maritime ferry pallet surcharge
        }

        $total = round(($subtotal * $multiplier) + $ferrySurcharge, 2);
        $totalStandard = round(($standardCostWithoutAbsorption * $multiplier) + $ferrySurcharge, 2);
        $savings = max(0, round($totalStandard - $total, 2));

        return [
            'leader'          => $leader,
            'items'           => $itemsBreakdown,
            'subtotal'        => $subtotal,
            'multiplier'      => $multiplier,
            'zone_label'      => $multiplier >= 1.40 ? 'Zone C - Island / Remote (+45%)' : ($multiplier > 1.05 ? 'Zone B - Suburban (+15%)' : 'Zone A - Continental Standard'),
            'ferry_surcharge' => $ferrySurcharge,
            'total'           => $total,
            'total_standard'  => $totalStandard,
            'savings'         => $savings,
        ];
    }
}
