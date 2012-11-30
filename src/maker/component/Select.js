(function ($) {
    var uid = 0;
    $.widget('pandora.Select', $.pandora.Inputcom, {
        prop : {
            value : {
                type : 'string',
                label : '值'
            },
            items : {
                type : 'Objarray',
                label : '选项',
                map : {
                    label : {
                        type : 'string',
                        label : '文本'
                    },
                    value : {
                        type : 'string',
                        label : '值'
                    }
                },
                min : 1
            }
        },
        options : {
            items : [
                {label : '选项', value : 0}
            ],
            value : 0
        },
        _create : function () {
            var me = this,
                options = this.options;
            $.pandora.Inputcom.prototype._create.call(this, options);
            this.view.addClass('com-select');
            this._renderItems();
            this._renderW();
        },
        _renderItems : function () {
            var html = [],
                items = this.options.items;
            $.each(items, function (i, item) {
                html.push('<option value="' + item.value + '">' + item.label + '</option>');
            });
            this.view.html('<select style="width:' + this.options.w + 'px" name="' + this.options.name + '" value="' + this.options.value + '">' + html.join('') + '</select>');
        },
        setSize : function (w, h) {
            $.pandora.Inputcom.prototype.setSize.call(this, w, h);
            this.view.children().first().width(w);
        },
        _renderW : function () {
            $.pandora.Inputcom.prototype._renderW.call(this);
            this.setSize(this.options.w, this.options.h);
        }
    });
})(jQuery);