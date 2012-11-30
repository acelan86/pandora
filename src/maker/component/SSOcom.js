(function ($) {
    $.widget('pandora.SSOcom', $.pandora.Com, {
        _create : function () {}
    });
    $.pandora.SSOcom.checkLogin = function (login, nologin) {
        if ('undefined' !== typeof sinaSSOController) {
            sinaSSOController.autoLogin(function(status) {
                if (status == null) {
                    nologin && nologin();
                } else {
                    login && login(status);
                }
            });
        } else {
            nologin();
        }
    };
})(jQuery);