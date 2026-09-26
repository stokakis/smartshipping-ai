<?php
/**
 * 2026 SmartShipping AI - Specialized Edge Case & Absorption Test Suite
 *
 * Dedicated test suite verifying 100% absorption logic specifically for Class 1 products
 * when paired with Class 4 Leaders (Sofas, Bulky Furniture, Heavy Wardrobes), covering:
 *
 * 1. Single Class 1 item paired with 1x Class 4 Leader (Base: €79.00, Absorption: €0.00, Total: €79.00)
 * 2. High-volume Class 1 stress test (e.g., 50x Class 1 items absorbed for €0.00 under 1x Class 4 Leader)
 * 3. Multi-quantity line item expansion (1 line item with cart_quantity = 25)
 * 4. Distinct heterogeneous Class 1 SKUs (cushions, candles, coasters, vases, linen runners)
 * 5. Price-sorting stability when Class 1 item has an unusual high base price override
 * 6. Absorption behavior across different Geo-Zone multipliers (Zone A: 1.0x, Zone B: 1.15x, Zone C: 1.45x)
 * 7. Boundary test: Class 4 Leader + Class 1 Absorption + Class 3 Subordinated item (€10 flat fee rule)
 * 8. Reversal guard: Ensuring Leader is never accidentally demoted when Class 1 items dominate cart count
 *
 * @author    Senior PrestaShop Logistics Expert
 * @copyright 2026 SmartShipping AI
 * @license   http://opensource.org/licenses/afl-3.0.php Academic Free License (AFL 3.0)
 */

namespace SmartShippingAI\Tests\Unit;

use PHPUnit\Framework\TestCase;

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
 * Isolated Shipping Calculation Service under test
 */
class ClassOneAbsorptionCalculationEngine
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
        '75001' => 1.00, // Paris (Zone A - Metropolitan)
        '69001' => 1.00, // Lyon (Zone A - Metropolitan)
        '13001' => 1.15, // Marseille (Zone B - Regional)
        '33000' => 1.15, // Bordeaux (Zone B - Regional)
        '20000' => 1.45, // Ajaccio / Corsica (Zone C - Island)
    ];

    /**
     * Executes the identical Volume Absorption Matrix algorithm as in smartshippingai.php
     *
     * @param Cart $cart
     * @param float $fallbackCost
     * @return float
     */
    public function getOrderShippingCost(Cart $cart, float $fallbackCost = 0.00): float
    {
        $products = $cart->getProducts();
        if (empty($products)) {
            return 0.00;
        }

        $multiplier = $this->getDeliveryZipMultiplier($cart->id_address_delivery);
        $classesCatalog = $this->getVolumetricClassesCatalog();

        $flattenedItems = [];

        foreach ($products as $product) {
            $idProduct = (int)($product['id_product'] ?? 1);
            $idProductAttribute = (int)($product['id_product_attribute'] ?? 0);
            $qty = max(1, (int)($product['cart_quantity'] ?? 1));
            $idClass = (int)($product['id_class'] ?? 1);

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
            return 0.00;
        }

        // Leader Selection: Highest id_class, then highest base_price
        usort($flattenedItems, function ($a, $b) {
            if ($b['id_class'] !== $a['id_class']) {
                return $b['id_class'] <=> $a['id_class'];
            }
            return $b['base_price'] <=> $a['base_price'];
        });

        $leader = $flattenedItems[0];
        $leaderClassId = (int)$leader['id_class'];
        $leaderBasePrice = (float)$leader['base_price'];

        $runningCost = $leaderBasePrice;

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
                // Rule D: Adjacent class -> 30% of item base rate
                $runningCost += (0.30 * $subBasePrice);
            }
        }

        return (float)round($runningCost * $multiplier, 2);
    }

    public function getDeliveryZipMultiplier(int $idAddress): float
    {
        // Mock lookup map
        $map = [
            1 => '75001', // Paris (1.0x)
            2 => '13001', // Marseille (1.15x)
            3 => '20000', // Corsica (1.45x)
            99 => '99999', // Unknown (fallback 1.0x)
        ];
        $zip = $map[$idAddress] ?? '75001';
        return $this->geoZoneMultipliers[$zip] ?? 1.00;
    }

    public function getVolumetricClassesCatalog(): array
    {
        return $this->classCatalog;
    }
}

/**
 * Class ClassOneAbsorptionEdgeCasesTest
 *
 * Validates all edge conditions for Class 1 product 100% absorption logic.
 */
class ClassOneAbsorptionEdgeCasesTest extends TestCase
{
    private ClassOneAbsorptionCalculationEngine $calculator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->calculator = new ClassOneAbsorptionCalculationEngine();
    }

    /**
     * Test 1: Single Class 1 Product paired with a single Class 4 Leader
     * Expected: Class 4 base (€79.00) + Class 1 (€0.00 absorbed) = €79.00
     */
    public function testSingleClassOneItemAbsorbedByClassFourLeader(): void
    {
        $cart = new Cart(1, 1); // 75001 (1.0x)
        $cart->setProducts([
            [
                'id_product'    => 101,
                'name'          => 'Stockholm 3-Seater Sofa',
                'id_class'      => 4,
                'cart_quantity' => 1,
            ],
            [
                'id_product'    => 201,
                'name'          => 'Hand-Poured Amber Candle',
                'id_class'      => 1,
                'cart_quantity' => 1,
            ],
        ]);

        $cost = $this->calculator->getOrderShippingCost($cart);

        $this->assertSame(
            79.00,
            $cost,
            'A single Class 1 product must be 100% absorbed (+€0.00) by a Class 4 leader, costing exactly €79.00.'
        );
    }

    /**
     * Test 2: Massive Batch of Class 1 Products (50 items) under 1 Class 4 Leader
     * Validates that dimensional buffer absorption does not decay or leak incremental surcharges.
     * Expected: €79.00 + (50 * €0.00) = €79.00
     */
    public function testFiftyClassOneItemsAbsorbedWithoutIncrementalSurcharge(): void
    {
        $cart = new Cart(1, 1); // 75001 (1.0x)
        $cart->setProducts([
            [
                'id_product'    => 101,
                'name'          => 'Large Sectional Sofa',
                'id_class'      => 4,
                'cart_quantity' => 1,
            ],
            [
                'id_product'    => 201,
                'name'          => 'Linen Scented Candle',
                'id_class'      => 1,
                'cart_quantity' => 50,
            ],
        ]);

        $cost = $this->calculator->getOrderShippingCost($cart);

        $this->assertSame(
            79.00,
            $cost,
            'Even 50 small decor items (Class 1) must be 100% absorbed inside the Class 4 freight envelope for €0.00 additional cost.'
        );
    }

    /**
     * Test 3: Multiple Distinct Class 1 SKUs in Separate Cart Lines
     * Ensures distinct product lines with Class 1 all evaluate independently to €0.00 absorption.
     */
    public function testMultipleDistinctClassOneSkusAbsorbedSimultaneously(): void
    {
        $cart = new Cart(1, 1); // 75001 (1.0x)
        $cart->setProducts([
            [
                'id_product'    => 101,
                'name'          => 'Solid Oak King Bed Frame',
                'id_class'      => 4,
                'cart_quantity' => 1,
            ],
            [
                'id_product'    => 201,
                'name'          => 'Linen Pillow Set',
                'id_class'      => 1,
                'cart_quantity' => 4,
            ],
            [
                'id_product'    => 202,
                'name'          => 'Ceramic Coasters (Pack of 4)',
                'id_class'      => 1,
                'cart_quantity' => 2,
            ],
            [
                'id_product'    => 203,
                'name'          => 'Mini Dried Flower Vase',
                'id_class'      => 1,
                'cart_quantity' => 3,
            ],
            [
                'id_product'    => 204,
                'name'          => 'Woven Cotton Table Runner',
                'id_class'      => 1,
                'cart_quantity' => 5,
            ],
        ]);

        // Total Class 1 units = 4 + 2 + 3 + 5 = 14 units across 4 separate line items
        $cost = $this->calculator->getOrderShippingCost($cart);

        $this->assertSame(
            79.00,
            $cost,
            'Multiple distinct Class 1 line items must all be completely absorbed for €0.00 under a Class 4 leader.'
        );
    }

    /**
     * Test 4: Leader Inversion Guard - Class 1 items outnumbering Class 4 items 100-to-1
     * Ensures sorting comparator always prioritizes id_class over quantity or cumulative weight/cost.
     */
    public function testClassFourRetainsLeadershipWhenOutnumberedByClassOne(): void
    {
        $cart = new Cart(1, 1);
        $cart->setProducts([
            [
                'id_product'    => 201,
                'name'          => 'Matchbox Decor',
                'id_class'      => 1,
                'cart_quantity' => 100, // 100 items
            ],
            [
                'id_product'    => 101,
                'name'          => 'Velvet Corner Sofa',
                'id_class'      => 4,
                'cart_quantity' => 1,   // 1 item
            ],
        ]);

        $cost = $this->calculator->getOrderShippingCost($cart);

        $this->assertSame(
            79.00,
            $cost,
            'Leader must remain Class 4 regardless of product ordering in array or high Class 1 quantities.'
        );
    }

    /**
     * Test 5: Class 1 Absorption under Class 4 Leader with Regional Multiplier (Zone B: 1.15x)
     * Calculation: Running cost = €79.00 (Class 4) + €0.00 (Class 1) = €79.00
     * Final: round(79.00 * 1.15, 2) = €90.85
     */
    public function testClassOneAbsorptionWithRegionalMultiplierZoneB(): void
    {
        $cart = new Cart(1, 2); // Address 2 -> 13001 Marseille (1.15x)
        $cart->setProducts([
            [
                'id_product'    => 101,
                'name'          => 'Velvet Armchair & Footrest (Class 4)',
                'id_class'      => 4,
                'cart_quantity' => 1,
            ],
            [
                'id_product'    => 201,
                'name'          => 'Velvet Cushion Cover (Class 1)',
                'id_class'      => 1,
                'cart_quantity' => 6,
            ],
        ]);

        $cost = $this->calculator->getOrderShippingCost($cart);

        $this->assertSame(
            90.85,
            $cost,
            'Class 1 absorption must yield €79.00 base, multiplied by 1.15 for Marseille, resulting in €90.85.'
        );
    }

    /**
     * Test 6: Class 1 Absorption under Class 4 Leader with Island Multiplier (Zone C: 1.45x)
     * Calculation: Running cost = €79.00 + €0.00 = €79.00
     * Final: round(79.00 * 1.45, 2) = €114.55
     */
    public function testClassOneAbsorptionWithIslandMultiplierZoneC(): void
    {
        $cart = new Cart(1, 3); // Address 3 -> 20000 Corsica (1.45x)
        $cart->setProducts([
            [
                'id_product'    => 101,
                'name'          => 'Leather Chesterfield Sofa (Class 4)',
                'id_class'      => 4,
                'cart_quantity' => 1,
            ],
            [
                'id_product'    => 201,
                'name'          => 'Brass Candle Snuffer (Class 1)',
                'id_class'      => 1,
                'cart_quantity' => 12,
            ],
        ]);

        $cost = $this->calculator->getOrderShippingCost($cart);

        $this->assertSame(
            114.55,
            $cost,
            'Class 1 absorption must yield €79.00 base, multiplied by 1.45 for Corsica, resulting in €114.55.'
        );
    }

    /**
     * Test 7: Multi-Class Mixed Cart - Class 4 Leader + Class 3 Subordinated + Class 1 Absorption
     * Demonstrates selective absorption:
     * - Leader: Class 4 Sofa = €79.00
     * - Subordinate 1: Class 3 Chair (Rule B: 4 - 3 = 1 level diff) = +€10.00 flat fee
     * - Subordinate 2: 5x Class 1 Candles (Rule A: 4 - 1 = 3 levels diff >= 2) = +€0.00 absorbed
     * Total: 79.00 + 10.00 + 0.00 = €89.00
     */
    public function testSelectiveAbsorptionInMixedCartWithClassThreeAndClassOne(): void
    {
        $cart = new Cart(1, 1); // 75001 (1.0x)
        $cart->setProducts([
            [
                'id_product'    => 101,
                'name'          => 'Fabric Sofa',
                'id_class'      => 4,
                'cart_quantity' => 1,
            ],
            [
                'id_product'    => 103,
                'name'          => 'Dining Chair',
                'id_class'      => 3,
                'cart_quantity' => 1,
            ],
            [
                'id_product'    => 201,
                'name'          => 'Aromatic Candle',
                'id_class'      => 1,
                'cart_quantity' => 5,
            ],
        ]);

        $cost = $this->calculator->getOrderShippingCost($cart);

        $this->assertSame(
            89.00,
            $cost,
            'Class 3 incurs flat €10 surcharge while all Class 1 items remain 100% absorbed for €0.00, totaling €89.00.'
        );
    }

    /**
     * Test 8: Co-Leaders (2x Class 4) with Multiple Class 1 Absorptions
     * - 1st Class 4 Sofa (Leader): €79.00
     * - 2nd Class 4 Sofa (Co-leader): 40% of €79.00 = €31.60
     * - 10x Class 1 Items: 100% absorbed = €0.00
     * Total: 79.00 + 31.60 + 0.00 = €110.60
     */
    public function testCoLeaderClassFourPairWithClassOneAbsorption(): void
    {
        $cart = new Cart(1, 1); // 75001 (1.0x)
        $cart->setProducts([
            [
                'id_product'    => 101,
                'name'          => '3-Seater Sofa',
                'id_class'      => 4,
                'cart_quantity' => 2, // 2 units
            ],
            [
                'id_product'    => 201,
                'name'          => 'Silk Cushion',
                'id_class'      => 1,
                'cart_quantity' => 10,
            ],
        ]);

        $cost = $this->calculator->getOrderShippingCost($cart);

        $this->assertSame(
            110.60,
            $cost,
            'Two Class 4 items cost €110.60 (79 + 31.60), and all 10 Class 1 items are absorbed for €0.00.'
        );
    }

    /**
     * Test 9: Class 1 Custom Base Price Override does not break Absorption
     * Even if a Class 1 item has an elevated nominal base rate (e.g., €12.00 instead of €5.00),
     * the class differential (4 - 1 = 3 >= 2) guarantees 100% absorption (+€0.00).
     */
    public function testClassOneWithCustomBaseRateStillAbsorbedCompletely(): void
    {
        $customEngine = new class extends ClassOneAbsorptionCalculationEngine {
            public function getVolumetricClassesCatalog(): array
            {
                $catalog = parent::getVolumetricClassesCatalog();
                $catalog[1]['base_price'] = 12.50; // Custom elevated Class 1
                return $catalog;
            }
        };

        $cart = new Cart(1, 1);
        $cart->setProducts([
            [
                'id_product'    => 101,
                'name'          => 'Sectional Corner Sofa',
                'id_class'      => 4,
                'cart_quantity' => 1,
            ],
            [
                'id_product'    => 201,
                'name'          => 'Luxury Silk Throw',
                'id_class'      => 1,
                'cart_quantity' => 3,
            ],
        ]);

        $cost = $customEngine->getOrderShippingCost($cart);

        $this->assertSame(
            79.00,
            $cost,
            'Elevation of Class 1 nominal base price does not impact 100% absorption under a Class 4 leader.'
        );
    }

    /**
     * Test 10: Class 2 vs Class 1 Contrast Test under Class 4 Leader
     * Class 1 (diff = 3): Absorbed €0.00
     * Class 2 (diff = 2): Absorbed €0.00
     * Class 3 (diff = 1): Flat €10.00
     * Both Class 1 and Class 2 are absorbed for €0.00 under Class 4 Leader.
     */
    public function testClassOneAndClassTwoBothAbsorbedUnderClassFour(): void
    {
        $cart = new Cart(1, 1);
        $cart->setProducts([
            [
                'id_product'    => 101,
                'name'          => 'Sofa',
                'id_class'      => 4,
                'cart_quantity' => 1,
            ],
            [
                'id_product'    => 105,
                'name'          => 'Desk Lamp',
                'id_class'      => 2,
                'cart_quantity' => 2, // Class 2: diff = 2 >= 2 -> 0.00
            ],
            [
                'id_product'    => 201,
                'name'          => 'Scented Candle',
                'id_class'      => 1,
                'cart_quantity' => 8, // Class 1: diff = 3 >= 2 -> 0.00
            ],
        ]);

        $cost = $this->calculator->getOrderShippingCost($cart);

        $this->assertSame(
            79.00,
            $cost,
            'Both Class 1 and Class 2 satisfy (leader_class - item_class >= 2), costing €79.00 total.'
        );
    }
}
