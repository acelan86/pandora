(function ($) {
    $.widget('pandora.Wbshare', $.pandora.Wbcom, {
        prop : {
            text : {
                type : 'text',
                label : '分享内容'
            },
            pic : {
                type : 'picture',
                label : '分享图片'
            }
        },
        options : {
            w : 40,
            h : 20,
            text : '',
            pic : '',
            resizable : true
        },
        _create : function () {
            $.pandora.Wbcom.prototype._create.call(this, this.options);
            this.view.addClass('com-wbshare').html('分享');
        },
        _renderFont : function () {
            this.view.css(this.options.font);
        },
        _renderColor : function () {
            this.view.css('color', this.options.color);
        }
    });
})(jQuery);