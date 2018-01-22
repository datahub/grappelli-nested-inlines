/**
 * GRAPPELLI INLINES
 * jquery-plugin for inlines (stacked and tabular)
 */


(function($) {
    $.fn.grp_inline = function(options) {
        var defaults = {
            prefix: "form",                         // The form prefix for your django formset
            addText: "add another",                 // Text for the add link
            deleteText: "remove",                   // Text for the delete link
            addCssClass: "grp-add-handler",             // CSS class applied to the add link
            removeCssClass: "grp-remove-handler",       // CSS class applied to the remove link
            deleteCssClass: "grp-delete-handler",       // CSS class applied to the delete link
            emptyCssClass: "grp-empty-form",            // CSS class applied to the empty row
            formCssClass: "grp-dynamic-form",           // CSS class applied to each form in a formset
            predeleteCssClass: "grp-predelete",
            onBeforeInit: function(form) {},        // Function called before a form is initialized
            onBeforeAdded: function(inline) {},     // Function called before a form is added
            onBeforeRemoved: function(form) {},     // Function called before a form is removed
            onBeforeDeleted: function(form) {},     // Function called before a form is deleted
            onAfterInit: function(form) {},         // Function called after a form has been initialized
            onAfterAdded: function(form) {},        // Function called after a form has been added
            onAfterRemoved: function(inline) {},    // Function called after a form has been removed
            onAfterDeleted: function(form) {}       // Function called after a form has been deleted
        };
        options = $.extend(defaults, options);

        return this.each(function() {
            var inline = $(this); // the current inline node
            var totalForms = inline.find("#id_" + options.prefix + "-TOTAL_FORMS");
            // set autocomplete to off in order to prevent the browser from keeping the current value after reload
            totalForms.attr("autocomplete", "off");
            // init inline and add-buttons
            initInlineForms(inline, options);
            initAddButtons(inline, options);
            // button handlers
            addButtonHandler(inline.find("a." + options.addCssClass + "." + inline.attr('id')), options);
            removeButtonHandler(inline.find("a." + options.removeCssClass + "." + inline.attr('id')), options);
            deleteButtonHandler(inline.find("a." + options.deleteCssClass + "." + inline.attr('id')), options);
            deactivateWidgetsForDisabledInputs();
        });
    };

    updateFormIndex = function(elem, options, replace_regex, replace_with) {
        elem.find(':input,span,table,iframe,label,a,ul,p,img,div').each(function() {
            var node = $(this),
                node_id = node.attr('id'),
                node_name = node.attr('name'),
                node_for = node.attr('for'),
                node_href = node.attr("href"),
                node_class = node.attr("class"),
                node_onclick = node.attr("onclick");
            if (node_id) { node.attr('id', node_id.replace(replace_regex, replace_with)); }
            if (node_name) { node.attr('name', node_name.replace(replace_regex, replace_with)); }
            if (node_for) { node.attr('for', node_for.replace(replace_regex, replace_with)); }
            if (node_href) { node.attr('href', node_href.replace(replace_regex, replace_with)); }
            if (node_class) { node.attr('class', node_class.replace(replace_regex, replace_with)); }
            if (node_onclick) { node.attr('onclick', node_onclick.replace(replace_regex, replace_with)); }
        });
    };

    initInlineForms = function(elem, options) {
        if (options.prefix.split('__prefix__').length != 1) return;
        elem.find("div.grp-module").each(function() {
            var form = $(this);
            // callback
            options.onBeforeInit(form, options.prefix);
            // add options.formCssClass to all forms in the inline
            // except table/theader/add-item
            if (form.attr('id') !== "") {
                form.not("." + options.emptyCssClass).not(".grp-table").not(".grp-thead").not(".add-item").addClass(options.formCssClass);
            }
            // add options.predeleteCssClass to forms with the delete checkbox checked
            form.find("li.grp-delete-handler-container input").each(function() {
                if ($(this).is(":checked") && form.hasClass("has_original")) {
                    form.toggleClass(options.predeleteCssClass);
                }
            });
            // callback
            options.onAfterInit(form, options.prefix);
        });
    };

    initAddButtons = function(elem, options) {
        if (options.prefix.split('__prefix__').length != 1) return;
        var totalForms = elem.find("#id_" + options.prefix + "-TOTAL_FORMS");
        var maxForms = elem.find("#id_" + options.prefix + "-MAX_NUM_FORMS");
        var addButtons = elem.find("a." + options.addCssClass + "." + elem.attr('id'));
        // hide add button in case we've hit the max, except we want to add infinitely
        if ((maxForms.val() !== '') && (maxForms.val()-totalForms.val()) <= 0) {
            hideAddButtons(elem, options);
        }
    };

    addButtonHandler = function(elem, options) {
        elem.bind("click", function() {
            var elem = $(this);
            updateFormPrefix(this, options);
            var inline = elem.closest(".grp-group"),
                totalForms = inline.find("#id_" + options.prefix + "-TOTAL_FORMS"),
                maxForms = inline.find("#id_" + options.prefix + "-MAX_NUM_FORMS"),
                addButtons = inline.find("a." + options.addCssClass + "." + inline.attr('id')),
                empty_template = inline.find("#" + options.prefix + "-empty");
            // callback
            options.onBeforeAdded(inline, options.prefix);
            // create new form
            var index = parseInt(totalForms.val(), 10),
                form = empty_template.clone(true);
            form.removeClass(options.emptyCssClass)
                .attr("id", empty_template.attr('id').replace("-empty", '-' + index));
            // update form index
            var re = /__prefix__/;
            updateFormIndex(form, options, re, index);
            // after "__prefix__" strings has been substituted with the number
            // of the inline, we can add the form to DOM, not earlier.
            // This way we can support handlers that track live element
            // adding/removing, like those used in django-autocomplete-light
            var $insertedForm = form.insertBefore(empty_template)
                .addClass(options.formCssClass);
            // update total forms
            totalForms.val(index + 1);
            // hide add button in case we've hit the max, except we want to add infinitely
            if ((maxForms.val() !== 0) && (maxForms.val() !== "") && (maxForms.val() - totalForms.val()) <= 0) {
                hideAddButtons(inline, options);
            }
            // callback
            options.onAfterAdded(form, options.prefix);
            $(document).trigger('formset:added', [$insertedForm, index, options.prefix]);
        });
    };

    removeButtonHandler = function(elem, options) {
        elem.bind("click", function() {
            var elem = $(this);
            updateFormPrefix(this, options);
            var inline = elem.parents(".grp-group").first(),
                form = $(this).parents("." + options.formCssClass).first(),
                totalForms = inline.find("#id_" + options.prefix + "-TOTAL_FORMS"),
                maxForms = inline.find("#id_" + options.prefix + "-MAX_NUM_FORMS"),
                re = new RegExp(options.prefix + "-(\\d+)-", 'g'),
                removedFormIndex = getFormIndex(form, options, re);
            // callback
            options.onBeforeRemoved(form, options.prefix);
            // remove form
            form.remove();
            // update total forms
            var index = parseInt(totalForms.val(), 10);
            totalForms.val(index - 1);
            // show add button in case we've dropped below max
            if ((maxForms.val() !== 0) && (maxForms.val() - totalForms.val()) > 0) {
                showAddButtons(inline, options);
            }
            // update form index (for all forms)
            var prefixPattern = '^' + options.prefix + '-\\d+$';
            inline.find("." + options.formCssClass)
                .filter(function(i, form) { return new RegExp(prefixPattern).test(form.id) })
                .each(function () {
                    var form = $(this);
                    re.lastIndex = 0;

                    var formIndex = getFormIndex(form, options, re);
                    if (formIndex > removedFormIndex) {
                        updateFormIndex(form, options, re, options.prefix + "-" + (formIndex - 1) + "-");
                    }
                });
            // callback
            options.onAfterRemoved(inline, options.prefix);
            $(document).trigger('formset:removed', [inline, options.prefix]);
        });
    };

    function updateFormPrefix(elem, options) {
        var prefixBeginning = options.prefix.substring(0, options.prefix.indexOf("-"));
        var prefix = (elem.className || []).split(" ")
            .filter(function(className) { return className.startsWith(prefixBeginning) })
            .pop();
        options.prefix = prefix ? prefix.replace("-group", "") : '';
    }

    deleteButtonHandler = function(elem, options) {
        elem.bind("click", function() {
            var deleteInput = $(this).prev(),
                form = $(this).parents("." + options.formCssClass).first();
            // callback
            options.onBeforeDeleted(form, options.prefix);
            // toggle options.predeleteCssClass and toggle checkbox
            if (form.hasClass("has_original")) {
                form.toggleClass(options.predeleteCssClass);
                if (deleteInput.prop("checked")) {
                    deleteInput.removeAttr("checked");
                } else {
                    deleteInput.prop("checked", true);
                }
            }
            // callback
            options.onAfterDeleted(form, options.prefix);
        });
    };

    hideAddButtons = function(elem, options) {
        if (options.prefix.split('__prefix__').length != 1) return;
        var addButtons = elem.find("a." + options.addCssClass + "." + elem.attr('id'));
        // addButtons.hide().parents('.grp-add-item').hide();
        addButtons.hide();
    };

    showAddButtons = function(elem, options) {
        if (options.prefix.split('__prefix__').length != 1) return;
        var addButtons = elem.find("a." + options.addCssClass + "." + elem.attr('id'));
        // addButtons.show().parents('.grp-add-item').show();
        addButtons.show();
    };

    /**
     * Fix a bug of Grappelli building autocomplete and related widgets for disabled inputs
     */
    deactivateWidgetsForDisabledInputs = function() {
        function updateWidgetsForDisabledFields() {
            updateAutocompleteWidgets();
            updateRelatedWidgets();
        }

        function updateAutocompleteWidgets() {
            const $autocmpleteWrapper = $(".grp-autocomplete-hidden-field[disabled]").closest(".grp-autocomplete-wrapper-fk");
            $autocmpleteWrapper.find("input").attr('readonly', 'readonly');
            $autocmpleteWrapper.find('a').remove();
            $autocmpleteWrapper.addClass("grp-readolny")
        }

        function updateRelatedWidgets(){
            $(".related-widget-wrapper").each(function(index, wrapper)  {
                const $wrapper = $(wrapper);
                if ($wrapper.find('input:disabled, select:disabled').length) {
                    $wrapper.find('.grp-related-widget-tools').remove();
                }
            });
        }

        setTimeout(updateWidgetsForDisabledFields, 100);
    }

})(grp.jQuery);
