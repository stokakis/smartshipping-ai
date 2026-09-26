<?php
/**
 * 2026 SmartShipping AI - Courier Live Webhook Receiver
 *
 * @author    Senior PrestaShop Logistics Expert
 * @copyright 2026 SmartShipping AI
 * @license   http://opensource.org/licenses/afl-3.0.php Academic Free License (AFL 3.0)
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

class SmartshippingaiWebhookModuleFrontController extends ModuleFrontController
{
    public $ssl = true;
    public $ajax = true;

    /**
     * PostProcess handles incoming courier webhook callbacks (DHL, ACS, Speedex)
     */
    public function postProcess()
    {
        header('Content-Type: application/json; charset=utf-8');

        // 1. Verify Secret Webhook Token
        $secretToken = Configuration::get('SMARTSHIPPINGAI_WEBHOOK_SECRET');
        $authHeader = isset($_SERVER['HTTP_X_COURIER_SIGNATURE']) ? $_SERVER['HTTP_X_COURIER_SIGNATURE'] : Tools::getValue('token');

        if (!empty($secretToken) && $authHeader !== $secretToken) {
            http_response_code(401);
            die(json_encode([
                'success' => false,
                'error' => 'Invalid or missing courier webhook authorization signature.',
            ]));
        }

        // 2. Read JSON Payload
        $rawInput = Tools::file_get_contents('php://input');
        $payload = json_decode($rawInput, true);

        if (!$payload || !isset($payload['tracking_number'])) {
            http_response_code(400);
            die(json_encode([
                'success' => false,
                'error' => 'Malformed JSON payload. Expected tracking_number and event status.',
            ]));
        }

        $trackingNumber = pSQL($payload['tracking_number']);
        $courier = isset($payload['courier']) ? pSQL($payload['courier']) : 'COURIER';
        $statusCode = isset($payload['status']) ? pSQL($payload['status']) : 'IN_TRANSIT';
        $location = isset($payload['location']) ? pSQL($payload['location']) : 'Distribution Hub';
        $timestamp = isset($payload['timestamp']) ? pSQL($payload['timestamp']) : date('Y-m-d H:i:s');

        // 3. Find associated Order by tracking number or order_id
        $idOrder = 0;
        if (isset($payload['order_id']) && (int)$payload['order_id'] > 0) {
            $idOrder = (int)$payload['order_id'];
        } else {
            $sql = 'SELECT `id_order` FROM `' . _DB_PREFIX_ . 'order_carrier` 
                    WHERE `tracking_number` = \'' . $trackingNumber . '\' 
                    ORDER BY `id_order` DESC';
            $idOrder = (int)Db::getInstance()->getValue($sql);
        }

        if ($idOrder > 0) {
            $order = new Order($idOrder);
            if (Validate::isLoadedObject($order)) {
                // Map Courier event to PrestaShop Order State
                $newStatusId = 0;
                switch (strtoupper($statusCode)) {
                    case 'PICKED_UP':
                    case 'IN_TRANSIT':
                        $newStatusId = (int)Configuration::get('PS_OS_SHIPPING');
                        break;
                    case 'OUT_FOR_DELIVERY':
                        $newStatusId = (int)Configuration::get('PS_OS_SHIPPING');
                        break;
                    case 'DELIVERED':
                        $newStatusId = (int)Configuration::get('PS_OS_DELIVERED');
                        break;
                    case 'EXCEPTION':
                    case 'FAILED_ATTEMPT':
                        // Log exception event
                        break;
                }

                // Update PrestaShop tracking number if empty
                if (empty($order->shipping_number)) {
                    $order->shipping_number = $trackingNumber;
                    $order->update();

                    // Update order carrier table
                    Db::getInstance()->execute('UPDATE `' . _DB_PREFIX_ . 'order_carrier` 
                        SET `tracking_number` = \'' . $trackingNumber . '\' 
                        WHERE `id_order` = ' . (int)$idOrder);
                }

                // Update Order Status History if state changed
                if ($newStatusId > 0 && (int)$order->current_state !== $newStatusId) {
                    $history = new OrderHistory();
                    $history->id_order = (int)$order->id;
                    $history->changeIdOrderState($newStatusId, (int)$order->id);
                    $history->addWithemail(true);
                }

                // Trigger PrestaShop hook for third-party modules
                Hook::exec('actionCarrierProcessWebhook', [
                    'order' => $order,
                    'courier' => $courier,
                    'tracking_number' => $trackingNumber,
                    'status' => $statusCode,
                    'payload' => $payload,
                ]);

                die(json_encode([
                    'success' => true,
                    'order_id' => $idOrder,
                    'tracking_number' => $trackingNumber,
                    'status' => $statusCode,
                    'updated_ps_state' => $newStatusId,
                    'message' => "Order #{$idOrder} updated successfully for courier {$courier}.",
                ]));
            }
        }

        // Return acknowledged even if order not directly linked yet (idempotent webhook)
        die(json_encode([
            'success' => true,
            'order_id' => null,
            'tracking_number' => $trackingNumber,
            'status' => $statusCode,
            'message' => "Webhook event recorded for tracking {$trackingNumber}.",
        ]));
    }
}
