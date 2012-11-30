(function ($) {
    $.widget('pandora.Wbrelation', $.pandora.Wbcom, {
        prop : {
            showAvatar : {
                type : 'select',
                datasource : [
                    {name : '不显示头像', value : 0},
                    {name : '显示头像', value : 1}
                ],
                label : '显示头像'
            },
            max : {
                type : 'number',
                label : '关系数',
                min : 1,
                max : 20
            }
        },
        options : {
            w: 200,
            h : 60,
            showAvatar : 0,
            resizable : true,
            max : 4
        },
        _create : function () {
            var me = this,
                options = this.options;
            $.pandora.Wbcom.prototype._create.call(this, options);
            this.view.addClass('com-wbrelation');
            this._renderNick();
        },
        _renderNick : function () {
            this._renderDes();
        },
        _renderDes : function () {
            var info = $.pandora.Wbcom.user,
                me = this,
                max = this.options.max,
                showAvatar = parseInt(this.options.showAvatar, 10);
            $.pandora.Wbcom.getChainById(info.id, function (chain) {
                var text = (chain.content_type ? '你关注的人中${nick}关注了' : '新浪博友${nick}关注了'),
                    us = chain.users,
                    i = 0,
                    j = 0,
                    u,
                    html = [],
                    plusHTML = [];
                if (us instanceof Array) {
                    if (us.length　> 0) {
                        for (var i = 0; i < max; i++) {
                            if (us[i]) {
                                html.push($.pandora.Wbcom.genNickHTML(us[i]));
                                showAvatar && plusHTML.push($.pandora.Wbcom.genAvatarHTML(us[i], 30, 30));
                            }
                        }
                    } else {
                        html.push('还没人');
                    }
                    me.view.html([
                        text.replace(/\$\{nick\}/g, html.join('，')),
                        $.pandora.Wbcom.genNickHTML(info),
                        '<div class="com-wbrelation-avatar">' + plusHTML.join('') + '</div>'
                    ].join(''));
                }
            });
        },
        _renderFont : function () {
            this.view.css(this.options.font);
        },
        _renderShowAvatar : function () {
            this._renderDes();
        },
        _renderMax : function () {
            this._renderDes();
        }
    });
})(jQuery);