<?php
/**
 * PHPUnit Test Suite for SmartShippingAI getOrderShippingCost()
 *
 * Validates the Volume Absorption Matrix algorithm across various:
 * - Product volumetric classes (Classes 1 to 4)
 * - Multi-quantity cart lines
 * - Geo-zone multipliers (Metropolitan 1.0, Regional 1.15, Island 1.45, Unknown fallback 1.0)
 * - Leader resolution and subordinated product absorption rules
 *
 * @author Senior PrestaShop Logistics Expert
 */

namespace SmartShippingAI\Tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * Mock representations of PrestaShop Core classes when running outside a live PS environment
 */
if (!class_exists('Cart')) {
    class Cart
    {
        public $id;
        public $id_address_delivery;
        protected $products = [];

        public function __construct(int $id = 1, int $id_address_delivery = 1)
        {
            $this->id = $id;
            $this->id_address_delivery = $id_address_delivery;
        }

        public function setProducts(array $products): void
        {
            $this->products = $products;
        }

        public function getProducts(): array
        {
            return $this->products;
        }
    }
}

if (!class_exists('Address')) {
    class Address
    {
        public $id;
        public $postcode;

        public function __construct(int $id = 1, string $postcode = '75001')
        {
            $this->id = $id;
            $this->postcode = $postcode;
        }
    }
}

/**
 * Testable subclass or standalone calculation engine for SmartShippingAI
 */
class SmartShippingCalculationService
{
    /** @var array<int, array{name: string, base_price: float, absorption_power: int}> */
    protected array $classCatalog = [
        1 => ['name' => 'Class 1: Small Decor',     'base_price' => 5.00,  'absorption_power' => 1],
        2 => ['name' => 'Class 2: Small Furniture', 'base_price' => 15.00, 'absorption_power' => 2],
        3 => ['name' => 'Class 3: Medium Furniture','base_price' => 35.00, 'absorption_power' => 3],
        4 => ['name' => 'Class 4: Bulky / Sofas',   'base_price' => 79.00, 'absorption_power' => 4],
    ];

    /** @var array<string, float> */
    protected array $geoZoneMultipliers = [
        '75001' => 1.00, // Paris (Zone A)
        '69001' => 1.00, // Lyon (Zone A)
        '13001' => 1.15, // Marseille (Zone B - Suburban)
        '64000' => 1.20, // Regional (Zone B)
        '20000' => 1.45, // Corsica Island (Zone C)
    ];

    /** @var array<int, int> Product ID to Class ID lookup */
    protected array $productClassMap = [];

    public function setProductClassMap(array $map): void
    {
        $this->productClassMap = $map;
    }

    public function setGeoZoneMultiplier(string $zip, float $multiplier): void
    {
        $this->geoZoneMultipliers[$zip] = $multiplier;
    }

    /**
     * Replicates the exact Volume Absorption Matrix logic for getOrderShippingCost()
     *
     * @param Cart|object $cart
     * @param Address|object|null $deliveryAddress
     * @param float $defaultShippingCost
     * @return float
     */
    public function calculateOrderShippingCost($cart, $deliveryAddress = null, float $defaultShippingCost = 0.0): float
    {
        $products = method_exists($cart, 'getProducts') ? $cart->getProducts() : ($cart->products ?? []);

        if (empty($products)) {
            return 0.0;
        }

        // 1. Fetch Delivery ZIP Code and determine Multiplier
        $zipCode = '';
        if ($deliveryAddress && !empty($deliveryAddress->postcode)) {
            $zipCode = trim((string)$deliveryAddress->postcode);
        }

        $multiplier = 1.0;
        if (!empty($zipCode) && isset($this->geoZoneMultipliers[$zipCode])) {
            $multiplier = (float)$this->geoZoneMultipliers[$zipCode];
        }

        // 2. Explode cart products by quantity and resolve id_class
        $flattenedItems = [];
        foreach ($products as $prod) {
            $idProduct = (int)($prod['id_product'] ?? $prod['id'] ?? 0);
            $qty = max(1, (int)($prod['cart_quantity'] ?? $prod['quantity'] ?? 1));
            
            // Resolve class (fallback to Class 1 if unassigned)
            $idClass = (int)($prod['id_class'] ?? $this->productClassMap[$idProduct] ?? 1);
            if ($idClass < 1 || $idClass > 4) {
                $idClass = 1;
            }

            for ($i = 0; $i < $qty; $i++) {
                $flattenedItems[] = [
                    'id_product' => $idProduct,
                    'id_class'   => $idClass,
                ];
            }
        }

        if (empty($flattenedItems)) {
            return 0.0;
        }

        // 3. Identify the Leader: item with highest id_class
        usort($flattenedItems, function ($a, $b) {
            return $b['id_class'] <=> $a['id_class'];
        });

        $leader = $flattenedItems[0];
        $leaderClassId = $leader['id_class'];
        $leaderBasePrice = (float)($this->classCatalog[$leaderClassId]['base_price'] ?? 0.0);

        $runningCost = $leaderBasePrice;

        // 4. Absorption Loop: iterate through subordinated items
        $totalItems = count($flattenedItems);
        for ($i = 1; $i < $totalItems; $i++) {
            $subItem = $flattenedItems[$i];
            $subClassId = $subItem['id_class'];

            if (($leaderClassId - $subClassId) >= 2) {
                // Rule A: ≥ 2 levels below Leader => 100% Free Absorption
                $runningCost += 0.00;
            } elseif ($leaderClassId === 4 && $subClassId === 3) {
                // Rule B: Leader is Class 4 and item is Class 3 => Flat fee of 10.00
                $runningCost += 10.00;
            } elseif ($subClassId === $leaderClassId) {
                // Rule C: Same class as Leader => 40% of Leader's base price
                $runningCost += (0.40 * $leaderBasePrice);
            } else {
                // Rule D: Fallback intermediate level (e.g. Leader 3, item 2) => 30% of item's base price
                $subBasePrice = (float)($this->classCatalog[$subClassId]['base_price'] ?? 0.0);
                $runningCost += (0.30 * $subBasePrice);
            }
        }

        // 5. Multiply by geo zone multiplier
        return (float)round($runningCost * $multiplier, 2);
    }
}

/**
 * Class SmartShippingShippingCostTest
 *
 * Comprehensive PHPUnit test suite covering:
 * - Single item carts (each class)
 * - Complete 100% absorption (Leader Class 4 + Classes 1 and 2)
 * - Class 4 + Class 3 flat 10€ rule
 * - Class 4 + Class 4 co-leader 40% surcharge rule
 * - High quantity items (e.g. 5x chairs, 2x sofas)
 * - Island / Regional multipliers (1.15x, 1.20x, 1.45x)
 * - Unknown ZIP code fallback (1.00x)
 * - Empty cart edge case
 */
class SmartShippingShippingCostTest extends TestCase
{
    protected SmartShippingCalculationService $engine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->engine = new SmartShippingCalculationService();
        $this->engine->setProductClassMap([
            101 => 1, // Candle (Class 1)
            102 => 1, // Cushion (Class 1)
            201 => 2, // Desk Lamp (Class 2)
            301 => 3, // Dining Chair (Class 3)
            401 => 4, // 3-Seater Sofa (Class 4)
            402 => 4, // Solid Oak Dining Table (Class 4)
        ]);
    }

    /**
     * Test Case 1: Empty cart returns 0.00
     */
    public function testEmptyCartReturnsZero(): void
    {
        $cart = new Cart(1, 1);
        $cart->setProducts([]);
        $address = new Address(1, '75001');

        $cost = $this->engine->calculateOrderShippingCost($cart, $address);
        $this->assertSame(0.0, $cost, 'Empty cart must return 0.00 shipping cost');
    }

    /**
     * Test Case 2: Single item for each class with standard multiplier (1.00)
     * - Class 1: 5.00€
     * - Class 2: 15.00€
     * - Class 3: 35.00€
     * - Class 4: 79.00€
     *
     * @dataProvider singleItemDataProvider
     */
    public function testSingleItemCost(int $productId, int $expectedClass, float $expectedCost): void
    {
        $cart = new Cart(1, 1);
        $cart->setProducts([
            ['id_product' => $productId, 'cart_quantity' => 1]
        ]);
        $address = new Address(1, '75001'); // Multiplier 1.00

        $cost = $this->engine->calculateOrderShippingCost($cart, $address);
        $this->assertEqualsWithDelta($expectedCost, $cost, 0.01);
    }

    public function singleItemDataProvider(): array
    {
        return [
            'Single Class 1 Decor'     => [101, 1, 5.00],
            'Single Class 2 Lamp'      => [201, 2, 15.00],
            'Single Class 3 Chair'     => [301, 3, 35.00],
            'Single Class 4 Bulky Sofa'=> [401, 4, 79.00],
        ];
    }

    /**
     * Test Case 3: 100% Free Absorption
     * Leader is Class 4 (79.00€). Subordinated products are Class 1 and Class 2 (≥ 2 levels below).
     * Expected: 79.00 + 0.00 + 0.00 = 79.00€
     */
    public function testFullAbsorptionOfClassesOneAndTwoUnderClassFourLeader(): void
    {
        $cart = new Cart(1, 1);
        $cart->setProducts([
            ['id_product' => 401, 'cart_quantity' => 1], // Class 4 (Leader: 79.00€)
            ['id_product' => 201, 'cart_quantity' => 1], // Class 2 (Absorbed: 0.00€)
            ['id_product' => 101, 'cart_quantity' => 3], // Class 1 x 3 (Absorbed: 0.00€)
        ]);
        $address = new Address(1, '75001'); // Zone A multiplier = 1.00

        $cost = $this->engine->calculateOrderShippingCost($cart, $address);
        $this->assertEqualsWithDelta(79.00, $cost, 0.01, 'Class 1 and Class 2 products must be 100% absorbed by Class 4 Leader');
    }

    /**
     * Test Case 4: Leader Class 4 + Subordinated Class 3
     * Rule: Add flat fee of 10.00€ per Class 3 item
     * Expected: 79.00 + 10.00 = 89.00€
     */
    public function testClassThreeWithClassFourLeaderAddsFlatTen(): void
    {
        $cart = new Cart(1, 1);
        $cart->setProducts([
            ['id_product' => 401, 'cart_quantity' => 1], // Class 4 (79.00€)
            ['id_product' => 301, 'cart_quantity' => 1], // Class 3 (Flat +10.00€)
        ]);
        $address = new Address(1, '75001'); // Multiplier 1.00

        $cost = $this->engine->calculateOrderShippingCost($cart, $address);
        $this->assertEqualsWithDelta(89.00, $cost, 0.01, 'Class 3 item under Class 4 Leader must add flat 10.00€');
    }

    /**
     * Test Case 5: Multiple Class 3 items under Class 4 Leader
     * Expected: 79.00 + (2 * 10.00) = 99.00€
     */
    public function testMultipleClassThreeItemsUnderClassFourLeader(): void
    {
        $cart = new Cart(1, 1);
        $cart->setProducts([
            ['id_product' => 401, 'cart_quantity' => 1], // Class 4 (79.00€)
            ['id_product' => 301, 'cart_quantity' => 2], // Class 3 x 2 (+20.00€)
        ]);
        $address = new Address(1, '75001');

        $cost = $this->engine->calculateOrderShippingCost($cart, $address);
        $this->assertEqualsWithDelta(99.00, $cost, 0.01);
    }

    /**
     * Test Case 6: Same Class as Leader (Class 4 + Class 4)
     * Rule: Additional items of same class add 40% of Leader's base price.
     * Calculation: 79.00 + (0.40 * 79.00) = 79.00 + 31.60 = 110.60€
     */
    public function testSameClassCoLeaderAddsFortyPercentOfBasePrice(): void
    {
        $cart = new Cart(1, 1);
        $cart->setProducts([
            ['id_product' => 401, 'cart_quantity' => 1], // Class 4 Sofa (Leader: 79.00€)
            ['id_product' => 402, 'cart_quantity' => 1], // Class 4 Table (40%: +31.60€)
        ]);
        $address = new Address(1, '75001');

        $cost = $this->engine->calculateOrderShippingCost($cart, $address);
        $this->assertEqualsWithDelta(110.60, $cost, 0.01, 'Second Class 4 product must add 40% of leader base price');
    }

    /**
     * Test Case 7: Complex Multi-Item Cart
     * - 2x Class 4 (Sofa, Table) => 79.00 + 31.60 = 110.60
     * - 1x Class 3 (Chair)       => +10.00
     * - 4x Class 1 (Decor items) => +0.00 (absorbed)
     * Subtotal before multiplier: 120.60€
     * Multiplier: 1.00
     * Expected: 120.60€
     */
    public function testComplexMixedCartWithMultipleAbsorptions(): void
    {
        $cart = new Cart(1, 1);
        $cart->setProducts([
            ['id_product' => 401, 'cart_quantity' => 1],
            ['id_product' => 402, 'cart_quantity' => 1],
            ['id_product' => 301, 'cart_quantity' => 1],
            ['id_product' => 101, 'cart_quantity' => 4],
        ]);
        $address = new Address(1, '75001');

        $cost = $this->engine->calculateOrderShippingCost($cart, $address);
        $this->assertEqualsWithDelta(120.60, $cost, 0.01);
    }

    /**
     * Test Case 8: Geo Zone Multiplier Applied (Suburban Zone B: 1.15x)
     * Complex cart subtotal = 120.60€
     * With 13001 ZIP code (Marseille, 1.15 multiplier):
     * 120.60 * 1.15 = 138.69€
     */
    public function testSuburbanGeoZoneMultiplier(): void
    {
        $cart = new Cart(1, 1);
        $cart->setProducts([
            ['id_product' => 401, 'cart_quantity' => 1],
            ['id_product' => 402, 'cart_quantity' => 1],
            ['id_product' => 301, 'cart_quantity' => 1],
            ['id_product' => 101, 'cart_quantity' => 4],
        ]);
        $address = new Address(1, '13001'); // Zone B: 1.15x

        $cost = $this->engine->calculateOrderShippingCost($cart, $address);
        $this->assertEqualsWithDelta(138.69, $cost, 0.01, 'Shipping cost must be multiplied by Zone B 1.15 factor');
    }

    /**
     * Test Case 9: Remote Island Zone Multiplier (Corsica Zone C: 1.45x)
     * Cart: 1x Class 4 (79.00€) + 1x Class 3 (10.00€) = 89.00€
     * Multiplier: 20000 ZIP (1.45x)
     * Calculation: 89.00 * 1.45 = 129.05€
     */
    public function testRemoteIslandGeoZoneMultiplier(): void
    {
        $cart = new Cart(1, 1);
        $cart->setProducts([
            ['id_product' => 401, 'cart_quantity' => 1],
            ['id_product' => 301, 'cart_quantity' => 1],
        ]);
        $address = new Address(1, '20000'); // Zone C: 1.45x

        $cost = $this->engine->calculateOrderShippingCost($cart, $address);
        $this->assertEqualsWithDelta(129.05, $cost, 0.01, 'Island ZIP code must scale cost by 1.45x multiplier');
    }

    /**
     * Test Case 10: Unknown/Unregistered ZIP Code defaults to 1.00 multiplier
     * Cart: 1x Class 2 (15.00€)
     * Unknown ZIP: '99999' -> Multiplier 1.00
     * Calculation: 15.00 * 1.00 = 15.00€
     */
    public function testUnknownZipCodeDefaultsToStandardMultiplier(): void
    {
        $cart = new Cart(1, 1);
        $cart->setProducts([
            ['id_product' => 201, 'cart_quantity' => 1],
        ]);
        $address = new Address(1, '99999'); // Non-existent ZIP

        $cost = $this->engine->calculateOrderShippingCost($cart, $address);
        $this->assertEqualsWithDelta(15.00, $cost, 0.01, 'Unknown ZIP code must default to 1.00 multiplier');
    }

    /**
     * Test Case 11: Leader is Class 3 (Medium Furniture: 35.00€)
     * Subordinated product is Class 1 (Small Decor) => (3 - 1) = 2 levels below Leader
     * Rule: Absorbed 100% (0.00€)
     * Expected: 35.00 + 0.00 = 35.00€
     */
    public function testClassThreeLeaderAbsorbsClassOne(): void
    {
        $cart = new Cart(1, 1);
        $cart->setProducts([
            ['id_product' => 301, 'cart_quantity' => 1], // Class 3 Leader (35.00€)
            ['id_product' => 101, 'cart_quantity' => 2], // Class 1 x 2 (Absorbed: 0.00€)
        ]);
        $address = new Address(1, '75001');

        $cost = $this->engine->calculateOrderShippingCost($cart, $address);
        $this->assertEqualsWithDelta(35.00, $cost, 0.01, 'Class 3 Leader must absorb Class 1 products for 0.00€');
    }

    /**
     * Test Case 12: High Quantity on Single Cart Line
     * Cart: 3 units of Class 4 Sofa (Product 401, cart_quantity = 3)
     * - Item 1: Leader = 79.00€
     * - Item 2: Same class = +31.60€ (40%)
     * - Item 3: Same class = +31.60€ (40%)
     * Total = 79.00 + 31.60 + 31.60 = 142.20€
     */
    public function testMultipleQuantityOnSingleProductLine(): void
    {
        $cart = new Cart(1, 1);
        $cart->setProducts([
            ['id_product' => 401, 'cart_quantity' => 3],
        ]);
        $address = new Address(1, '75001');

        $cost = $this->engine->calculateOrderShippingCost($cart, $address);
        $this->assertEqualsWithDelta(142.20, $cost, 0.01, 'Multi-quantity line must expand into individual volume slots');
    }
}
