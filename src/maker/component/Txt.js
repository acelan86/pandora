(function ($) {
    $.widget('pandora.Txt', $.pandora.Com, {
        prop : {
            text : {
                label : '文字'
            },
            url : {
                type : 'text',
                label : '链接地址'
            }
        },
        options : {
            w : 160,
            h : 90,
            text : '双击修改文字内容...',
            url : ''
        },
        _create : function () {
            var me = this;
            $.pandora.Com.prototype._create.call(this, this.options);
            this.view.addClass('com-txt');

            this.view.editable({
                editBy:"dblclick",
                type:"textarea",
                onSubmit : function (v) {
                    me.options.text = v.current;
                }
            });
            this._renderFont();
            this._renderColor();
            this._renderText();
        },
        _renderText : function () {
            this.view.html(this.options.text);
        }
    });
})(jQuery);