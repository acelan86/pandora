(function ($) {
    var BASE_CLASS = 'login',
        DIALOG_CLASS = BASE_CLASS + '-dialog',
        INFO_CLASS = BASE_CLASS + '-info';


    $.widget('pandora.LoginBox', {
        _create : function () {
            var me = this,
                options = this.options;

            this.needPin = false;

            this.element
                .data('widgetName', this.widgetFullName)
                .addClass(BASE_CLASS);
            this.infobar = $('<div>')
                .addClass(INFO_CLASS)
                .html('正在检查登录...')
                .appendTo(this.element);

            this.dialog = $('<div>')
                .addClass(DIALOG_CLASS)
                .html([
                    '<form action="#" method="post">',
                        '<table>',
                            '<tr><th>用户名：</th><td><input class="ui-input username-input" type="text" style="width:120px;"/></td></tr>',
                            '<tr><th>密码：</th><td><input class="ui-input pwd-input" type="password" style="width:120px;"/></td></tr>',
                            '<tr class="pin-block" style="display:none;">',
                                '<th>验证码：</th>',
                                '<td><input class="ui-input pin-input" type="text" style="float:left;width:50px"/><span class="pin-pic" style="margin-left:5px;"></span></td>',
                            '</tr>',
                        '</table>',
                        '<input style="position:absolute;top:-1000px" type="submit" value="登录"/>',
                    '</form>'
                ].join(''))
                .appendTo($('body'))
                .dialog({
                    title : '用户登录',
                    autoOpen : false,
                    modal : true,
                    resizable : false,
                    buttons : [
                        { 
                            'text' : '登录',
                            'click' : function () {
                                me.form.submit();
                            },
                            'class' : 'ui-state-em'
                        },
                        {
                            'text' : '重置',
                            'click' : function () {
                                me.form[0].reset();
                            }
                        }
                    ]
                });

            this.form = $('form', this.dialog)
                .submit(function (e) {
                    e.preventDefault();
                    me._login();
                });

            this.usernameInput = $('.username-input', this.dialog);
            this.pwdInput = $('.pwd-input', this.dialog);
            this.pinInput = $('.pin-input', this.dialog);
            this.pinPic = $('.pin-pic', this.dialog)
                .click(function () {
                    me._pinCode(1);
                });

            this._on(this.element, {
                'click .login-btn' : function () {
                    me.open();
                },
                'click .logout-btn' : function () {
                    me.logout();
                }
            });

            this.checkSSO(this.autoLogin);
        },
        _destroy : function () {
            this.pinPic.unbind().remove();
        },
        _info : function (msg) {
            this.element.html(msg);
        },
        _reset : function () {
            var username = $.cookie('adboxuser');
            this.usernameInput.val(username || '');
            this.pwdInput.val('');
            this.pinInput.val('');
            this._pinCode(false);
        },
        _pinCode : function (b) {
            var pinBlock = $('.pin-block', this.dialog);
            this.needPin = b;
            if (b) {
                this.pinPic.html('<img src="' + sinaSSOController.getPinCodeUrl() + '" alt="点击换一个">');
                this.pinInput.val();
                pinBlock.show();
            } else {
                sinaSSOController.loginExtraQuery['door'] = '';
                pinBlock.hide();
            }
        },
        _submit : function () {
            this.form.submit();
        },
        _login : function () {
            var nv = this.usernameInput.val(),
                pv = this.pwdInput.val(),
                pinv = this.pinInput.val();

            this._info('正在登录...');

            if (!nv) {
                pandora.tipBox.show('请填写用户名', 2);
                this._setNoLogin();
                return;
            }
            if (!pv) {
                pandora.tipBox.show('请填写密码', 2);
                this._setNoLogin();
                return;
            }
            if (this.needPin) {
                if (!pinv) {
                    pandora.tipBox.show('请填写验证码', 2);
                    this._setNoLogin();
                    return;
                } else {
                    sinaSSOController.loginExtraQuery['door'] = pinv;
                }
            }
            sinaSSOController.login(nv, pv);
            $.cookie('adboxuser', nv);
        },
        _setLogin : function (user) {
            this._info('你好，<a href="http://adbox.sina.com.cn/#/mycreative/add">' + user.nick + '</a> | <a href="#" class="logout-btn">退出</a>');
        },
        _setNoLogin : function() {
            this._info('<a href="#" class="login-btn">登录</a> | <a href="http://sina.com" target="_blank">注册</a>');
        },
        checkSSO : function (cb) {
            var me = this;
            if ('undefined' === typeof sinaSSOController) {
                $.getScript('http://i.sso.sina.com.cn/js/ssologin.js', function () {
                    (function() {
                        this.entry = 'adbox'; // 本产品的标识 
                        this.setDomain = false;
                        this.customLoginCallBack = function(status) { // 登录回调代码 
                            //console.debug(status);
                            if (status && status.result) {
                                me._setLogin(status.userinfo);
                                me.dialog.dialog('close');
                            } else {
                                //console.debug(status);
                                me._setNoLogin();
                                if (status.errno == "4049") {
                                    pandora.tipBox.show(status.reason, 1);
                                    me._pinCode(1);
                                } else {
                                    if (status.errno == "2070") {
                                        me._pinCode(1);
                                    }
                                    pandora.tipBox.show(status.reason || "登录失败，请重试", 2);
                                }
                            }
                        };
                        this.customLogoutCallBack = function(status) {

                            if (status && status.result) {
                                me._setNoLogin();
                            } else {
                            }
                        };
                    }).call(sinaSSOController);

                    cb.call(me);
                });
            } else {
                cb.call(me);
            }
        },
        logout : function () {
            this._info('正在退出...');
            sinaSSOController.logout();
        },
        autoLogin : function () {
            var me = this;
            this._info('正在检查登录状态...');
            sinaSSOController.autoLogin(function(status) {
                if (status == null) {
                    me._setNoLogin();
                } else {
                    //console.debug(status);
                    me._setLogin(status);
                }
            });
        },
        open : function () {
            this._reset();
            this.dialog.dialog('open');
        }
    });
})(jQuery);