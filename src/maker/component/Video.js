(function ($) {
    var PLAYER_URL = 'http://img.adbox.sina.com.cn/assets/images/player.swf?flvurl=';
    $.widget('pandora.Video', $.pandora.Com, {
        prop : {
            src : {
                type : 'picture',
                label : '素材',
                mtype : 3
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
            },
            pic : {
                type : 'picture',
                label : '定帧图',
                mtype : 1,
                tips : '*建议使用400x300尺寸的图片'
            },
            autoplay : {
                type : 'select',
                label : '自动播放',
                datasource : [
                    {name : '否', value : 0},
                    {name : '是', value : 1}
                ],
                value : 0
            }
        },
        options : {
            w : 0,
            h : 0,
            src : {
                url : 'http://img.adbox.sina.com.cn/vod/251.flv',
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
            $('.com-video-view-mask', this.view).css({
                width : w,
                height : h
            });
        },
        _create : function () {
            $.pandora.Com.prototype._create.call(this, this.options);
            this.view.addClass('com-video');
            this._renderSrc();
        },
        _renderSrc : function () {
            var w = this.options.w = this.options.w || this.options.src.width,
                h = this.options.h = this.options.h || this.options.src.height;

            this.view.html(
                [
                    $.createSwfHTML({
                        url : PLAYER_URL + this.options.src.url,
                        width : this.options.w || this.options.src.width,
                        height : this.options.h || this.options.src.height,
                        scale : 'exactfit',
                        wmode : 'opaque'
                    }),
                    '<div class="com-video-view-mask" style="z-index:' + (this.options.z + 1) + '"></div>'
                ].join('')
            );
            this.setSize(w, h);
        }
    });

    $.pandora.Video.PLAYER_URL = PLAYER_URL;
})(jQuery);