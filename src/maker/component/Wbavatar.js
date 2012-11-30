(function ($) {
    $.widget('pandora.Wbavatar', $.pandora.Wbcom, {
        prop : {
            w : {
                disabled : true
            },
            h : {
                disabled : true
            },
            size : {
                type : 'select',
                label : '头像尺寸',
                datasource : [
                    { name : "30x30", value : "30x30"},
                    { name : "50x50", value : "50x50"},
                    { name : "150x150", value : "150x150"}
                ],
                width : 80
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
            w: 40,
            h : 40,
            skin : 'default',
            size : '30x30'
        },
        _create : function () {
            $.pandora.Wbcom.prototype._create.call(this, this.options);
            this.view.addClass('com-wbavatar');
            this._renderSize();
            this._renderNick();
        },
        _renderNick : function () {
            var info = $.pandora.Wbcom.user;
            this.options.pic = (this.options.w > 50 || this.options.h > 50) ? info.avatar_large : info.profile_image_url;
            this.view.html($.pandora.Wbcom.genAvatarHTML(info, this.options.w, this.options.h));
        },
        _renderSize : function () {
            var size = this.options.size.split('x');
            this.options.w = parseInt(size[0], 10);
            this.options.h = parseInt(size[1], 10);
            this._renderNick();
            $.pandora.Wbcom.prototype.setSize.call(this, this.options.w, this.options.h);
        }
    });
})(jQuery);