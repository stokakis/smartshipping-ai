/**
 * SmartShipping AI - PrestaShop Back-Office Controller Scripts
 * Handles AJAX approvals, quick reassignments, and combination expansion
 */

$(document).ready(function() {
    // Quick Re-assign class
    $(document).on('change', '.smartshipping-class-quick-select', function(e) {
        var $select = $(this);
        var idRecord = $select.data('id-record');
        var newClass = $select.val();

        $.ajax({
            type: 'POST',
            url: smartshipping_ajax_url,
            dataType: 'json',
            data: {
                action: 'ChangeVolumetricClass',
                ajax: 1,
                id_smartshipping_product: idRecord,
                id_class: newClass,
                token: smartshipping_token
            },
            success: function(response) {
                if (response.success) {
                    showSuccessMessage(response.message || smartshipping_i18n.update_success);
                } else {
                    showErrorMessage(response.error || smartshipping_i18n.error_generic);
                }
            },
            error: function() {
                showErrorMessage(smartshipping_i18n.error_generic);
            }
        });
    });

    // Toggle Approval status
    $(document).on('click', '.smartshipping-approval-btn', function(e) {
        e.preventDefault();
        var $btn = $(this);
        var idRecord = $btn.data('id-record');

        $.ajax({
            type: 'POST',
            url: smartshipping_ajax_url,
            dataType: 'json',
            data: {
                action: 'ToggleApproval',
                ajax: 1,
                id_smartshipping_product: idRecord,
                token: smartshipping_token
            },
            success: function(response) {
                if (response.success) {
                    showSuccessMessage(smartshipping_i18n.update_success);
                    location.reload();
                } else {
                    showErrorMessage(response.error || smartshipping_i18n.error_generic);
                }
            }
        });
    });
});
