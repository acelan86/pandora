(function ($) {
    $.widget('pandora.Btn', $.pandora.Com, {
        prop : {
            text : {
                type : 'string',
                label : '按钮文字'
            },
            bgcolor : {
                level : 'base'
            },
            type : {
                type : 'select',
                datasource : [
                    {name : '普通按钮', value : 'button'},
                    {name : '提交按钮', value : 'submit'},
                    {name : '重置按钮', value : 'reset'}
                ],
                label : '类型'
            },
            skin : {
                type : 'radio',
                datasource : [
                    'default', 'lightblue', 'red', 'green', 'blue', 'gorden', 'black'
                ],
                format : function (i, skin) {
                    return '<div class="btn-skin-block"><div class="skin-btn Btn-skin-' + skin + '"><div class="com-btn">按钮</div></div></div>'; 
                },
                label : '按钮样式'
            },
            url : {
                type : 'text',
                label : '跳转链接'
            }
        },
        options : {
            w : 60,
            h : 20,
            text : '按钮',
            skin : 'default',
            type : 'button'
        },
        setSize : function (w, h) {
            $.pandora.Com.prototype.setSize.call(this, w, h);
            $('table', this.view).css({
                width : w - 4,
                height : h - 4
            });
        },
        _create : function () {
            $.pandora.Com.prototype._create.call(this, this.options);
            this.view.addClass('com-btn');
            this._renderFont();
            this._renderText();
        },
        _destroy : function () {
            this.view.removeClass('com-btn');
            $.pandora.Com.prototype._destroy.call(this);
        },
        _renderText : function () {
            this._renderType();
        },
        _renderType : function () {
            var text = this.options.text ? this.options.text  : {
                'button' : '按钮',
                'submit' : '提交',
                'reset'  : '重置'
            }[this.options.type];
            this.view.html('<table cellpadding="0" cellspacing="0" style="width:' + this.options.w + 'px;height:' + this.options.h + 'px;"><tr><td>' + text + '</td></tr></table>');
        }
    });
})(jQuery);