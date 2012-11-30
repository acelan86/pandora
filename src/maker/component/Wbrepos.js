(function ($) {
    $.widget('pandora.Wbrepos', $.pandora.Wbcom, {
        prop : {
            post : {
                type : 'wbpost',
                label : '文章url'
            }
        },
        options : {
            w : 40,
            h : 20,
            post : {
                id : ''
            },
            resizable : true
        },
        _create : function () {
            $.pandora.Wbcom.prototype._create.call(this, this.options);
            this.view.addClass('com-wbrepos').html('转发');
        },
        _renderFont : function () {
            this.view.css(this.options.font);
        },
        _renderPost : function () {
            this.options.articalId = this.options.post.id;
        },
        _renderColor : function () {
            this.view.css('color', this.options.color);
        }
    });
})(jQuery);