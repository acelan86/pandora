(function ($) {
    $.widget('pandora.Wbfocus', $.pandora.Wbcom, {
        prop : {
            skin : {
                type : 'radio',
                datasource : ['default', 'v3'],
                label : '皮肤',
                format : function (i, skin) {
                    return '<div class="wbfocus-skin-block"><div style="padding:4px 10px" class="com-wbfocus skin-wbfocus Wbfocus-skin-' + skin + '-h"><span class="add-icon">+</span>关注</div></div>'; 
                }
            }
        },
        options : {
            w : 46,
            h : 20,
            skin : 'default',
            resizable : true
        },
        setSize : function (w, h) {
            $.pandora.Wbcom.prototype.setSize.call(this, w, h);
            $('table', this.view).css({
                width : w - 2,
                height : h - 2
            });
        },
        _create : function () {
            $.pandora.Wbcom.prototype._create.call(this, this.options);
            this.view.addClass('com-wbfocus');
            this._renderNick();
        },
        _renderNick : function () {
            var info = $.pandora.Wbcom.user;
            this.view.attr('title', '点击关注' + info.screen_name).html('<table cellpadding="0" cellspacing="0" style="width:' + this.options.w + 'px;height:' + this.options.h + 'px;"><tr><td><span class="add-icon">+</span> 关注</td></tr></table>');
        },
        _renderFont : function () {
            this.view.css(this.options.font);
            $('.add-icon', this.view).css('font-size', parseInt(this.options.font['font-size'], 10) + 4 || 16);
        }
    });
})(jQuery);