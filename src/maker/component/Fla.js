(function ($) {
    var DEFAULT_SWF = 'http://adbox.sina.com.cn/maker/assets/img/adbox-default.swf';
    $.widget('pandora.Fla', $.pandora.Com, {
        prop : {
            src : {
                type : 'picture',
                label : '素材',
                mtype : 2
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
                url : DEFAULT_SWF,
                width : 300,
                height : 250
            }
        },
        setSize : function (w, h) {
            $.pandora.Com.prototype.setSize.call(this, w, h);
            $('embed', this.view).attr({
                width : w,
                height : h
            });
            $('.com-fla-view-mask', this.view).css({
                width : w,
                height : h
            });
        },
        _create : function () {
            $.pandora.Com.prototype._create.call(this, this.options);
            this.view.addClass('com-fla');
            this._renderSrc();
        },
        _destroy : function () {
            this.view.removeClass('com-fla');
            $.pandora.Com.prototype._destroy.call(this);
        },
        _renderSrc : function () {
            var w = this.options.w = this.options.w || this.options.src.width,
                h = this.options.h = this.options.h || this.options.src.height;

            this.view.html([
                $.createSwfHTML({
                    url : this.options.src.url,
                    width : this.options.w || this.options.src.width,
                    height : this.options.h || this.options.src.height,
                    scale : 'exactfit',
                    wmode : 'opaque'
                }),
                '<div class="com-fla-view-mask" style="z-index:' + (this.options.z + 1) + '"></div>'
            ].join(''));

            this.setSize(w, h);
        }
    });
})(jQuery);