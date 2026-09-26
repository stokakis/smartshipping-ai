{**
 * 2026 SmartShipping AI - Carrier Selection Extra Content Template
 *
 * PrestaShop 1.7 Hook: displayCarrierExtraContent
 * Rendered during Checkout Step 3 (Delivery / Shipping Methods).
 * Provides transparent, itemized volumetric freight breakdowns,
 * highlighting 100% free absorption savings and zone multipliers.
 *
 * @author    Senior PrestaShop Logistics Expert
 * @copyright 2026 SmartShipping AI
 * @license   http://opensource.org/licenses/afl-3.0.php Academic Free License (AFL 3.0)
 *}

{if isset($smartshipping_carrier_active) && $smartshipping_carrier_active}
<div id="smartshipping-carrier-extra-content" class="smartshipping-extra-wrapper card mt-2 mb-3 p-3 border-primary-subtle" style="background: #f8fafc; border-radius: 8px; border: 1px solid #cbd5e1;">
    <!-- Carrier Header Info -->
    <div class="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
        <div class="d-flex align-items-center">
            <span class="mr-2" style="font-size: 1.4rem;">🚛</span>
            <div>
                <strong class="text-dark" style="font-size: 0.95rem;">{l s='SmartShipping AI Consolidation Engine' mod='smartshippingai'}</strong>
                <div class="text-muted small">
                    {if isset($smartshipping_zone_label)}
                        {$smartshipping_zone_label|escape:'html':'UTF-8'} 
                        {if isset($smartshipping_multiplier) && $smartshipping_multiplier > 1.0}
                            <span class="badge badge-warning text-dark ml-1">{l s='Multiplier' mod='smartshippingai'}: x{$smartshipping_multiplier|floatval}</span>
                        {/if}
                    {else}
                        {l s='Continental Express & Volumetric Freight' mod='smartshippingai'}
                    {/if}
                </div>
            </div>
        </div>

        {if isset($smartshipping_total_savings) && $smartshipping_total_savings > 0}
            <div class="text-right">
                <span class="badge badge-success px-2 py-1 font-weight-bold" style="font-size: 0.85rem;">
                    {l s='You Save' mod='smartshippingai'}: €{$smartshipping_total_savings|string_format:"%.2f"}
                </span>
            </div>
        {/if}
    </div>

    <!-- Volumetric Leader Highlight -->
    {if isset($smartshipping_leader) && $smartshipping_leader}
        <div class="alert alert-info py-2 px-3 mb-2 small d-flex align-items-center justify-content-between" style="border-radius: 6px; background-color: #e0f2fe; border-color: #bae6fd; color: #0369a1;">
            <div>
                <strong>{l s='Cart Freight Leader:' mod='smartshippingai'}</strong>
                <span>{$smartshipping_leader.name|escape:'html':'UTF-8'}</span>
                <span class="badge badge-primary ml-1" style="background-color: #0284c7;">Class {$smartshipping_leader.id_class|intval}</span>
            </div>
            <div class="font-weight-bold">
                €{$smartshipping_leader.base_price|string_format:"%.2f"} {l s='Base Rate' mod='smartshippingai'}
            </div>
        </div>
    {/if}

    <!-- Itemized Shipping Fee Breakdown Table -->
    {if isset($smartshipping_item_details) && $smartshipping_item_details|@count > 0}
        <div class="table-responsive mb-2">
            <table class="table table-sm table-borderless mb-0 small" style="font-size: 0.85rem;">
                <thead>
                    <tr class="text-muted border-bottom" style="font-size: 0.75rem; text-transform: uppercase;">
                        <th>{l s='Item in Cart' mod='smartshippingai'}</th>
                        <th class="text-center">{l s='Volumetric Class' mod='smartshippingai'}</th>
                        <th class="text-center">{l s='Consolidation Rule' mod='smartshippingai'}</th>
                        <th class="text-right">{l s='Shipping Added' mod='smartshippingai'}</th>
                    </tr>
                </thead>
                <tbody>
                    {foreach from=$smartshipping_item_details item=item}
                        <tr class="align-middle">
                            <td class="font-weight-medium">
                                {$item.name|escape:'html':'UTF-8'}
                                {if $item.isLeader}
                                    <span class="badge badge-secondary ml-1" style="font-size: 0.65rem;">{l s='LEADER' mod='smartshippingai'}</span>
                                {/if}
                            </td>
                            <td class="text-center">
                                <span class="badge badge-light border">Class {$item.id_class|intval}</span>
                            </td>
                            <td class="text-center">
                                {if $item.isAbsorbed}
                                    <span class="text-success font-weight-bold">
                                        ✓ {l s='100% Absorbed Free' mod='smartshippingai'}
                                    </span>
                                {elseif $item.isLeader}
                                    <span class="text-primary font-weight-bold">
                                        {l s='Primary Freight Anchor' mod='smartshippingai'}
                                    </span>
                                {else}
                                    <span class="text-muted">
                                        {$item.ruleApplied|escape:'html':'UTF-8'}
                                    </span>
                                {/if}
                            </td>
                            <td class="text-right font-weight-bold">
                                {if $item.isAbsorbed}
                                    <del class="text-muted mr-1">€{$item.standardFee|string_format:"%.2f"}</del>
                                    <span class="text-success">€0.00</span>
                                {else}
                                    <span>€{$item.feeAdded|string_format:"%.2f"}</span>
                                {/if}
                            </td>
                        </tr>
                    {/foreach}

                    {if isset($smartshipping_ferry_surcharge) && $smartshipping_ferry_surcharge > 0}
                        <tr class="border-top text-warning font-weight-bold">
                            <td colspan="3">
                                🚢 {l s='Maritime Island Pallet Surcharge (Class 4 Remote)' mod='smartshippingai'}
                            </td>
                            <td class="text-right">
                                +€{$smartshipping_ferry_surcharge|string_format:"%.2f"}
                            </td>
                        </tr>
                    {/if}
                </tbody>
                <tfoot>
                    <tr class="border-top font-weight-bold" style="font-size: 0.9rem;">
                        <td colspan="3" class="text-right">{l s='Final Volumetric Freight Fee:' mod='smartshippingai'}</td>
                        <td class="text-right text-primary">
                            €{$smartshipping_total_fee|string_format:"%.2f"}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    {/if}

    <div class="d-flex align-items-center justify-content-between text-muted small pt-1 border-top" style="font-size: 0.75rem;">
        <span>🛡️ {l s='Certified Dynamic Volumetric Freight Calculation' mod='smartshippingai'}</span>
        <span>⚡ {l s='Dispatched via ACS / DHL Freight' mod='smartshippingai'}</span>
    </div>
</div>
{/if}
