(function ($) {
    var BASE_CLASS = 'switchobj-editor',
        uid = 0;

    function getPanelId(uid, type) {
        return 'SwitchobjEditorPanel' + uid + type;
    }

    $.widget('pandora.SwitchobjEditor', $.pandora.BaseEditor, {
        options : {
            datasource : [
                {
                    name : '普通组合',
                    value : 'common'
                },
                {
                    name : '表单',
                    value : 'form',
                    map : {
                        action : {
                            type : 'string',
                            label : '提交路径'
                        }
                    }
                }
            ],
            value : {
                select : 'common',
                map : {
                    'common' : '',
                    'form' : {
                        'action' : 'http://adbox.sina.com.cn/form/testdrive'
                    }
                }
            }
        },
        _create : function () {
            var me = this,
                options = this.options,
                maps = {},
                selectDS = [],
                datasource = options.datasource || [];

            $.pandora.BaseEditor.prototype._create.call(this, options);

            this.uid = uid++;

            $.each(datasource, function (i, ds) {
                selectDS.push({
                    name : ds.name,
                    value : ds.value
                });
                ds.map && (maps[ds.value] = ds.map);
            });

            this.editor = $('<div class="' + BASE_CLASS + '-select">')
                .appendTo(this.element)
                .SelectEditor({
                    datasource : options.datasource,
                    width : options.width,
                    value : me.options.value.select,
                    change : function (e, data) {
                        var value = {};

                        value.select = data.value;
                        value.map = me.options.value.map;

                        me._showPanel(data.value);
                        me._trigger('change', e, {
                            value : me.options.value = value
                        });
                        e.preventDefault();
                    }
                });

            this.panel = $('<div class="' + BASE_CLASS + '-panel">').appendTo(this.element);
            $.map(maps, function (map, type) {
                me.panel.append($('<div id="' + getPanelId(me.uid, type) + '">')
                    .addClass(BASE_CLASS + '-panel-block')
                    .ObjEditor({
                        map : map,
                        value : me.options.value.map[me.options.value.select],
                        change : function (e, data) {
                            var value = {};

                            value.select = me.options.value.select;
                            !value.map && (value.map = {});
                            value.map[value.select] = data.value;

                            me._trigger('change', e, {
                                value : me.options.value = value
                            });
                            e.preventDefault();
                        }
                    }));
            });

            this._on(this.panel, (function () {
                var r = {};
                r['editorchange .' + BASE_CLASS + '-panel-block'] = function (e, data) {
                    e.stopPropagation();
                };
                r['editorchange .' + BASE_CLASS + '-select'] = function (e, data) {
                    e.stopPropagation();
                };
                return r;
            })());

            this._showPanel(this.options.value.select);
        },
        _showPanel : function (type, value) {
            $('.' + BASE_CLASS + '-panel-block', this.element).hide();
            $('#' + getPanelId(this.uid, type)).show();
        }
    });
})(jQuery);