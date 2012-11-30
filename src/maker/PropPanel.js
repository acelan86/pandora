(function ($) {
    var EDITOR_CLASS = 'prop-editor-item';

    $.widget('pandora.PropPanel', $.ui.Panel, {
        options : {
            props : []
        },
        _create : function () {
            var options = this.options;

            $.extend(options, {
                title : '属性',
                width : 300,
                hide : true,
                miniButton : true
            });

            $.ui.Panel.prototype._create.call(this, options);

            this.widgetEventPrefix = 'proppanel';
            this.element.addClass('prop-panel').data('widgetName', this.widgetFullName);

            this._on(this.element, function () {
                var h = {};
                h['editorchange .' + EDITOR_CLASS] = function (e, data) {
                    var $el = $(e.currentTarget),
                        uid = $el.attr('data-uid'),
                        key = $el.attr('data-pn');
                    var p = {};
                    p[uid] = {};
                    p[uid][key] = data;
                    this._trigger('change', e, p);
                };
                return h;
            }());

            this.element.keydown(function (e) {
                e.stopPropagation();
            });
        },
        _genId : function (comId, k) {
            return comId + k;
        },
        _genBlockId : function (uid) {
            return uid + 'PropBlock';
        },
        //=================================
        fill : function (values) {
            var me = this,
                html = [],
                row;

            this.clear();

            this.show();

            $.map(values, function (value, uid) {
                row = [];
                for(var k in value) {
                    if (value[k].type && value[k].level !== 'base') {
                        var id = me._genId(uid, k);
                        me.curdata['#' + id] = {
                            type : $.upperCaseFirst(value[k].type) + 'Editor',
                            value : value[k]
                        };
                        row.push('<tr><th><nobr>' + value[k].label + '</nobr></th><td class="prop-block-td"><div id="' + id + '" class="' + EDITOR_CLASS + '" data-uid="' + uid + '" data-pn="' + k + '"></div>' + (value[k].tips ? '<div class="prop-tips">' + value[k].tips + '</div>' : '') + '</td></tr>');
                    }
                }
                html.push('<div id="' + me._genBlockId(uid) + '" class="prop-block"><table>' + row.join('') + '</table></div>');
            });
            this.body.html(html.join(''));

            $.map(me.curdata, function (value, uid) {
                $(uid)[value.type](value.value);
            });

        },
        changeValue : function (values) {
            var instance,
                me = this;
            $.map(values, function (value, uid) {
                for (var k in value) {
                    instance = $('#' + me._genId(uid, k), me.body).getInstance();
                    instance && instance.setValue(value[k]);
                }
            });
        },
        clear : function () {
            if (this.curdata) {
                for (var k in this.curdata) {
                    delete this.curdata[k];
                }
            }
            $('*', this.body).remove();
            this.curdata = {};
            this.hide();
        }
    });
})(jQuery);