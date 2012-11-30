(function ($) {
    var uid = 0;
    $.widget('pandora.Radio', $.pandora.Inputcom, {
        prop : {
            value : {
                type : 'string',
                label : '值'
            },
            items : {
                type : 'Objarray',
                label : '选项',
                map : {
                    value : {
                        type : 'string',
                        label : '值'
                    },
                    label : {
                        type : 'string',
                        label : '标签'
                    }
                },
                newItemData : function (lastItem) {
                    return {label : '标签' + (++uid), value : '' + uid};
                },
                min : 1,
                max : 20
            }
        },
        options : {
            items : [
                {label : '标签0', value : '0'}
            ]
        },
        _create : function () {
            $.pandora.Inputcom.prototype._create.call(this, this.options);
            this.view.addClass('com-radio');
            this._renderItems();
        },
        _destroy : function () {
            this.view.removeClass('com-radio');
            $.pandora.Inputcom.prototype._destroy.call(this);
        },
        _renderItems : function () {
            var items = this.options.items,
                html = [],
                name = this.options.name;
            $.each(items, function (i, item) {
                html.push('<div class="com-radio-item"><nobr><input type="radio" name="' + name + '" value="' + item.value + '" /><label>' + item.label + '</label></nobr></div>');
            });
            this.view.html(html.join(''));
        }
    });
})(jQuery);