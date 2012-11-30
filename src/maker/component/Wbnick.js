(function ($) {
    $.widget('pandora.Wbnick', $.pandora.Wbcom, {
        options : {
            w : 120,
            h : 20,
            resizable : true
        },
        _create : function () {
            $.pandora.Wbcom.prototype._create.call(this, this.options);
            this.view.addClass('com-wbnick');
            this._renderNick();
        },
        _renderNick : function () {
            var info = $.pandora.Wbcom.user;
            this.view.html($.pandora.Wbcom.genNickHTML(info));
        },
        _renderFont : function () {
            this.view.css(this.options.font);
        }
    });
})(jQuery);