(function ($) {
    var DEFAULT_AVATAR = 'http://adbox.sina.com.cn/maker/assets/img/weibo180x180.jpg';
    $.widget('pandora.Useravatar', $.pandora.Com, {
        prop : {
            size : {
                type : 'select',
                label : '头像尺寸',
                datasource : [
                    { name : "30x30", value : "30x30"},
                    { name : "50x50", value : "50x50"},
                    { name : "150x150", value : "150x150"}
                ]
            },
            pic : {
                label : '头像路径'
            },
            color : {
                level : 'base'
            },
            font : {
                level : 'base'
            },
            bgcolor : {
                level : 'base'
            }
        },
        options : {
            w: 50,
            h : 50,
            skin : 'default',
            size : '50x50',
            resizable : false
        },

        _create : function () {
            var me = this;
            $.pandora.Com.prototype._create.call(this, this.options);
            this.element.addClass('com-useravatar');
            this._renderSize();
        },
        _renderNick : function () {
            var me = this;
            $.pandora.SSOcom.checkLogin(function (status) {
                var uid = status.uid;
                $.pandora.Wbcom.getInfoByWid(uid, function (info) {
                    me.options.pic = (me.options.w > 50 || me.options.h > 50) ? info.avatar_large : info.profile_image_url;
                    me.view.html($.pandora.Wbcom.genAvatarHTML(info, me.options.w, me.options.h));
                }, function () {
                    me.view.html('<img src="' + DEFAULT_AVATAR + '" style="width:' + me.options.w + 'px;height:' + me.options.h + 'px;" />');
                });
            }, function () {
                me.view.html('<img src="' + DEFAULT_AVATAR + '" style="width:' + me.options.w + 'px;height:' + me.options.h + 'px;" />');
            });
        },
        _renderSize : function () {
            var size = this.options.size.split('x');
            this.options.w = parseInt(size[0], 10);
            this.options.h = parseInt(size[1], 10);
            this._renderNick();
            $.pandora.Com.prototype.setSize.call(this, this.options.w, this.options.h);
        }
    });
})(jQuery);