(function ($) {
    var BASE_CLASS = 'com-tabslider',
        TAB_CLASS = BASE_CLASS + '-tab',
        TAB_ITEM_CLASS = TAB_CLASS + '-item',
        MAIN_CLASS = BASE_CLASS + '-main',
        MAIN_ITEM_CLASS = MAIN_CLASS + '-item',
        DEFAULT_TAB_ITEM_WIDTH = 60,
        DEFAULT_TAB_ITEM_HEIGHT = 30;
    $.widget('pandora.Tabslider', $.pandora.Com, {
        prop : {
            layout : {
                type : 'select',
                datasource : [
                    //首位表示 ： 0-垂直排列 1-水平排列  其他位1标识tab, 0标识main
                    { name : '一栏居上', value : '010'},
                    { name : '一栏居下', value : '001'},
                    { name : '一栏居左', value : '110'},
                    { name : '一栏居右', value : '101'},
                    { name : '两栏居上', value : '0110'},
                    { name : '两栏居下', value : '0011'},
                    { name : '两栏居左', value : '1110'},
                    { name : '两栏居右', value : '1011'},
                    { name : '两栏上下', value : '0101'},
                    { name : '两栏左右', value : '1101'}
                ],
                format : function (text, item) {
                    //console.debug(opt.val());
                    return '<i class="icon icon-t-layout-' + item.value + '"></i>' + text;
                },
                menuWidth : 100,
                label : '布局',
                width : 100
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
                    'text' : {
                        type : 'string',
                        label : '页签文字'
                    },
                    'pic' : {
                        type : 'picture',
                        label : '大图'
                    },
                    'url' : {
                        type : 'text',
                        label : '链接'
                    }
                },
                label : '轮播素材',
                min : 4,
                max : 12,
                itemHeader : '素材组'
            },
            mainWidth : {
                label : '主区域宽度'
            },
            mainHeight : {
                label : '主区域高度'
            }
        },
        options : {
            w : 300,
            h : 100,
            delay : 3,
            layout : '1101'
        },
        _create : function () {
            var options = this.options;

            this.prop.items.onitemselect = $.proxy(this._selectItem, this);

            options.items = options.items || [
                {
                    'text' : '小图一',
                    'pic' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1076.jpg',
                        width : 300,
                        height : 250
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'text' : '小图二',
                    'pic' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1077.jpg',
                        width : 300,
                        height : 250
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'text' : '小图三',
                    'pic' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1078.jpg',
                        width : 300,
                        height : 250
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'text' : '小图四',
                    'pic' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1079.jpg',
                        width : 300,
                        height : 250
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'text' : '小图五',
                    'pic' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1080.jpg',
                        width : 300,
                        height : 250
                    },
                    'url' : 'http://sina.com'
                },
                {
                    'text' : '小图六',
                    'pic' : {
                        url : 'http://img.adbox.sina.com.cn/pic/1080.jpg',
                        width : 300,
                        height : 250
                    },
                    'url' : 'http://sina.com'
                }
            ];
            $.pandora.Com.prototype._create.call(this, this.options);
            this.view.addClass('com-tabslider');
            this.view.append($('<ul class="com-tabslider-main"></ul>'));
            this._renderLayout();

            this._on(this.element, {
                'click .com-tabslider-tab-item' : function (e) {
                    this._selectItem(parseInt($(e.target).attr('data-idx'), 10));
                }
            });
        },
        _renderLayout : function () {
            var pos = ['v', 'h'][parseInt(this.options.layout.charAt(0), 10)],
                layout = this.options.layout.substring(1).split(''),
                html = [];

            //console.debug(pos, layout);

            this.view.removeClass(BASE_CLASS + '-layout-v');
            this.view.removeClass(BASE_CLASS + '-layout-h');

            $.each(layout, function (i, item) {
                if (item === "0") {
                    html.push('<div class="' + MAIN_CLASS + '"><ul class="' + MAIN_CLASS + '-inner"></div>');
                } else {
                    html.push('<ul class="' + TAB_CLASS + '"></ul>');
                }
            });

            this.view.addClass(BASE_CLASS + '-layout-' + pos).html(html.join(''));

            this._renderItems();

        },
        _resize : function (w, h) {
            var vDir = this.options.layout.charAt(0) === "0",
                cols = this.options.layout.substring(1).replace('0', '').length,
                me = this;

            $('.' + MAIN_ITEM_CLASS + ', .' + MAIN_ITEM_CLASS + ' img, .' + MAIN_CLASS, this.view).each(function (i, item) {
                var width = (vDir ? w : (w - (DEFAULT_TAB_ITEM_WIDTH) * cols)),
                    height = (vDir ? (h - (DEFAULT_TAB_ITEM_HEIGHT) * cols) : h);

                $(item).css({
                    width : me.options.mainWidth = width,
                    height : me.options.mainHeight = height
                });
            });

            $('.' + TAB_CLASS, this.view).each(function (i, tab) {
                var len = parseInt($(tab).attr('data-tablen')),
                    width = vDir ? (w / len - 1) : DEFAULT_TAB_ITEM_WIDTH,
                    height = vDir ? DEFAULT_TAB_ITEM_HEIGHT : (h / len - 1);
                $('.' + TAB_ITEM_CLASS, $(tab)).each(function (j, item) {
                    $(item).css({
                        'width' : width,
                        'height' : height,
                        'lineHeight' : height + 'px'
                    });
                });
            });
            this.view.find('.' + MAIN_CLASS + '-inner').css('top', 0);
        },
        setSize : function (w, h) {
            $.pandora.Com.prototype.setSize.call(this, w, h);
            this._resize(w, h);
        },
        _renderItems : function () {
            var me = this,
                items = this.options.items.slice(0),
                tabs = [],
                main = [],
                len = this.options.layout.substring(1).replace('0', '').length,
                num = Math.ceil(items.length / len),
                parts = [],
                idx = 0;

            while(items.length > 0) {
                parts.push(items.splice(0, num));
            }

            $.each(parts, function (i, part) {
                var html = [];
                $.each(part, function (j, item) {
                    main.push('<li class="com-tabslider-main-item com-tabslider-main-item-' + idx + '"><img src="' + item.pic.url + '"/></li>');
                    html.push('<li class="com-tabslider-tab-item com-tabslider-tab-item-' + idx + '" data-idx="' + (idx++) + '">' + item.text + '</li>');
                });
                tabs.push(html.join(''));
            });

            $('.' + TAB_CLASS, this.view).each(function (i, item) {
                $(item).attr('data-tablen', parts[i].length).html(tabs[i]);
            });
            $('.' + MAIN_CLASS + '-inner', this.view).html(main.join(''));
            this._resize(this.options.w, this.options.h);
        },
        _selectItem : function (idx) {
            $('.com-tabslider-tab-item', this.element).each(function (i, item) {
                var $item = $(item);
                parseInt($item.attr('data-idx'), 10) === idx ?  $item.addClass('com-tabslider-tab-item-active') : $item.removeClass('com-tabslider-tab-item-active');
            });
            this.view.find('.com-tabslider-main-inner').css({
                top : - this.options.mainHeight * idx
            });
        }
    });
})(jQuery);