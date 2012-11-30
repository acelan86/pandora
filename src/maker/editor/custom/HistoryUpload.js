(function($) {
    var tpl = '',
        HISTORY_URL = '/mid/get_list',
        BASE_CLASS = 'history-upload-editor',
        ITEM_CLASS = BASE_CLASS + '-item',
        ITEM_HOVER_CLASS = ITEM_CLASS + '-hover',
        ITEM_SELECTED_CLASS = ITEM_CLASS + '-selected',
        PAGE_SIZE = 9;
    
    $.widget('pandora.HistoryUpload', $.pandora.BaseUpload, {
        options: {
            value: 'history'
        },

        _create: function() {
            var me = this;

            $.pandora.BaseUpload.prototype._create.call(me);


            this.element.addClass(BASE_CLASS);

            this.list = $('<div/>').addClass(BASE_CLASS + '-list').appendTo(this.element);
            this.pager = $('<span>').minipager({
                change : function (e, data) {
                    me.loadData(data.page, PAGE_SIZE, me.options.mtype);
                }
            }).appendTo($('<div class="' + BASE_CLASS + '-pagerbar">').appendTo(this.element));

            this._on(this.list, (function () {
                var handler = {};
                handler['hover .' + ITEM_CLASS] = function (e) {
                    $(e.currentTarget).toggleClass(ITEM_CLASS + '-hover');
                };
                handler['click .' + ITEM_CLASS] = function (e) {
                    var tar = $(e.currentTarget),
                        url = tar.attr('data-url'),
                        width = parseInt(tar.attr('data-w'), 10),
                        height = parseInt(tar.attr('data-h'), 10);

                    $('.' + ITEM_SELECTED_CLASS, this.element).removeClass(ITEM_SELECTED_CLASS);

                    tar.addClass(ITEM_SELECTED_CLASS);
                    this._trigger('upload', null, {
                        value : this.options.value = {
                            url : url,
                            width : width,
                            height : height 
                        }
                    });
                };
                return handler;
            })());
        },

        _destroy : function () {
            this.list.remove();
            this.pager.unbind().remove();
            $.pandora.BaseUpload.prototype._destroy.call(this);
        },

        renderImg : function (item, size) {
            return '<img src="' + item.url + '" style="width:' + size.w + 'px;height:' + size.h + 'px;margin:' + size.hp + 'px ' + size.wp + 'px;" />';
        },

        renderFlash : function (item, size) {
            return [
                '<div style="position:relative;margin:' + size.hp + 'px ' + size.wp + 'px;">',
                    $.createSwfHTML({
                        url : item.url,
                        width : size.w,
                        height : size.h,
                        scale : 'exactfit'
                    }),
                    '<div class="com-fla-view-mask" style="z-index:1;width:' + size.w + 'px;height:' + size.h + 'px;"></div>',
                '</div>',
            ].join('');
        },

        renderVideo : function (item, size) {
            return [
                '<div style="position:relative;margin:' + size.hp + 'px ' + size.wp + 'px;">',
                    $.createSwfHTML({
                        url : $.pandora.Video.PLAYER_URL + item.url,
                        width : size.w,
                        height : size.h,
                        scale : 'exactfit'
                    }),
                    '<div class="com-video-view-mask" style="z-index:1;width:' + size.w + 'px;height:' + size.h + 'px;"></div>',
                '</div>',
            ].join('');
        },

        render : function (data) {
            if (!(data && data.recordlist instanceof Array && data.recordlist.length > 0)) {
                this.list.html('<div style="text-align:center;line-height:40px">没有可以使用的素材</div>');
                return;
            }
            //console.log(this.element.width());
            var html = [],
                me = this,
                max = Math.max(this.element.width() / 3 - 11, 30);
                //max = 55;
            $.each(data.recordlist, function (i, item) {
                var size = $.centerImage(item.width, item.height, max, max),
                    cnt;
                switch (parseInt(item.type, 10)) {
                    case 1 :
                        cnt = me.renderImg(item, size);
                        break;
                    case 2 : 
                        cnt = me.renderFlash(item, size);
                        break;
                    case 3 : 
                        cnt = me.renderVideo(item, size);
                        break;
                    default :
                        break; 
                }
                html.push('<li data-url="' + item.url + '" data-w="' + item.width + '" data-h="' + item.height + '" class="' + ITEM_CLASS + '">' + cnt + '</li>');
            });
            this.list.html('<ul>' + html.join('') + '</ul>');
        },

        //是否要公开该方法？
        loadData: function(page, pagesize, type) {
            var me = this,
                params = {
                    page_size : pagesize || PAGE_SIZE,
                    page : (page || 0) + 1,
                    type : type || me.options.mtype || 1
                };
            
            me.showLoadingState();
            $.ajax(HISTORY_URL, {
                dataType : 'json',
                data : params,
                success : function (data) {
                    me.hideLoadingState();
                    $.responseParser(data, function (data) {
                        me.pager.minipager('option', 'total', Math.ceil(data.recordcount / PAGE_SIZE));
                        me.render(data);
                    }, function (data) {
                        console.debug(data)
                    });
                }
            });
        },

        _setValue: function(v) {
            //选中列表某项
        }
    });
})(jQuery);