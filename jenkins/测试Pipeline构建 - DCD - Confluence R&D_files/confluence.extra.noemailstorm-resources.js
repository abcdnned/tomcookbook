WRMCB=function(e){var c=console;if(c&&c.log&&c.error){c.log('Error running batched script.');c.error(e);}}
;
try {
/* module-key = 'confluence.extra.noemailstorm:resources', location = 'js/no-email-storm.js' */
/*
 @context editor
 */
(function ($) {
    var NES_TAG_NAME = "nes-notify";

    AJS.bind('init.rte-control', function () {
        $.noemailstorm.init();

        var hasNesLabel = false;

        $.ajax({
            url: AJS.contextPath() + '/rest/api/content/' + AJS.Meta.get('content-id') + '/label',
            success: function(resp) {
                if (Array.isArray(resp.results)) {
                    resp.results.forEach(function(v, i) {
                        if (v.name.toLowerCase() === NES_TAG_NAME) {
                            hasNesLabel = true;
                        }
                    });

                    if (hasNesLabel) {
                        $('button#rte-button-publish').hide();
                        $('button#save-and-notify').removeClass("save-and-notify");
                    }
                }

                bindShortcut();
            },
            error: function(error) {
                console.log("Unable to get page labels.", error);
                bindShortcut();
            }
        });

        function bindShortcut() {
            if ($.nes_change_primary_button || hasNesLabel) {
                $('#rte-button-publish').removeClass('aui-button-primary');
                $('#save-and-notify').addClass('aui-button-primary');

                if (typeof Confluence.KeyboardShortcuts.shortcuts !== 'undefined') {
                    $.each(Confluence.KeyboardShortcuts.shortcuts, function(i, ks) {
                        if (ks.param == '#rte-button-publish, #rte-button-overwrite') {
                            ks.param = '#save-and-notify';
                        }
                    });
                } else {
                    AJS.bind("shortcuts-loaded.keyboardshortcuts", function (e, data) {
                        $.each(data.shortcuts, function(i, ks) {
                            if (ks.param == '#rte-button-publish, #rte-button-overwrite') {
                                ks.param = '#save-and-notify';
                            }
                        });
                    });
                }
            }
        }
    });

    $.noemailstorm = {

        init: function () {
            var s = this;
            if (s.is_checkbox_visible(s.get_checkbox())) {
                s.insert_btn(s.get_btn());
            }
        },

        insert_btn: function (btn) {
            var s = this;
            var checkbox = s.get_checkbox();

            if (checkbox.length) {
                $('button#rte-button-publish').addClass('no-email-storm');
            }

            s.disable_checkbox(checkbox);
            checkbox.parent().hide();

            $('button#rte-button-publish').parent().css('margin','0').after(btn);

            $("button#save-and-notify").click(function (e) {
                e.preventDefault();
                checkbox.prop('checked', true);
                $('button#rte-button-publish').click();
            });
        },

        get_btn: function () {
            var blog = AJS.Meta.get('content-type') === 'blogpost';
            var majorVersion = parseInt(AJS.Meta.get('version-number'), 10);
            var collaborative = majorVersion >= 6 && AJS.params.collaborativeContent;
            var buttonTooltip = collaborative ? "Update your page and send notification to all watchers" : "Save your page and send notification to all watchers";
            var buttonCaption = collaborative ? "Update & Notify" : "Save & Notify";

            // это мегафикс для названия кнопки конфлюенса в немецкой локали, т.к. мы используем глагол в Update & Notify, а они существительное
            if (AJS.params.userLocale.indexOf('de') != -1 && blog && !collaborative) {
                $('button#rte-button-publish').html("Publish");
            }

            return $('<div id="no-email-storm-button-container">' +
                '<button id="save-and-notify" class="toolbar-trigger aui-button save-and-notify" title="' +
                (blog && !collaborative ? "Publish your blog post and send notification to all watchers" : buttonTooltip) + '">' +
                (blog && !collaborative ? "Publish & Notify" : buttonCaption)  + '</button></div>');
        },

        get_checkbox: function () {
            return $('input#notifyWatchers');
        },

        is_checkbox_visible: function (checkbox) {
            return checkbox.is(':visible');
        },

        disable_checkbox: function(checkbox) {
            setTimeout(function() {
                if (checkbox.prop('checked')) {
                    checkbox.click();
                }
            }, 2000);
        }

    };

})(AJS.$);
}catch(e){WRMCB(e)};