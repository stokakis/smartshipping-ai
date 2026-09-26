{**
 * 2026 SmartShipping AI - Shopping Cart Footer Promotional Banner
 *
 * Psychological AOV Trigger: Displays a promotional banner when the cart leader
 * is Class 3 or Class 4, informing the customer that smaller decor items
 * (Class 1 or 2) qualify for 100% free shipping absorption.
 *
 * @author    Senior PrestaShop Logistics Expert
 * @copyright 2026 SmartShipping AI
 * @license   http://opensource.org/licenses/afl-3.0.php Academic Free License (AFL 3.0)
 *}

{if isset($smartshipping_show_promo_banner) && $smartshipping_show_promo_banner}
<div id="smartshipping-cart-footer-banner" class="smartshipping-promo-banner card mt-3 mb-3 p-3">
    <div class="d-flex align-items-center justify-content-between flex-wrap">
        <div class="d-flex align-items-center mr-3 mb-2 mb-md-0">
            <div class="smartshipping-promo-icon-wrapper mr-3 text-center" style="font-size: 2.2rem; min-width: 48px;">
                🎉
            </div>
            <div>
                <h5 class="smartshipping-promo-title mb-1 font-weight-bold text-success">
                    {if isset($smartshipping_promo_title)}
                        {$smartshipping_promo_title|escape:'html':'UTF-8'}
                    {else}
                        {l s='Your large item shipping is secured!' mod='smartshippingai'}
                    {/if}
                </h5>
                <p class="smartshipping-promo-subtitle mb-0 text-muted" style="font-size: 0.95rem;">
                    {if isset($smartshipping_promo_subtitle)}
                        {$smartshipping_promo_subtitle|escape:'html':'UTF-8'}
                    {elseif $smartshipping_leader_class == 4}
                        {l s='Add small furniture & home decor (Class 1 & 2) with 100% FREE shipping in this order.' mod='smartshippingai'}
                    {else}
                        {l s='Add small decor & accessories (Class 1) with 100% FREE shipping in this order.' mod='smartshippingai'}
                    {/if}
                </p>
                {if isset($smartshipping_leader_name) && $smartshipping_leader_name}
                    <div class="smartshipping-leader-badge mt-1 text-secondary" style="font-size: 0.8rem;">
                        <span>{l s='Qualifying Leader:' mod='smartshippingai'}</span>
                        <strong class="text-dark">{$smartshipping_leader_name|escape:'html':'UTF-8'}</strong>
                        <span class="badge badge-info ml-1">Class {$smartshipping_leader_class|intval}</span>
                    </div>
                {/if}
            </div>
        </div>

        <div class="smartshipping-promo-badge-container">
            <span class="badge badge-success px-3 py-2 text-uppercase font-weight-bold shadow-sm" style="letter-spacing: 0.5px;">
                {if isset($smartshipping_savings_label)}
                    {$smartshipping_savings_label|escape:'html':'UTF-8'}
                {else}
                    {l s='100% Free Shipping Absorption' mod='smartshippingai'}
                {/if}
            </span>
        </div>
    </div>
</div>
{/if}
