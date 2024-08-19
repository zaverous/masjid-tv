

$(document).ready(function () {
    // Load JSON data
    $.ajax({
        url: 'db/database.json',
        dataType: 'json',
        success: function (data) {
            createMenu(data);
            handleMenuClick(data);
        },
        error: function () {
            alert('Failed to load data.');
        }
    });

    function createMenu(data) {
        var menu = $('#menu');
        $.each(data, function (key) {
            if (key !== 'info' && key !== 'running_text') {
                menu.append('<a href="#" class="list-group-item" data-category="' + key + '">' + key.charAt(0).toUpperCase() + key.slice(1) + '</a>');
            }
        });
    }

    function handleMenuClick(data) {
        $('#menu').on('click', '.list-group-item', function (e) {
            e.preventDefault();
            var category = $(this).data('category');
            var formHtml = generateFormHtml(data[category], category);
            $('#form-container').html(formHtml);

            // Set default values
            setDefaultValues(data[category]);
        });
    }

    function generateFormHtml(categoryData, category) {
        var formHtml = '<h3>' + category.charAt(0).toUpperCase() + category.slice(1) + '</h3><form id="crud-form">';
        $.each(categoryData, function (key, value) {
            if (typeof value === 'object') {
                formHtml += '<div class="form-group"><label>' + key.charAt(0).toUpperCase() + key.slice(1) + '</label>';
                $.each(value, function (subKey, subValue) {
                    formHtml += '<input type="text" class="form-control" id="' + key + '-' + subKey + '" placeholder="' + subKey + '">';
                });
                formHtml += '</div>';
            } else {
                formHtml += '<div class="form-group"><label>' + key.charAt(0).toUpperCase() + key.slice(1) + '</label><input type="text" class="form-control" id="' + key + '" placeholder="' + key + '"></div>';
            }
        });
        formHtml += '<button type="submit" class="btn btn-primary">Save</button></form>';
        return formHtml;
    }

    function setDefaultValues(categoryData) {
        $.each(categoryData, function (key, value) {
            if (typeof value === 'object') {
                $.each(value, function (subKey, subValue) {
                    $('#'+key+'-'+subKey).val(subValue);
                });
            } else {
                $('#'+key).val(value);
            }
        });
    }
});
