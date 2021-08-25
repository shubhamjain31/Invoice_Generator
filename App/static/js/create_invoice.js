$('table input').on("input", function () {
    var total   = []
    var $tr     = $(this).closest('tr');
    
    var textValue1 = $("input.rate", $tr).val();
    var textValue2 = $('input.quantity', $tr).val();
    
    amt = textValue1 * textValue2;
    $('.amount', $tr).html(amt);
    
    calc_total();
});

function calc_total() {
    var sum = 0;
    
    $(".amount").each(function () {
        sum += parseFloat($(this).text());
    });
    $('#total').text(sum);
}

function updateElementIndex(el, prefix, ndx) {
    var id_regex    = new RegExp('(' + prefix + '-\\d+)');
    var replacement = prefix + '-' + ndx;
    
    if ($(el).attr("for")) $(el).attr("for", $(el).attr("for").replace(id_regex, replacement));
    if (el.id) el.id = el.id.replace(id_regex, replacement);
    if (el.name) el.name = el.name.replace(id_regex, replacement);
}

function cloneMore(selector, prefix) {
    var newElement  = $(selector).clone(true);
    var total       = $('#id_' + prefix + '-TOTAL_FORMS').val();
    
    newElement.find(':input:not([type=button]):not([type=submit]):not([type=reset])').each(function () {
        var name = $(this).attr('name')
        
        if (name) {
            name = name.replace('-' + (total - 1) + '-', '-' + total + '-');
            var id = 'id_' + name;
            $(this).attr({ 'name': name, 'id': id }).val('').removeAttr('checked');
        }
    });
    
    newElement.find('label').each(function () {
        var forValue = $(this).attr('for');
        if (forValue) {
            forValue = forValue.replace('-' + (total - 1) + '-', '-' + total + '-');
            $(this).attr({ 'for': forValue });
        }
    });

    total++;
    $('#id_' + prefix + '-TOTAL_FORMS').val(total);
    $(selector).after(newElement);
    // $("div.form-row.button.is-primary").not(":last").hide();
    // var conditionRow = $('.form-row:not(:last)');
    // conditionRow.find('.button.is-primary')
    // .hide();
    // .removeClass('btn-success').addClass('btn-danger')
    // .removeClass('add-form-row').addClass('remove-form-row')
    // .html('-');
    return false;
}

function deleteForm(prefix, btn) {
    var total = parseInt($('#id_' + prefix + '-TOTAL_FORMS').val());
    
    if (total > 1) {
        btn.closest('.form-row').remove();
        
        var forms = $('.form-row');
        $('#id_' + prefix + '-TOTAL_FORMS').val(forms.length);
        
        for (var i = 0, formCount = forms.length; i < formCount; i++) {
            $(forms.get(i)).find(':input').each(function () {
                updateElementIndex(this, prefix, i);
            });
        }
    }
    return false;
}

$(document).on('click', '.add-form-row', function (e) {
    e.preventDefault();
    cloneMore('table tr:last', 'form');
    return false;
});

$(document).on('click', '.remove-form-row', function (e) {
    e.preventDefault();
    deleteForm('form', $(this));
    return false;
});