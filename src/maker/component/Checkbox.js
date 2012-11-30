(function ($) {
    var uid = 0;
    $.widget('pandora.Checkbox', $.pandora.Inputcom, {
        prop : {
            items : {
                type : 'Objarray',
                label : '选项',
                map : {
                    label : {
                        type : 'string',
                        label : '标签'
                    },
                    value : {
                        type : 'string',
                        label : '值'
                    },
                    checked : {
                        type : 'select',
                        label : '是否选中',
                        datasource : [
                            { name : '否', value : 0},
                            { name : '是', value : 1}
                        ],
                        value : 0,
                        width : 40
                    }
                },
                newItemData : function (lastItem) {
                    return {label : '标签' + (++uid), value : uid};
                },
                min : 1,
                max : 20
            }
        },
        options : {
            items : [
                { label : '标签0', value : 0}
            ]
        },
        _create : function () {
            $.pandora.Inputcom.prototype._create.call(this, this.options);
            this.view.addClass('com-checkbox');

            this._renderItems();
        },
        _destroy : function () {
            this.view.removeClass('com-checkbox');
            $.pandora.Inputcom.prototype._destroy.call(this);
        },
        _renderItems : function (){
            var items = this.options.items,
                html = [],
                name = this.options.name;
            $.each(items, function (i, item) {
                html.push('<div class="com-checkbox-item"><input type="checkbox"' + (parseInt(item.checked, 10) ? ' checked="checked"' : '') + ' name="' + name + '" value="' + item.value+ '" /><label>' + item.label + '</label></div>');
            });
            this.view.html(html.join(''));
        }
    });
})(jQuery);