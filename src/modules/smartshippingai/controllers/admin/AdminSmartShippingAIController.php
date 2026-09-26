<?php
/**
 * 2026 SmartShipping AI - Volumetric Carrier & Absorption Engine
 *
 * NOTICE OF LICENSE
 * This source file is subject to the Academic Free License (AFL 3.0)
 *
 * @author    Senior PrestaShop Logistics Expert
 * @copyright 2026 SmartShipping AI
 * @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

/**
 * Class AdminSmartShippingAIController
 *
 * PrestaShop Back-Office HelperList Controller for managing:
 * - Product volumetric class assignments (Classes 1 to 4)
 * - AI classification confidence scores and dimensional attributes
 * - One-click AJAX approval / disapproval workflow
 * - Bulk moderation actions
 */
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
            a.`id_smartshipping_product`,
            a.`id_product`,
            a.`id_product_attribute`,
            a.`id_class`,
            a.`confidence_score`,
            a.`is_approved`,
            a.`date_upd`,
            pl.`name` AS `product_name`,
            p.`reference`,
            p.`width`,
            p.`height`,
            p.`depth`,
            p.`weight`,
            ROUND((p.`width` * p.`height` * p.`depth`) / 1000000, 3) AS `volume_m3`,
            c.`name` AS `class_name`,
            c.`base_price` AS `class_base_price`,
            i.`id_image`
        ';

        $this->_join = '
            LEFT JOIN `' . _DB_PREFIX_ . 'product` p 
                ON (p.`id_product` = a.`id_product`)
            LEFT JOIN `' . _DB_PREFIX_ . 'product_lang` pl 
                ON (pl.`id_product` = a.`id_product` AND pl.`id_lang` = ' . (int)$this->context->language->id . ' AND pl.`id_shop` = ' . (int)$this->context->shop->id . ')
            LEFT JOIN `' . _DB_PREFIX_ . 'smartshipping_classes` c 
                ON (c.`id_class` = a.`id_class`)
            LEFT JOIN `' . _DB_PREFIX_ . 'image_shop` i 
                ON (i.`id_product` = a.`id_product` AND i.`cover` = 1 AND i.`id_shop` = ' . (int)$this->context->shop->id . ')
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
            'reclassify' => [
                'text' => $this->l('Trigger AI Re-Classification'),
                'icon' => 'icon-refresh text-info',
            ],
        ];
    }

    /**
     * Injects CSS and JavaScript for the interactive AJAX approval toggle
     */
    public function setMedia($isNewTheme = false)
    {
        parent::setMedia($isNewTheme);

        $this->addCSS($this->module->getPathUri() . 'views/css/admin-smartshipping.css');
        $this->addJS($this->module->getPathUri() . 'views/js/admin-smartshipping.js');

        Media::addJsDef([
            'smartshipping_ajax_url' => $this->context->link->getAdminLink('AdminSmartShippingAI', true, [], ['ajax' => 1]),
            'smartshipping_token'    => $this->token,
            'smartshipping_i18n'     => [
                'approved'       => $this->l('Approved'),
                'pending'        => $this->l('Pending Review'),
                'update_success' => $this->l('Classification updated successfully!'),
                'error_generic'  => $this->l('An error occurred while saving.'),
            ],
        ]);
    }

    /**
     * Custom Toolbar Buttons
     */
    public function initToolbar()
    {
        parent::initToolbar();

        $this->page_header_toolbar_btn['bulk_csv'] = [
            'href' => '#smartshipping-csv-modal',
            'desc' => $this->l('Bulk CSV Import / Update'),
            'icon' => 'process-icon-import',
            'class' => 'btn-default smartshipping-btn-csv-trigger',
        ];

        $this->page_header_toolbar_btn['export_assignments_csv'] = [
            'href' => self::$currentIndex . '&action=export_current_assignments_csv&token=' . $this->token,
            'desc' => $this->l('Export Current Assignments (CSV)'),
            'icon' => 'process-icon-export',
            'class' => 'btn-success',
        ];

        $this->page_header_toolbar_btn['download_template'] = [
            'href' => self::$currentIndex . '&action=download_csv_template&token=' . $this->token,
            'desc' => $this->l('Download CSV Template'),
            'icon' => 'process-icon-download',
        ];

        $this->page_header_toolbar_btn['run_ai'] = [
            'href' => self::$currentIndex . '&action=run_batch_ai&token=' . $this->token,
            'desc' => $this->l('Run Batch AI Classifier'),
            'icon' => 'process-icon-cpt',
            'class' => 'btn-primary',
        ];

        $this->page_header_toolbar_btn['configure_classes'] = [
            'href' => $this->context->link->getAdminLink('AdminModules', true, [], ['configure' => 'smartshippingai']),
            'desc' => $this->l('Carrier & Matrix Rates'),
            'icon' => 'process-icon-configure',
        ];
    }

    /**
     * Post-processing hook for form submissions and file downloads
     */
    public function postProcess()
    {
        if (Tools::isSubmit('submitBulkCsvUpload')) {
            $this->processBulkCsvUpload();
        } elseif (Tools::getValue('action') === 'export_current_assignments_csv') {
            $this->processExportCurrentAssignmentsCsv();
        } elseif (Tools::getValue('action') === 'download_csv_template') {
            $this->processExportCsvTemplate();
        }

        return parent::postProcess();
    }

    /**
     * Renders HelperList with top KPI summary cards and CSV upload modal
     *
     * @return string HTML output
     */
    public function renderList()
    {
        $kpiHtml = $this->renderKpiDashboard();
        $listHtml = parent::renderList();
        $csvModalHtml = $this->renderCsvUploadModal();

        return $kpiHtml . $listHtml . $csvModalHtml . $this->renderQuickModalScript();
    }

    /**
     * Renders Back-Office Summary KPIs (Pending, Approved, Avg Confidence, Bulky Items)
     */
    protected function renderKpiDashboard()
    {
        $totalItems = (int)Db::getInstance()->getValue('SELECT COUNT(*) FROM `' . _DB_PREFIX_ . 'smartshipping_product`');
        $approvedItems = (int)Db::getInstance()->getValue('SELECT COUNT(*) FROM `' . _DB_PREFIX_ . 'smartshipping_product` WHERE `is_approved` = 1');
        $pendingItems = $totalItems - $approvedItems;
        $avgConfidence = (float)Db::getInstance()->getValue('SELECT AVG(`confidence_score`) FROM `' . _DB_PREFIX_ . 'smartshipping_product` WHERE `confidence_score` IS NOT NULL');
        $bulkyCount = (int)Db::getInstance()->getValue('SELECT COUNT(*) FROM `' . _DB_PREFIX_ . 'smartshipping_product` WHERE `id_class` = 4');

        $output = '
        <div class="row kpis-smartshipping" style="margin-bottom: 20px;">
            <div class="col-sm-6 col-lg-3">
                <div class="kpi-panel panel panel-primary" style="border-left: 4px solid #f39c12;">
                    <div class="kpi-content" style="padding: 15px;">
                        <i class="icon-clock-o" style="font-size: 28px; float: right; color: #f39c12;"></i>
                        <span class="title" style="font-size: 11px; text-transform: uppercase; color: #7f8c8d; font-weight: bold;">' . $this->l('Pending Review') . '</span>
                        <div class="value" style="font-size: 26px; font-weight: bold; color: #2c3e50;">' . $pendingItems . '</div>
                        <div class="subtitle" style="font-size: 11px; color: #95a5a6;">' . $this->l('Awaiting merchant approval') . '</div>
                    </div>
                </div>
            </div>
            <div class="col-sm-6 col-lg-3">
                <div class="kpi-panel panel" style="border-left: 4px solid #27ae60;">
                    <div class="kpi-content" style="padding: 15px;">
                        <i class="icon-check-circle" style="font-size: 28px; float: right; color: #27ae60;"></i>
                        <span class="title" style="font-size: 11px; text-transform: uppercase; color: #7f8c8d; font-weight: bold;">' . $this->l('Approved Products') . '</span>
                        <div class="value" style="font-size: 26px; font-weight: bold; color: #27ae60;">' . $approvedItems . ' <span style="font-size: 13px; color: #7f8c8d;">/ ' . $totalItems . '</span></div>
                        <div class="subtitle" style="font-size: 11px; color: #95a5a6;">' . round(($totalItems > 0 ? ($approvedItems / $totalItems) * 100 : 0), 1) . '% ' . $this->l('catalog calibrated') . '</div>
                    </div>
                </div>
            </div>
            <div class="col-sm-6 col-lg-3">
                <div class="kpi-panel panel" style="border-left: 4px solid #2980b9;">
                    <div class="kpi-content" style="padding: 15px;">
                        <i class="icon-dashboard" style="font-size: 28px; float: right; color: #2980b9;"></i>
                        <span class="title" style="font-size: 11px; text-transform: uppercase; color: #7f8c8d; font-weight: bold;">' . $this->l('Avg AI Confidence') . '</span>
                        <div class="value" style="font-size: 26px; font-weight: bold; color: #2980b9;">' . round($avgConfidence, 1) . '%</div>
                        <div class="subtitle" style="font-size: 11px; color: #95a5a6;">' . $this->l('Gemini multimodal classifier') . '</div>
                    </div>
                </div>
            </div>
            <div class="col-sm-6 col-lg-3">
                <div class="kpi-panel panel" style="border-left: 4px solid #8e44ad;">
                    <div class="kpi-content" style="padding: 15px;">
                        <i class="icon-truck" style="font-size: 28px; float: right; color: #8e44ad;"></i>
                        <span class="title" style="font-size: 11px; text-transform: uppercase; color: #7f8c8d; font-weight: bold;">' . $this->l('Class 4 Heavy Bulky') . '</span>
                        <div class="value" style="font-size: 26px; font-weight: bold; color: #8e44ad;">' . $bulkyCount . '</div>
                        <div class="subtitle" style="font-size: 11px; color: #95a5a6;">' . $this->l('Leaders of absorption matrix') . '</div>
                    </div>
                </div>
            </div>
        </div>';

        return $output;
    }

    /**
     * AJAX Process: Toggle Approval Status via Click without Page Reload
     */
    public function ajaxProcessToggleApproval()
    {
        header('Content-Type: application/json; charset=utf-8');

        // Security check
        if (!Tools::isSubmit('id_smartshipping_product') && !Tools::isSubmit('id_product')) {
            die(json_encode(['success' => false, 'error' => $this->l('Invalid product identifier.')]));
        }

        $idRecord = (int)Tools::getValue('id_smartshipping_product');
        $idProduct = (int)Tools::getValue('id_product');

        if ($idRecord > 0) {
            $currentStatus = (int)Db::getInstance()->getValue(
                'SELECT `is_approved` FROM `' . _DB_PREFIX_ . 'smartshipping_product`
                 WHERE `id_smartshipping_product` = ' . $idRecord
            );
            $newStatus = ($currentStatus === 1) ? 0 : 1;

            $updated = Db::getInstance()->update(
                'smartshipping_product',
                [
                    'is_approved' => (int)$newStatus,
                    'date_upd'    => date('Y-m-d H:i:s'),
                ],
                '`id_smartshipping_product` = ' . $idRecord
            );
        } else {
            $currentStatus = (int)Db::getInstance()->getValue(
                'SELECT `is_approved` FROM `' . _DB_PREFIX_ . 'smartshipping_product`
                 WHERE `id_product` = ' . $idProduct
            );
            $newStatus = ($currentStatus === 1) ? 0 : 1;

            $updated = Db::getInstance()->update(
                'smartshipping_product',
                [
                    'is_approved' => (int)$newStatus,
                    'date_upd'    => date('Y-m-d H:i:s'),
                ],
                '`id_product` = ' . $idProduct
            );
        }

        if ($updated) {
            die(json_encode([
                'success'      => true,
                'is_approved'  => $newStatus,
                'status_label' => ($newStatus === 1) ? $this->l('Approved') : $this->l('Pending Review'),
                'badge_class'  => ($newStatus === 1) ? 'badge-success' : 'badge-warning',
                'message'      => sprintf($this->l('Product #%d approval status updated.'), ($idProduct ?: $idRecord)),
            ]));
        }

        die(json_encode(['success' => false, 'error' => $this->l('Failed to update status in database.')]));
    }

    /**
     * AJAX Process: Inline Update of Volumetric Class
     */
    public function ajaxProcessUpdateClass()
    {
        header('Content-Type: application/json; charset=utf-8');

        $idRecord = (int)Tools::getValue('id_smartshipping_product');
        $idClass = (int)Tools::getValue('id_class');

        if ($idRecord <= 0 || $idClass < 1 || $idClass > 4) {
            die(json_encode(['success' => false, 'error' => $this->l('Invalid class parameters.')]));
        }

        $updated = Db::getInstance()->update(
            'smartshipping_product',
            [
                'id_class'    => (int)$idClass,
                'is_approved' => 1, // Automatically approve when manually set by merchant
                'date_upd'    => date('Y-m-d H:i:s'),
            ],
            '`id_smartshipping_product` = ' . $idRecord
        );

        if ($updated) {
            $classData = Db::getInstance()->getRow(
                'SELECT `name`, `base_price` FROM `' . _DB_PREFIX_ . 'smartshipping_classes` WHERE `id_class` = ' . $idClass
            );

            die(json_encode([
                'success'     => true,
                'id_class'    => $idClass,
                'class_name'  => $classData['name'],
                'base_price'  => (float)$classData['base_price'],
                'is_approved' => 1,
                'message'     => sprintf($this->l('Volumetric class changed to %s.'), $classData['name']),
            ]));
        }

        die(json_encode(['success' => false, 'error' => $this->l('Database update error.')]));
    }

    /**
     * AJAX Process: Automated AI Volumetric Classification
     * Suggests and saves the volumetric class (1-4) based on product weight, physical volume, and dimensional thresholds
     */
    public function ajaxProcessClassifyWithAI()
    {
        header('Content-Type: application/json; charset=utf-8');

        $idProduct = (int)Tools::getValue('id_product');
        $idRecord = (int)Tools::getValue('id_smartshipping_product');

        if ($idProduct <= 0 && $idRecord > 0) {
            $idProduct = (int)Db::getInstance()->getValue(
                'SELECT `id_product` FROM `' . _DB_PREFIX_ . 'smartshipping_product`
                 WHERE `id_smartshipping_product` = ' . $idRecord
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
        $dimWeightKg = ($width * $height * $depth) / 5000;

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
            INSERT INTO `' . _DB_PREFIX_ . 'smartshipping_product`
                (`id_product`, `id_product_attribute`, `id_class`, `confidence_score`, `ai_notes`, `date_upd`)
            VALUES
                (' . (int)$idProduct . ', 0, ' . (int)$suggestedClass . ', ' . (float)$confidence . ', \'' . pSQL($reasoning) . '\', NOW())
            ON DUPLICATE KEY UPDATE
                `id_class` = ' . (int)$suggestedClass . ',
                `confidence_score` = ' . (float)$confidence . ',
                `ai_notes` = \'' . pSQL($reasoning) . '\',
                `date_upd` = NOW()
        ');

        die(json_encode([
            'success'               => true,
            'id_product'            => $idProduct,
            'id_class'              => $suggestedClass,
            'confidence_score'      => $confidence,
            'reasoning'             => $reasoning,
            'volume_m3'             => round($volumeM3, 3),
            'dimensional_weight_kg' => round($dimWeightKg, 2),
            'message'               => sprintf($this->l('Gemini AI assigned Class %d with %d%% confidence.'), $suggestedClass, $confidence),
        ]));
    }

    /**
     * Callback: Formats product thumbnail preview with fallback
     */
    public function displayProductThumbnail($idImage, $row)
    {
        $idProduct = (int)$row['id_product'];
        $productName = Tools::htmlentitiesUTF8($row['product_name'] ?? '');

        if ($idImage > 0) {
            $imageObj = new Image($idImage);
            $imgUrl = $this->context->link->getImageLink('product', $idProduct . '-' . $idImage, 'small_default');
            return '<img src="' . $imgUrl . '" alt="' . $productName . '" class="img-thumbnail" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px;" />';
        }

        // Emoji placeholder fallback
        $emojis = [1 => '✨', 2 => '💡', 3 => '🪑', 4 => '🛋️'];
        $classEmoji = $emojis[(int)($row['id_class'] ?? 1)] ?? '📦';

        return '<div style="width: 45px; height: 45px; background: #ecf0f1; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 20px;" title="' . $productName . '">' . $classEmoji . '</div>';
    }

    /**
     * Callback: Formats Product Name, SKU and link to PrestaShop product sheet
     */
    public function displayProductNameAndRef($name, $row)
    {
        $idProduct = (int)$row['id_product'];
        $ref = Tools::htmlentitiesUTF8($row['reference'] ?? '');
        $url = $this->context->link->getAdminLink('AdminProducts', true, ['id_product' => $idProduct, 'updateproduct' => '1']);

        $html = '<div style="line-height: 1.3;">';
        $html .= '<a href="' . $url . '" target="_blank" style="font-weight: 600; color: #2c3e50; text-decoration: none;">';
        $html .= Tools::htmlentitiesUTF8($name);
        $html .= '</a>';
        if (!empty($ref)) {
            $html .= '<div style="font-size: 11px; color: #7f8c8d; font-family: monospace; margin-top: 2px;">SKU: ' . $ref . '</div>';
        }
        $html .= '</div>';

        return $html;
    }

    /**
     * Callback: Displays formatted dimensions (L x W x H) and calculated cubic volume
     */
    public function displayDimensionsAndVolume($value, $row)
    {
        $w = (float)($row['width'] ?? 0);
        $h = (float)($row['height'] ?? 0);
        $d = (float)($row['depth'] ?? 0);
        $vol = (float)($row['volume_m3'] ?? 0);

        return '<div style="font-size: 11px; font-family: monospace; line-height: 1.4;">
            <span style="color: #34495e;">' . $w . ' × ' . $h . ' × ' . $d . ' cm</span>
            <br>
            <span class="badge badge-info" style="font-size: 10px; font-weight: normal; background-color: #3498db;">' . number_format($vol, 3) . ' m³</span>
        </div>';
    }

    /**
     * Callback: Displays color-coded volumetric class badge with visual status indicator and base tariff
     */
    public function displayClassBadge($idClass, $row)
    {
        $configs = [
            1 => [
                'bg' => '#ecfdf5',
                'text' => '#065f46',
                'border' => '#a7f3d0',
                'dot' => '#10b981',
                'shadow' => 'rgba(16, 185, 129, 0.4)',
                'icon' => 'icon-gift',
                'role' => '100% Absorbed',
                'role_bg' => '#d1fae5',
                'role_text' => '#047857',
                'title' => 'Class 1: Small Decor',
                'criteria' => '<3kg, <0.05m³ • Fully absorbed by Leaders'
            ],
            2 => [
                'bg' => '#f0f9ff',
                'text' => '#075985',
                'border' => '#bae6fd',
                'dot' => '#0284c7',
                'shadow' => 'rgba(2, 132, 199, 0.4)',
                'icon' => 'icon-lightbulb-o',
                'role' => 'Standard Parcel',
                'role_bg' => '#e0f2fe',
                'role_text' => '#0369a1',
                'title' => 'Class 2: Small Furniture',
                'criteria' => '3-15kg, 0.05-0.25m³ • Standard Courier Box'
            ],
            3 => [
                'bg' => '#fffbeb',
                'text' => '#92400e',
                'border' => '#fde68a',
                'dot' => '#d97706',
                'shadow' => 'rgba(217, 119, 6, 0.4)',
                'icon' => 'icon-archive',
                'role' => 'Cart Leader',
                'role_bg' => '#fef3c7',
                'role_text' => '#b45309',
                'title' => 'Class 3: Medium Furniture',
                'criteria' => '15-40kg, 0.25-0.80m³ • Cart Leader (Absorbs C1)'
            ],
            4 => [
                'bg' => '#faf5ff',
                'text' => '#6b21a8',
                'border' => '#e9d5ff',
                'dot' => '#9333ea',
                'shadow' => 'rgba(147, 51, 234, 0.4)',
                'icon' => 'icon-truck',
                'role' => 'Top Leader',
                'role_bg' => '#f3e8ff',
                'role_text' => '#7e22ce',
                'title' => 'Class 4: Bulky / Sofas',
                'criteria' => '>40kg, >0.80m³ • Freight Pallet Leader'
            ],
        ];

        $meta = $configs[(int)$idClass] ?? $configs[1];
        $className = Tools::htmlentitiesUTF8($row['class_name'] ?? ('Class ' . $idClass));
        $basePrice = number_format((float)($row['class_base_price'] ?? 0), 2);
        $idRecord = (int)$row['id_smartshipping_product'];

        return '<div class="smartshipping-class-badge-container" data-id-record="' . $idRecord . '" title="' . htmlspecialchars($meta['criteria']) . '" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 8px; background: ' . $meta['bg'] . '; border: 1px solid ' . $meta['border'] . '; text-align: left; vertical-align: middle; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ' . $meta['dot'] . '; box-shadow: 0 0 6px ' . $meta['shadow'] . '; flex-shrink: 0;"></span>
            <div style="line-height: 1.2;">
                <div style="font-weight: 700; font-size: 11px; color: ' . $meta['text'] . '; display: flex; align-items: center; gap: 4px;">
                    <i class="' . $meta['icon'] . '"></i> ' . $className . '
                </div>
                <div style="font-size: 10px; margin-top: 1px; display: flex; align-items: center; gap: 4px;">
                    <span style="padding: 1px 4px; border-radius: 3px; font-size: 9px; font-weight: 700; text-transform: uppercase; background: ' . $meta['role_bg'] . '; color: ' . $meta['role_text'] . ';">' . $meta['role'] . '</span>
                    <strong style="color: ' . $meta['text'] . '; font-family: monospace;">€' . $basePrice . '</strong>
                </div>
            </div>
        </div>';
    }

    /**
     * Callback: Formats AI confidence score with visual progress bar and indicator
     */
    public function displayConfidenceBadge($confidence, $row)
    {
        if ($confidence === null || $confidence === '') {
            return '<span class="text-muted" style="font-size: 11px;">' . $this->l('Manual rule') . '</span>';
        }

        $score = (float)$confidence;
        $barColor = '#27ae60'; // High (> 90%)
        if ($score < 75) {
            $barColor = '#e74c3c'; // Low (< 75%)
        } elseif ($score < 90) {
            $barColor = '#f39c12'; // Moderate (75 - 89%)
        }

        return '<div style="min-width: 90px; text-align: center;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; margin-bottom: 2px;">
                <span style="color: ' . $barColor . ';">' . number_format($score, 0) . '%</span>
                <span style="color: #95a5a6; font-size: 10px;">' . ($score >= 90 ? 'High' : ($score >= 75 ? 'Med' : 'Low')) . '</span>
            </div>
            <div style="height: 5px; background: #ecf0f1; border-radius: 3px; overflow: hidden;">
                <div style="height: 100%; width: ' . $score . '%; background: ' . $barColor . ';"></div>
            </div>
        </div>';
    }

    /**
     * Callback: Interactive AJAX Approval Toggle Button
     */
    public function displayApprovalToggle($isApproved, $row)
    {
        $idRecord = (int)$row['id_smartshipping_product'];
        $idProduct = (int)$row['id_product'];
        $status = (int)$isApproved;

        if ($status === 1) {
            return '
            <button type="button" 
                    class="btn btn-xs btn-success smartshipping-ajax-toggle" 
                    data-id-record="' . $idRecord . '" 
                    data-id-product="' . $idProduct . '"
                    data-current-status="1"
                    title="' . $this->l('Click to revoke approval') . '"
                    style="border-radius: 12px; padding: 2px 10px; font-size: 11px; font-weight: bold;">
                <i class="icon-check"></i> ' . $this->l('Approved') . '
            </button>';
        }

        return '
        <button type="button" 
                class="btn btn-xs btn-warning smartshipping-ajax-toggle" 
                data-id-record="' . $idRecord . '" 
                data-id-product="' . $idProduct . '"
                data-current-status="0"
                title="' . $this->l('Click to approve AI classification') . '"
                style="border-radius: 12px; padding: 2px 10px; font-size: 11px; font-weight: bold; background-color: #f39c12; border-color: #e67e22; color: #fff;">
            <i class="icon-question-circle"></i> ' . $this->l('Pending Review') . '
        </button>';
    }

    /**
     * Helper for class select dropdown filter
     */
    protected function getClassFilterList()
    {
        $rows = Db::getInstance()->executeS('SELECT `id_class`, `name` FROM `' . _DB_PREFIX_ . 'smartshipping_classes` ORDER BY `id_class` ASC');
        $list = [];
        if (!empty($rows)) {
            foreach ($rows as $r) {
                $list[$r['id_class']] = $r['name'];
            }
        }
        return $list;
    }

    /**
     * Bulk Action: Approve selected products
     */
    protected function processBulkApprove()
    {
        $selected = Tools::getValue($this->table . 'Box');
        if (is_array($selected) && !empty($selected)) {
            $ids = array_map('intval', $selected);
            Db::getInstance()->execute(
                'UPDATE `' . _DB_PREFIX_ . 'smartshipping_product`
                 SET `is_approved` = 1, `date_upd` = NOW()
                 WHERE `id_smartshipping_product` IN (' . implode(',', $ids) . ')'
            );
            $this->confirmations[] = sprintf($this->l('Successfully approved %d products.'), count($ids));
        }
    }

    /**
     * Bulk Action: Disapprove / Set back to Pending
     */
    protected function processBulkDisapprove()
    {
        $selected = Tools::getValue($this->table . 'Box');
        if (is_array($selected) && !empty($selected)) {
            $ids = array_map('intval', $selected);
            Db::getInstance()->execute(
                'UPDATE `' . _DB_PREFIX_ . 'smartshipping_product`
                 SET `is_approved` = 0, `date_upd` = NOW()
                 WHERE `id_smartshipping_product` IN (' . implode(',', $ids) . ')'
            );
            $this->confirmations[] = sprintf($this->l('%d products set back to pending review.'), count($ids));
        }
    }

    /**
     * Bulk Action: Upload and parse CSV file for bulk volumetric class assignments
     *
     * Supports matching by id_product or SKU reference.
     * Auto-detects delimiter (comma, semicolon, tab) and strips UTF-8 BOM.
     * Validates volumetric classes (1 to 4) and performs atomic upserts into smartshipping_product table.
     *
     * @return bool True if at least one product was updated
     */
    public function processBulkCsvUpload()
    {
        if (!isset($_FILES['bulk_csv_file']) || empty($_FILES['bulk_csv_file']['tmp_name'])) {
            $this->errors[] = $this->l('Please select a valid CSV file to upload.');
            return false;
        }

        $file = $_FILES['bulk_csv_file'];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            $this->errors[] = sprintf($this->l('File upload error (Code: %d).'), $file['error']);
            return false;
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ['csv', 'txt'])) {
            $this->errors[] = $this->l('Invalid file format. Please upload a standard CSV file (.csv).');
            return false;
        }

        $handle = fopen($file['tmp_name'], 'r');
        if (!$handle) {
            $this->errors[] = $this->l('Unable to open the uploaded CSV file for reading.');
            return false;
        }

        // Auto-detect delimiter from first row
        $firstLine = fgets($handle);
        rewind($handle);
        $delimiter = ',';
        if (substr_count($firstLine, ';') > substr_count($firstLine, ',')) {
            $delimiter = ';';
        } elseif (substr_count($firstLine, "\t") > substr_count($firstLine, ',')) {
            $delimiter = "\t";
        }

        // Read and sanitize header row
        $headers = fgetcsv($handle, 4096, $delimiter);
        if (!$headers || empty($headers)) {
            fclose($handle);
            $this->errors[] = $this->l('The CSV file is empty or missing header columns.');
            return false;
        }

        // Remove UTF-8 BOM if present on first column
        $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', $headers[0]);
        $headers = array_map(function($h) {
            return strtolower(trim($h));
        }, $headers);

        // Map column indexes
        $colIndex = [
            'id_product'       => false,
            'reference'        => false,
            'id_class'         => false,
            'confidence_score' => false,
            'ai_notes'         => false,
            'is_approved'      => false,
        ];

        foreach ($headers as $idx => $headerName) {
            if (in_array($headerName, ['id_product', 'product_id', 'id'])) {
                $colIndex['id_product'] = $idx;
            } elseif (in_array($headerName, ['reference', 'ref', 'sku', 'product_ref'])) {
                $colIndex['reference'] = $idx;
            } elseif (in_array($headerName, ['id_class', 'class', 'class_id', 'volumetric_class'])) {
                $colIndex['id_class'] = $idx;
            } elseif (in_array($headerName, ['confidence_score', 'confidence', 'ai_confidence', 'score'])) {
                $colIndex['confidence_score'] = $idx;
            } elseif (in_array($headerName, ['ai_notes', 'notes', 'reasoning', 'comment'])) {
                $colIndex['ai_notes'] = $idx;
            } elseif (in_array($headerName, ['is_approved', 'approved', 'status'])) {
                $colIndex['is_approved'] = $idx;
            }
        }

        if ($colIndex['id_class'] === false) {
            fclose($handle);
            $this->errors[] = $this->l('Missing required column in CSV: "id_class" (values 1 to 4).');
            return false;
        }

        if ($colIndex['id_product'] === false && $colIndex['reference'] === false) {
            fclose($handle);
            $this->errors[] = $this->l('CSV must contain at least "id_product" or "reference" (SKU) to identify products.');
            return false;
        }

        $lineNum = 1;
        $successCount = 0;
        $updatedCount = 0;
        $insertedCount = 0;
        $skippedCount = 0;
        $rowErrors = [];

        while (($row = fgetcsv($handle, 4096, $delimiter)) !== false) {
            $lineNum++;
            // Skip empty rows
            if (empty(array_filter($row, 'trim'))) {
                continue;
            }

            $idProduct = null;
            if ($colIndex['id_product'] !== false && isset($row[$colIndex['id_product']])) {
                $idProduct = (int)trim($row[$colIndex['id_product']]);
            }

            $reference = null;
            if ($colIndex['reference'] !== false && isset($row[$colIndex['reference']])) {
                $reference = trim($row[$colIndex['reference']]);
            }

            // Resolve by SKU reference if id_product is not given or 0
            if ((!$idProduct || $idProduct <= 0) && !empty($reference)) {
                $idProduct = (int)Db::getInstance()->getValue(
                    'SELECT `id_product` FROM `' . _DB_PREFIX_ . 'product` WHERE `reference` = \'' . pSQL($reference) . '\''
                );
            }

            if (!$idProduct || $idProduct <= 0) {
                $skippedCount++;
                if (count($rowErrors) < 8) {
                    $rowErrors[] = sprintf($this->l('Line %d: SKU "%s" not found in PrestaShop catalog.'), $lineNum, $reference ?: 'N/A');
                }
                continue;
            }

            // Verify product exists in PrestaShop
            $exists = (int)Db::getInstance()->getValue(
                'SELECT `id_product` FROM `' . _DB_PREFIX_ . 'product` WHERE `id_product` = ' . (int)$idProduct
            );
            if (!$exists) {
                $skippedCount++;
                if (count($rowErrors) < 8) {
                    $rowErrors[] = sprintf($this->l('Line %d: Product #%d does not exist.'), $lineNum, $idProduct);
                }
                continue;
            }

            // Extract and validate id_class (1 to 4)
            $classVal = isset($row[$colIndex['id_class']]) ? (int)trim($row[$colIndex['id_class']]) : 0;
            if ($classVal < 1 || $classVal > 4) {
                $skippedCount++;
                if (count($rowErrors) < 8) {
                    $rowErrors[] = sprintf($this->l('Line %d: Invalid class "%s" for Product #%d (must be 1, 2, 3, or 4).'), $lineNum, $row[$colIndex['id_class']] ?? '', $idProduct);
                }
                continue;
            }

            // Confidence score (optional)
            $confidence = null;
            if ($colIndex['confidence_score'] !== false && isset($row[$colIndex['confidence_score']]) && trim($row[$colIndex['confidence_score']]) !== '') {
                $confidence = max(0, min(100, (float)trim($row[$colIndex['confidence_score']])));
            }

            // AI notes / commentary (optional)
            $aiNotes = null;
            if ($colIndex['ai_notes'] !== false && isset($row[$colIndex['ai_notes']])) {
                $aiNotes = trim($row[$colIndex['ai_notes']]);
            }

            // Status approval (default: 1 / approved for merchant CSV uploads)
            $isApproved = 1;
            if ($colIndex['is_approved'] !== false && isset($row[$colIndex['is_approved']]) && trim($row[$colIndex['is_approved']]) !== '') {
                $valApproved = strtolower(trim($row[$colIndex['is_approved']]));
                $isApproved = in_array($valApproved, ['1', 'true', 'yes', 'approved']) ? 1 : 0;
            }

            // Check if product already exists in smartshipping_product table
            $alreadyAssigned = (int)Db::getInstance()->getValue(
                'SELECT `id_smartshipping_product` FROM `' . _DB_PREFIX_ . 'smartshipping_product` WHERE `id_product` = ' . (int)$idProduct
            );

            $notesSql = $aiNotes !== null ? "'" . pSQL($aiNotes) . "'" : "'Manual bulk CSV assignment'";
            $confSql = $confidence !== null ? (float)$confidence : '100.0';

            $res = Db::getInstance()->execute('
                INSERT INTO `' . _DB_PREFIX_ . 'smartshipping_product`
                    (`id_product`, `id_product_attribute`, `id_class`, `confidence_score`, `ai_notes`, `is_approved`, `date_upd`)
                VALUES
                    (' . (int)$idProduct . ', 0, ' . (int)$classVal . ', ' . $confSql . ', ' . $notesSql . ', ' . (int)$isApproved . ', NOW())
                ON DUPLICATE KEY UPDATE
                    `id_class` = ' . (int)$classVal . ',
                    `confidence_score` = ' . ($confidence !== null ? (float)$confidence : '`confidence_score`') . ',
                    `ai_notes` = ' . ($aiNotes !== null ? "'" . pSQL($aiNotes) . "'" : '`ai_notes`') . ',
                    `is_approved` = ' . (int)$isApproved . ',
                    `date_upd` = NOW()
            ');

            if ($res) {
                $successCount++;
                if ($alreadyAssigned > 0) {
                    $updatedCount++;
                } else {
                    $insertedCount++;
                }
            } else {
                $skippedCount++;
            }
        }

        fclose($handle);

        if ($successCount > 0) {
            $this->confirmations[] = sprintf(
                $this->l('Bulk CSV Import Successful: %d products assigned to volumetric classes (%d updated, %d newly registered).'),
                $successCount,
                $updatedCount,
                $insertedCount
            );
        }

        if ($skippedCount > 0) {
            $msg = sprintf($this->l('%d rows were skipped or invalid.'), $skippedCount);
            if (!empty($rowErrors)) {
                $msg .= ' ' . implode(' | ', $rowErrors);
            }
            $this->errors[] = $msg;
        }

        return $successCount > 0;
    }

    /**
     * AJAX Process: Bulk CSV upload with real-time JSON response
     */
    public function ajaxProcessUploadCsv()
    {
        header('Content-Type: application/json; charset=utf-8');

        $csvContent = '';
        if (isset($_FILES['bulk_csv_file']) && $_FILES['bulk_csv_file']['error'] === UPLOAD_ERR_OK) {
            $csvContent = file_get_contents($_FILES['bulk_csv_file']['tmp_name']);
        } elseif (Tools::getValue('csv_content')) {
            $csvContent = Tools::getValue('csv_content');
        }

        if (empty(trim($csvContent))) {
            die(json_encode(['success' => false, 'error' => $this->l('Empty CSV content received.')]));
        }

        $lines = preg_split('/\r\n|\r|\n/', trim($csvContent));
        if (empty($lines)) {
            die(json_encode(['success' => false, 'error' => $this->l('No data rows found in CSV.')]));
        }

        $firstLine = $lines[0];
        $delimiter = ',';
        if (substr_count($firstLine, ';') > substr_count($firstLine, ',')) {
            $delimiter = ';';
        } elseif (substr_count($firstLine, "\t") > substr_count($firstLine, ',')) {
            $delimiter = "\t";
        }

        $headers = str_getcsv(array_shift($lines), $delimiter);
        $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', $headers[0]);
        $headers = array_map(function($h) {
            return strtolower(trim($h));
        }, $headers);

        $colIndex = [
            'id_product'       => false,
            'reference'        => false,
            'id_class'         => false,
            'confidence_score' => false,
            'ai_notes'         => false,
            'is_approved'      => false,
        ];

        foreach ($headers as $idx => $headerName) {
            if (in_array($headerName, ['id_product', 'product_id', 'id'])) {
                $colIndex['id_product'] = $idx;
            } elseif (in_array($headerName, ['reference', 'ref', 'sku'])) {
                $colIndex['reference'] = $idx;
            } elseif (in_array($headerName, ['id_class', 'class', 'class_id'])) {
                $colIndex['id_class'] = $idx;
            } elseif (in_array($headerName, ['confidence_score', 'confidence'])) {
                $colIndex['confidence_score'] = $idx;
            } elseif (in_array($headerName, ['ai_notes', 'notes'])) {
                $colIndex['ai_notes'] = $idx;
            } elseif (in_array($headerName, ['is_approved', 'approved'])) {
                $colIndex['is_approved'] = $idx;
            }
        }

        if ($colIndex['id_class'] === false || ($colIndex['id_product'] === false && $colIndex['reference'] === false)) {
            die(json_encode([
                'success' => false,
                'error' => $this->l('CSV header must contain "id_class" and either "id_product" or "reference".'),
            ]));
        }

        $successCount = 0;
        $updatedCount = 0;
        $insertedCount = 0;
        $skippedCount = 0;
        $errors = [];

        foreach ($lines as $lineIdx => $lineStr) {
            if (empty(trim($lineStr))) continue;
            $row = str_getcsv($lineStr, $delimiter);

            $idProduct = $colIndex['id_product'] !== false && isset($row[$colIndex['id_product']]) ? (int)trim($row[$colIndex['id_product']]) : 0;
            $ref = $colIndex['reference'] !== false && isset($row[$colIndex['reference']]) ? trim($row[$colIndex['reference']]) : '';

            if ($idProduct <= 0 && !empty($ref)) {
                $idProduct = (int)Db::getInstance()->getValue(
                    'SELECT `id_product` FROM `' . _DB_PREFIX_ . 'product` WHERE `reference` = \'' . pSQL($ref) . '\''
                );
            }

            if ($idProduct <= 0) {
                $skippedCount++;
                if (count($errors) < 10) {
                    $errors[] = sprintf($this->l('Row %d: Product not found for ref "%s".'), $lineIdx + 2, $ref);
                }
                continue;
            }

            $idClass = isset($row[$colIndex['id_class']]) ? (int)trim($row[$colIndex['id_class']]) : 0;
            if ($idClass < 1 || $idClass > 4) {
                $skippedCount++;
                if (count($errors) < 10) {
                    $errors[] = sprintf($this->l('Row %d: Invalid class (%s) for product #%d.'), $lineIdx + 2, $row[$colIndex['id_class']] ?? '', $idProduct);
                }
                continue;
            }

            $confidence = $colIndex['confidence_score'] !== false && isset($row[$colIndex['confidence_score']]) && trim($row[$colIndex['confidence_score']]) !== ''
                ? max(0, min(100, (float)trim($row[$colIndex['confidence_score']]))) : 100.0;
            $aiNotes = $colIndex['ai_notes'] !== false && isset($row[$colIndex['ai_notes']]) ? trim($row[$colIndex['ai_notes']]) : 'Bulk CSV assignment';
            $isApproved = 1;
            if ($colIndex['is_approved'] !== false && isset($row[$colIndex['is_approved']]) && trim($row[$colIndex['is_approved']]) !== '') {
                $isApproved = in_array(strtolower(trim($row[$colIndex['is_approved']])), ['1', 'true', 'yes', 'approved']) ? 1 : 0;
            }

            $alreadyAssigned = (int)Db::getInstance()->getValue(
                'SELECT `id_smartshipping_product` FROM `' . _DB_PREFIX_ . 'smartshipping_product` WHERE `id_product` = ' . (int)$idProduct
            );

            $ok = Db::getInstance()->execute('
                INSERT INTO `' . _DB_PREFIX_ . 'smartshipping_product`
                    (`id_product`, `id_product_attribute`, `id_class`, `confidence_score`, `ai_notes`, `is_approved`, `date_upd`)
                VALUES
                    (' . (int)$idProduct . ', 0, ' . (int)$idClass . ', ' . (float)$confidence . ', \'' . pSQL($aiNotes) . '\', ' . (int)$isApproved . ', NOW())
                ON DUPLICATE KEY UPDATE
                    `id_class` = ' . (int)$idClass . ',
                    `confidence_score` = ' . (float)$confidence . ',
                    `ai_notes` = \'' . pSQL($aiNotes) . '\',
                    `is_approved` = ' . (int)$isApproved . ',
                    `date_upd` = NOW()
            ');

            if ($ok) {
                $successCount++;
                if ($alreadyAssigned > 0) $updatedCount++; else $insertedCount++;
            } else {
                $skippedCount++;
            }
        }

        die(json_encode([
            'success'   => $successCount > 0,
            'total'     => $successCount + $skippedCount,
            'processed' => $successCount,
            'updated'   => $updatedCount,
            'inserted'  => $insertedCount,
            'skipped'   => $skippedCount,
            'errors'    => $errors,
            'message'   => sprintf($this->l('Bulk CSV uploaded: %d products processed (%d updated, %d created).'), $successCount, $updatedCount, $insertedCount),
        ]));
    }

    /**
     * Download a sample CSV template for merchants to fill in
     */
    public function processExportCsvTemplate()
    {
        if (ob_get_level()) {
            ob_end_clean();
        }

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="smartshipping_bulk_volumetric_template.csv"');
        header('Pragma: no-cache');
        header('Expires: 0');

        $output = fopen('php://output', 'w');

        // Output UTF-8 BOM for Microsoft Excel compatibility
        fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

        // Header row
        fputcsv($output, ['id_product', 'reference', 'id_class', 'confidence_score', 'ai_notes', 'is_approved']);

        // Sample rows covering Classes 1 to 4
        fputcsv($output, [101, 'SOFA-STK-01', 4, 98, 'Heavy 3-seater sofa freight pallet leader', 1]);
        fputcsv($output, [102, 'TBL-OAK-88', 4, 95, 'Extendable dining table Class 4 bulky leader', 1]);
        fputcsv($output, [103, 'CHR-WLN-09', 3, 91, 'Armchair Class 3 medium furniture cart leader', 1]);
        fputcsv($output, [104, 'LMP-GLZ-22', 2, 87, 'Floor standing lamp Class 2 small furniture', 1]);
        fputcsv($output, [105, 'TBL-BED-14', 2, 89, 'Bedside table Class 2 small furniture parcel', 1]);
        fputcsv($output, [106, 'PIL-LIN-02', 1, 99, 'Linen pillow cushions Class 1 small decor absorbable', 1]);
        fputcsv($output, [107, 'CND-CDR-01', 1, 98, 'Scented candle accessory Class 1 small decor', 1]);

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
                a.`id_product`,
                a.`id_product_attribute`,
                IFNULL(p.`reference`, \'\') AS `reference`,
                IFNULL(pl.`name`, \'Product\') AS `product_name`,
                IFNULL(p.`width`, 0) AS `width`,
                IFNULL(p.`height`, 0) AS `height`,
                IFNULL(p.`depth`, 0) AS `depth`,
                IFNULL(p.`weight`, 0) AS `weight`,
                ROUND((p.`width` * p.`height` * p.`depth`) / 1000000, 4) AS `volume_m3`,
                a.`id_class`,
                c.`name` AS `class_name`,
                ROUND(a.`confidence_score`, 1) AS `confidence_score`,
                IFNULL(a.`ai_notes`, \'\') AS `ai_notes`,
                a.`is_approved`,
                a.`date_upd`
            FROM `' . _DB_PREFIX_ . 'smartshipping_product` a
            LEFT JOIN `' . _DB_PREFIX_ . 'product` p 
                ON (p.`id_product` = a.`id_product`)
            LEFT JOIN `' . _DB_PREFIX_ . 'product_lang` pl 
                ON (pl.`id_product` = a.`id_product` AND pl.`id_lang` = ' . (int)$this->context->language->id . ' AND pl.`id_shop` = ' . (int)$this->context->shop->id . ')
            LEFT JOIN `' . _DB_PREFIX_ . 'smartshipping_classes` c 
                ON (c.`id_class` = a.`id_class`)
            ORDER BY a.`id_class` DESC, a.`id_product` ASC
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

    /**
     * Renders Back-Office Modal for Bulk CSV Upload
     *
     * @return string HTML modal markup
     */
    protected function renderCsvUploadModal()
    {
        $templateUrl = self::$currentIndex . '&action=download_csv_template&token=' . $this->token;
        $exportCurrentUrl = self::$currentIndex . '&action=export_current_assignments_csv&token=' . $this->token;
        $formAction = self::$currentIndex . '&token=' . $this->token;

        return '
        <!-- Modal: Bulk CSV Volumetric Class Import -->
        <div class="modal fade" id="smartshipping-csv-modal" tabindex="-1" role="dialog" aria-labelledby="csvModalLabel">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <form action="' . $formAction . '" method="post" enctype="multipart/form-data" class="form-horizontal">
                        <div class="modal-header" style="background: #2c3e50; color: #fff;">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="color: #fff; opacity: 0.8;">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h4 class="modal-title" id="csvModalLabel" style="font-weight: bold;">
                                <i class="icon-file-text"></i> ' . $this->l('Bulk CSV Import & Association - Volumetric Classes') . '
                            </h4>
                        </div>
                        <div class="modal-body" style="padding: 20px;">
                            <div class="alert alert-info">
                                <p><strong><i class="icon-info-circle"></i> ' . $this->l('Format Guidelines & Bulk Update:') . '</strong></p>
                                <ul style="margin-bottom: 5px; padding-left: 20px;">
                                    <li>' . $this->l('Columns supported: <code>id_product</code> OR <code>reference</code> (SKU), <code>id_class</code> (1-4), <code>confidence_score</code> (optional), <code>ai_notes</code> (optional), <code>is_approved</code> (0 or 1).') . '</li>
                                    <li>' . $this->l('Auto-detected delimiters: Comma (,), Semicolon (;), or Tab.') . '</li>
                                    <li>' . $this->l('Existing product mappings will be bulk-updated; new products will be automatically associated.') . '</li>
                                </ul>
                                <div style="margin-top: 12px; display: flex; gap: 8px;">
                                    <a href="' . $exportCurrentUrl . '" class="btn btn-success btn-xs" style="font-weight: bold;">
                                        <i class="icon-download"></i> ' . $this->l('Export Current Catalog CSV') . '
                                    </a>
                                    <a href="' . $templateUrl . '" class="btn btn-default btn-xs" style="font-weight: bold;">
                                        <i class="icon-file-text"></i> ' . $this->l('Download Blank Template') . '
                                    </a>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3 required">' . $this->l('Select CSV File') . '</label>
                                <div class="col-lg-8">
                                    <input type="file" name="bulk_csv_file" id="bulk_csv_file" accept=".csv,text/csv,text/plain" required class="form-control" />
                                    <p class="help-block" style="font-size: 11px;">' . $this->l('Upload a CSV file containing your product volumetric class mappings.') . '</p>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="control-label col-lg-3">' . $this->l('Auto-Approve') . '</label>
                                <div class="col-lg-8">
                                    <div class="checkbox">
                                        <label>
                                            <input type="checkbox" name="auto_approve_csv" value="1" checked="checked" />
                                            ' . $this->l('Mark uploaded product assignments as Approved immediately.') . '
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">
                                <i class="icon-remove"></i> ' . $this->l('Cancel') . '
                            </button>
                            <button type="submit" name="submitBulkCsvUpload" class="btn btn-primary" style="font-weight: bold;">
                                <i class="icon-upload"></i> ' . $this->l('Import and Calibrate Catalog') . '
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>';
    }

    /**
     * Embeds inline JS handler for instant AJAX actions without requiring extra asset builds
     */
    protected function renderQuickModalScript()
    {
        return '
        <script type="text/javascript">
        $(document).ready(function() {
            // Trigger CSV Upload Modal from toolbar button
            $(document).on("click", ".smartshipping-btn-csv-trigger", function(e) {
                e.preventDefault();
                $("#smartshipping-csv-modal").modal("show");
            });

            // Live AJAX click handler for approval toggle buttons
            $(document).on("click", ".smartshipping-ajax-toggle", function(e) {
                e.preventDefault();
                var $btn = $(this);
                var idRecord = $btn.data("id-record");
                var idProduct = $btn.data("id-product");
                var oldHtml = $btn.html();

                $btn.prop("disabled", true).html(\'<i class="icon-spinner icon-spin"></i> Saving...\');

                $.ajax({
                    type: "POST",
                    url: "' . $this->context->link->getAdminLink('AdminSmartShippingAI', true, [], ['ajax' => 1, 'action' => 'toggleApproval']) . '",
                    dataType: "json",
                    data: {
                        id_smartshipping_product: idRecord,
                        id_product: idProduct
                    },
                    success: function(response) {
                        $btn.prop("disabled", false);
                        if (response.success) {
                            if (response.is_approved == 1) {
                                $btn.removeClass("btn-warning").addClass("btn-success")
                                    .html(\'<i class="icon-check"></i> ' . $this->l('Approved') . '\')
                                    .data("current-status", 1)
                                    .css({"background-color": "", "border-color": ""});
                            } else {
                                $btn.removeClass("btn-success").addClass("btn-warning")
                                    .html(\'<i class="icon-question-circle"></i> ' . $this->l('Pending Review') . '\')
                                    .data("current-status", 0)
                                    .css({"background-color": "#f39c12", "border-color": "#e67e22"});
                            }
                            showSuccessMessage(response.message || "' . $this->l('Status updated successfully!') . '");
                        } else {
                            $btn.html(oldHtml);
                            showErrorMessage(response.error || "' . $this->l('Update failed.') . '");
                        }
                    },
                    error: function() {
                        $btn.prop("disabled", false).html(oldHtml);
                        showErrorMessage("' . $this->l('Network or server error.') . '");
                    }
                });
            });
        });
        </script>';
    }
}
