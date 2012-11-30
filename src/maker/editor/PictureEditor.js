(function ($) {
    var BASE_CLASS = 'picture-editor',
        EDITING_STATE_CLASS = BASE_CLASS + '-editing',
        uid = 0;
    var SOURCE = [
        {
            'type': 'LocalUpload',
            'label': '本地',
            'options': {}
        },
        {
            'type': 'UrlUpload',
            'label': 'url',
            'options': {}
        },
        {
            'type': 'HistoryUpload',
            'label': '素材库',
            'options': {
                onactive : function () {
                    this.loadData();
                }
            }
        }
    ];
    $.widget('pandora.PictureEditor', $.pandora.BaseEditor, {
        _create : function () {
            var me = this,
                options = this.options,
                source = this.options.source || SOURCE;

            $.pandora.BaseEditor.prototype._create.call(this, options);

            this.element.addClass(BASE_CLASS);

            this.editor = $('<input class="ui-input" type="text"/>')
                .val(options.value.url)
                .appendTo(this.element)
                .click($.proxy(this._showPanel, this));

            this.element.append($('<div class="' + BASE_CLASS + '-panel"><div class="editor-panel-arrow">\u25C6</div><div class="editor-panel-content"></div></div>'));

            this._setOption('disabled', options.disabled);
        },
        _setOption: function(k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);

            if(k == 'disabled') {
                this.editor.attr('disabled', v);
            }
        },

        _showPanel : function (e) {
            if (this.options.disabled) {
                return;
            }
            if (!this.isRenderTabs) {
                this.renderTabs(this.options.source || SOURCE);
                this.isRenderTabs = true;
            }
            $(e.target).attr('disabled', 'disabled');
            this.element.addClass(EDITING_STATE_CLASS);
        },
        _destroy : function () {
            this.element.removeClass(BASE_CLASS);
            if(this.isRenderTabs) {
                $('.editor', this.editor).unbind('editorupload');
            }
            this.editor.unbind('click', this._showPanel);
            $.pandora.BaseEditor.prototype._destroy.call(this);

        },
        _genTabsId : function () {
            return 'PictureEditorTabs' + (uid++);
        }, 
        renderTabs : function(tabs) {
            var tabsId = this._genTabsId(),
                me = this,
                ulEl = [],
                tabsEl = [],
                instance = {};

            $.each(tabs, function(i, item) {
                var tabId = tabsId + '-' + i;
                item.options.mtype = me.options.mtype;
                instance[tabId] = item;
                ulEl.push('<li><a href="#' + tabId + '">'+ item.label +'</a></li>');
                tabsEl.push('<div id="' + tabId + '"></div>');
            });

            $('.editor-panel-content', this.element).html('<div id="' + tabsId + '"><ul>' + ulEl.join('') + '</ul>' + tabsEl.join('') + '</div>');

            $('#' + tabsId).tabs({
                activate : function (e, ui) {
                    var  instance  = $(ui.newPanel).getInstance();
                    instance && instance.options.onactive && instance.options.onactive.call(instance);
                }
            });
            $.map(instance, function (item, key) {
                $('#' + key)[item.type](item.options).on({
                    editorupload : function (e, data) {
                        me.editor.val(data.value.url);
                        me._trigger('change', e, data);
                    }
                });
            });
        }
    });
})(jQuery);