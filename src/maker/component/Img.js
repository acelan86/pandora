(function ($) {
    var DEFAULT_IMAGE = 'http://adbox.sina.com.cn/maker/assets/img/adbox-default.png';
    $.widget('pandora.Img', $.pandora.Com, {
        prop : {
            src : {
                type : 'picture',
                label : '素材',
                mtype : 1
            },
            link : {
                type : 'text',
                label : '跳转链接'
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
            w : 0,
            h : 0,
            src : {
                url : DEFAULT_IMAGE,
                width : 200,
                height : 150
            }
        },
        setSize : function (w, h) {
            $.pandora.Com.prototype.setSize.call(this, w, h);
            $('img', this.view).css({
                width : w,
                height : h
            });
        },
        _create : function () {
            $.pandora.Com.prototype._create.call(this, this.options);
            this.view.addClass('com-img');
            this._renderSrc(true);
        },
        _destroy : function () {
            this.view.removeClass('com-img');
            $.pandora.Com.prototype._destroy.call(this);
        },
        _renderSrc : function (isInit) {
            var img = new Image(),
                me = this;
            console.debug(this.options)
            if (!isInit) {
                this.options.w = this.options.src.width;
                this.options.h = this.options.src.height;
            }
            img.onload = function () {
                me.view.html('<img src="' + me.options.src.url + '"/>');
                me.setSize(me.options.w = me.options.w || me.options.src.width, me.options.h = me.options.h || me.options.src.height);
                img.onload = null;
                img = null;
            }
            img.src = this.options.src.url;        }
    });
})(jQuery);