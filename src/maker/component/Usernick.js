(function ($) {
    $.widget('pandora.Usernick', $.pandora.Com, {
        prop : {
            beforelogin : {
                type : 'text',
                label : '登录前'
            },
            afterlogin : {
                type : 'insert',
                label : '登录后'
            }
        },
        options : {
            w : 120,
            h : 20,
            resizable : true,
            beforelogin : '你好，尊敬的用户',
            afterlogin : '${nick}'
        },
        _create : function () {
            var me = this;
            $.pandora.Com.prototype._create.call(this, this.options);
            this.element.addClass('com-usernick');
            this._renderContent();
        },
        _renderContent : function () {
            var me = this;
            $.pandora.SSOcom.checkLogin(function (status) {
                var uid = status.uid;
                $.pandora.Wbcom.getInfoByWid(uid, function (info) {
                    var nick = $.pandora.Wbcom.genNickHTML(info);
                    me.view.html(me.options.afterlogin ? me.options.afterlogin.replace(/\$\{nick\}/g, nick) : nick);
                }, function () {
                    me.view.html(me.options.beforelogin || '你好，尊敬的新浪用户');
                });
            }, function () {
                me.view.html(me.options.beforelogin || '你好，访客');
            });
        },
        _renderFont : function () {
            this.view.css(this.options.font);
        },
        _renderBeforelogin : function () {
            this._renderContent();
        },
        _renderAfterlogin : function () {
            this._renderContent();
        }
    });
})(jQuery);