(function ($) {
    $.widget('pandora.Imgslider', $.pandora.Com, {
        prop : {
            thumbX : {
                label : '小图区域x'
            },
            thumbY : {
                label : '小图区域y'
            },
            thumbWidth : {
                //type : 'number',
                label : '小图区域宽'
            },
            thumbHeight : {
                //type : 'number',
                label : '小图区域高'
            },
            thumbItemWidth : {
                type : 'number',
                label : '小图宽'
            },
            thumbItemHeight : {
                type : 'number',
                label : '小图高'
            },
            mainWidth : {
                //type : 'number',
                label : '大图宽度'
            },
            mainHeight : {
                //type : 'number',
                label : '大图高度'
            },
            dir : {
                type : 'select',
                datasource : [
                    {name : '横向', value : 0},
                    {name : '纵向', value : 1}
                ],
                label : '轮播方向',
                width : 60
            },
            delay : {
                type : 'select',
                datasource : [
                    { name : '1s', value : 1},
                    { name : '2s', value : 2},
                    { name : '3s', value : 3}
                ],
                label : '切换频率',
                width : 60
            },
            items : {
                type : 'objarray',
                map : {
                    'thumb' : {
                        type : 'picture',
                        label : '小图'
                    },
                    'main' : {
                        type : 'picture',
                        label : '大图'
                    },
                    'url' : {
                        type : 'text',
                        label : '链接'
                    }
                },
                label : '轮播素材',
                min : 5,
                max : 10,
                itemHeader : '素材组'
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
            overflow : {
                label : '隐藏-是否溢出'
            }
        },
        options : {
            delay : 3,
            size : '300x200',
            w : 300,
            h : 250,
            thumbItemWidth : 40,
            thumbItemHeight : 40,
            thumbWidth : 230,
            thumbHeight : 45,
            thumbX : 36,
            thumbY : 199,
            mainWidth : 300,
            mainHeight : 250,
            dir : 0,
            overflow : 0
        },
        _create : function () {
            var options = this.options,
                me = this;

            this.prop.items.onitemselect = $.proxy(this._selectItem, this);

            options.items = options.items || [
                {
                    'thumb' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1081.jpg',
                        width : 300,
                        height : 350
                    },
                    'main' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1076.jpg',
                        width : 300,
                        height : 350
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'thumb' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1082.jpg',
                        width : 300,
                        height : 350
                    },
                    'main' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1077.jpg',
                        width : 300,
                        height : 350
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'thumb' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1083.jpg',
                        width : 300,
                        height : 350
                    },
                    'main' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1078.jpg',
                        width : 300,
                        height : 350
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'thumb' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1084.jpg',
                        width : 300,
                        height : 350
                    },
                    'main' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1079.jpg',
                        width : 300,
                        height : 350
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'thumb' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1085.jpg',
                        width : 300,
                        height : 350
                    },
                    'main' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1080.jpg',
                        width : 300,
                        height : 350
                    },
                    'url' : 'http://sina.com'
                }
            ];

            $.pandora.Com.prototype._create.call(this, this.options);
            this.view.addClass('com-imgslider');
            this.view
                .append(
                    this.main = $('<div class="com-imgslider-main">')
                        .css({width : options.mainWidth, height : options.mainHeight})
                        .append(this.maincnt = $('<div class="com-imgslider-main-cnt">'))
                        .resizable({
                            resize : this._resizingMainHandler()
                        })
                )
                .append(
                    this.thumb = $('<div class="com-imgslider-thumb" style="position:absolute;">')
                        .append(this.larrow = $('<div class="com-imgslider-arrow com-imgslider-larrow">'))
                        .append(this.rarrow = $('<div class="com-imgslider-arrow com-imgslider-rarrow">'))
                        .append(this.tarrow = $('<div class="com-imgslider-arrow com-imgslider-tarrow">'))
                        .append(this.barrow = $('<div class="com-imgslider-arrow com-imgslider-barrow">'))
                        .append($('<div class="com-imgslider-thumb-inner">').append(this.thumbcnt = $('<div style="position:relative;">')))
                        .draggable({
                            containment : this.view,
                            drag : this._dragingThumbHandler()
                        })
                        .resizable({
                            handles : 'e, s',
                            resize : this._resizingThumbHandler()
                        })
                );
            this._renderItems();
            this._renderThumbSize();
            this._renderThumbPos();
            this._renderDir();
            this._renderArrowPos();
            this._on(this.thumb, {
                'click .com-imgslider-thumb-item' : function (e) {
                    this._selectItem(parseInt($(e.target).attr('data-idx'), 10));
                }
            });
            this.larrow.click(function (e) {
                var cur = me.thumbcnt.css('left'),
                    len = (me.options.items && me.options.items.length) || 0,
                    max =  me.options.thumbWidth - (me.options.thumbItemWidth + 6) * (len - 1);
                cur = cur === "auto" ? 0 : parseInt(cur, 10);
                if (cur > max) {
                    me.thumbcnt.css('left', cur - me.options.thumbItemWidth - 6);
                }
            });
            this.rarrow.click(function (e) {
                var cur = me.thumbcnt.css('left'),
                    len = (me.options.items && me.options.items.length) || 0;
                cur = cur === "auto" ? 0 : parseInt(cur, 10);
                if (cur < 0) {
                    me.thumbcnt.css('left', cur + me.options.thumbItemWidth + 6);
                }
            });
            this.tarrow.click(function (e) {
                var cur = me.thumbcnt.css('top'),
                    len = (me.options.items && me.options.items.length) || 0,
                    max =  me.options.thumbHeight - (me.options.thumbItemHeight + 6) * (len - 1);
                cur = cur === "auto" ? 0 : parseInt(cur, 10);
                if (cur > max) {
                    me.thumbcnt.css('top', cur - me.options.thumbItemHeight - 6);
                }
            });
            this.barrow.click(function (e) {
                var cur = me.thumbcnt.css('top'),
                    len = (me.options.items && me.options.items.length) || 0;
                cur = cur === "auto" ? 0 : parseInt(cur, 10);
                if (cur < 0) {
                    me.thumbcnt.css('top', cur + me.options.thumbItemHeight + 6);
                }
            });
        },
        _destroy : function () {
            this.barrow.unbind().remove();
            this.tarrow.unbind().remove();
            this.larrow.unbind().remove();
            this.rarrow.unbind().remove();
        },
        _renderArrowPos : function () {
            var top = this.options.thumbHeight / 2 - 8,
                left = this.options.thumbWidth / 2 - 8;
            this.larrow.css('top', top);
            this.rarrow.css('top', top);
            this.tarrow.css('left', left);
            this.barrow.css('left', left);
        },
        _checkOverflow : function () {
            var dir = parseInt(this.options.dir, 10) || 0,
                len = (this.options.items && this.options.items.length) || 0;

            this.thumb.removeClass('com-imgslider-thumb-overflow'); 
            this.options.overflow = 0;
            if (!dir) {
                //横向
                if ((this.options.thumbItemWidth + 6) * len > this.options.thumbWidth) {
                    this.thumb.addClass('com-imgslider-thumb-overflow');
                    this.options.overflow = 1;
                }
            } else {
                if ((this.options.thumbItemHeight + 6) * len > this.options.thumbHeight) {
                    this.thumb.addClass('com-imgslider-thumb-overflow');
                    this.options.overflow = 1;
                }
            }

            this.thumbcnt.css({
                left : 0,
                top : 0,
                width : !dir ? (this.options.thumbItemWidth + 6) * len : this.options.thumbItemWidth + 6,
                height : !dir ? this.options.thumbItemHeight + 6 : (this.options.thumbItemHeight + 6) * len
            });
        },
        _dragingThumbHandler : function () {
            var me = this;
            return function (e, ui) {
                me._trigger('change', e, {
                    'thumbX' : me.options.thumbX = ui.position.left,
                    'thumbY' : me.options.thumbY = ui.position.top
                });
            }
        },
        _resizingThumbHandler : function () {
            var me = this;
            return function (e, ui) {
                me._renderThumbSize();
                me._trigger('change', e, {
                    'thumbWidth' : me.options.thumbWidth = ui.size.width,
                    'thumbHeight' : me.options.thumbHeight = ui.size.height
                });
            };
        },
        _resizingMainHandler : function () {
            var me = this;
            return function (e, ui) {
                me._trigger('change', e, {
                    'mainWidth' : me.options.mainWidth = ui.size.width,
                    'mainHeight' : me.options.mainHeight = ui.size.height
                });  
                me._renderMainSize();
            };
        },
        _renderThumbItemSize : function () {
            var w = this.options.thumbItemWidth,
                h = this.options.thumbItemHeight;
            $('.com-imgslider-thumb-item', this.thumb).each(function (i, item) {
                $(item).css({width : w, height : h});
            });
        },
        _renderThumbItemWidth : function () {
            this._renderThumbItemSize();
            this._renderDir();
        },
        _renderThumbItemHeight : function () {
            this._renderThumbItemSize();
            this._renderDir();
        },
        _renderThumbSize : function () {
            this.thumb.css({
                width : this.options.thumbWidth,
                height : this.options.thumbHeight
            });
            this._checkOverflow();
        },
        _renderThumbWidth : function () {
            this._renderThumbSize();
        },
        _renderThumbHeight : function () {
            this._renderThumbSize();
        },
        _renderThumbPos : function () {
            this.thumb.css({left : this.options.thumbX, top : this.options.thumbY});
        },
        _renderThumbX : function () {
            this._renderThumbPos();
        },
        _renderThumbY : function () {
            this._renderThumbPos();
        },
        _renderMainSize : function () {
            var w = this.options.mainWidth,
                h = this.options.mainHeight;
            $('.com-imgslider-main-item', this.main).each(function (i, item) {
                $(item).css({width : w, height : h});
            });
            this.main.css({width : w, height : h});
        },
        _renderMainHeight : function () {
            this._renderMainSize();
        },
        _renderMainWidth : function () {
            this._renderMainSize();
        },
        _renderItems : function () {
            var items = this.options.items,
                thumbItems = [],
                mainItems = [],
                th = this.options.thumbItemHeight,
                tw = this.options.thumbItemWidth,
                mw = this.options.mainWidth,
                mh = this.options.mainHeight;
            this.main.children().first().css({
                top : 0
            });
            items && $.each(items, function (i, item) {
                mainItems.push('<img class="com-imgslider-main-item" style="width:' + mw + 'px;height:' + mh + 'px" src="' + item.main.url + '" alt="正在加载..."/>');
                thumbItems.push('<img data-idx="' + i + '" class="com-imgslider-thumb-item" style="width:' + tw + 'px;height:' + th + 'px" src="' + item.thumb.url + '"/>');
            });
            this.maincnt.html(mainItems.join(''));
            this.thumbcnt.html(thumbItems.join(''));
            this._checkOverflow();
        },
        _renderDir : function () {
            var dir = parseInt(this.options.dir, 10) || 0,
                tw = this.options.thumbWidth,
                th = this.options.thumbHeight,
                max = Math.max(tw, th);

            this.thumb.removeClass('com-imgslider-thumb-v com-imgslider-thumb-h');
            this.options.thumbHeight = dir ? max : this.options.thumbItemHeight + 6;
            this.options.thumbWidth = dir ? this.options.thumbItemWidth + 6 : max;
            this.thumb.addClass('com-imgslider-thumb-' + ['h', 'v'][dir]);
            this._renderThumbSize();
            this._renderArrowPos();
        },
        _selectItem : function (idx) {
            $('.com-imgslider-thumb-item', this.thumb).each(function(i, item) {
                var $item = $(item);
                parseInt($item.attr('data-idx'), 10) === idx ? $item.addClass('com-imgslider-thumb-item-selected') : $item.removeClass('com-imgslider-thumb-item-selected');
            });
            this.main.children().first().css({
                top : - this.options.mainHeight * idx
            });
        }
    });
})(jQuery);