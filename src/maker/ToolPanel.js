(function ($) {
    $.widget('pandora.ToolPanel', {
        _create : function () {
            var options = this.options;

            options.height = options.height || this.element.parent().height();

            this.widgetEventPrefix = 'toolpanel';

            this.element
                .data('widgetName', this.widgetFullName)
                .append($('<div class="ui-widget-header">元件列表</div>'))
                .css('height', options.height);

            this.view = $('<div>')
                .appendTo(this.element)
                .html([
                    '<h3>普通元件<i class="icon-small icon-arrow-down"></i></h3>',
                    '<ul>',
                        '<li data-tip="矩形" data-type="Retangle"><a href="#"><i class="icon-big icon-big-retangle"></i><br>矩形</a></li>',
                        '<li data-tip="文字" data-type="Txt"><a href="#"><i class="icon-big icon-big-text"></i><br>文字</a></li>',
                        '<li data-tip="按钮" data-type="Btn"><a href="#"><i class="icon-big icon-big-button"></i><br>按钮</a></li>',
                        '<li data-tip="图片" data-type="Img"><a href="#"><i class="icon-big icon-big-image"></i></i><br>图片</a></li>',
                        '<li data-tip="二维码" data-type="Qrcode"><a href="#"><i class="icon-big icon-big-qrcode"></i></i><br>二维码</a></li>',
                        '<li data-tip="视频" data-type="Video"><a href="#"><i class="icon-big icon-big-video"></i></i><br>视频</a></li>',
                        '<li data-tip="动画" data-type="Fla"><a href="#"><i class="icon-big icon-big-fla"></i></i><br>flash</a></li>',
                    '</ul>',
                    '<h3>微博元件<i class="icon-small icon-arrow-down"></i></h3>',
                    '<ul>',
                        '<li data-tip="加关注" data-type="Wbfocus"><a href="#"><i class="icon-big icon-big-wbfocus"></i><br>加关注</a></li>',        
                        '<li data-tip="微博头像" data-type="Wbavatar"><a href="#"><i class="icon-big icon-big-wbavatar"></i><br>微博头像</li>',
                        '<li data-tip="微博昵称" data-type="Wbnick"><a href="#"><i class="icon-big icon-big-wbnick"></i><br>微博昵称</a></a></li>',
                        '<li data-tip="微博关系" data-type="Wbrelation"><a href="#"><i class="icon-big icon-big-wbrelation"></i><br>微博关系</a></li>',
                        '<li data-tip="转发" data-type="Wbrepos"><a href="#"><i class="icon-big icon-big-wbrepos"></i><br>转发</a></li>',
                        '<li data-tip="分享" data-type="Wbshare"><a href="#"><i class="icon-big icon-big-wbshare"></i><br>分享</a></li>',
                        '<li data-tip="用户昵称" data-type="Usernick"><a href="#"><i class="icon-big icon-big-usernick"></i><br>用户昵称</a></li>',
                        '<li data-tip="用户头像" data-type="Useravatar"><a href="#"><i class="icon-big icon-big-useravatar"></i><br>用户头像</a></li>',
                    '</ul>',
                    '<h3>轮播元件<i class="icon-small icon-arrow-down"></i></h3>',
                    '<ul>',
                        '<li data-tip="轮播" data-type="Imgslider"><a href="#"><i class="icon-big icon-big-slider"></i></i><br>图片</a></li>',
                        '<li data-tip="轮播" data-type="Tabslider"><a href="#"><i class="icon-big icon-big-tabslider"></i></i><br>页签</a></li>',
                    '</ul>',
                    '<h3>表单元件<i class="icon-small icon-arrow-down"></i></h3>',
                    '<ul>',
                        '<li data-tip="输入框" data-type="Input"><a href="#"><i class="icon-big icon-big-input"></i><br>输入框</a></li>',
                        '<li data-tip="单选框" data-type="Radio"><a href="#"><i class="icon-big icon-big-radio"></i><br>单选框</a></li>',
                        '<li data-tip="复选框" data-type="Checkbox"><a href="#"><i class="icon-big icon-big-checkbox"></i><br>复选框</a></li>',
                        '<li data-tip="单选菜单" data-type="Select"><a href="#"><i class="icon-big icon-big-select"></i><br>单选菜单</a></li>',
                        '<li data-tip="地域" data-type="Region"><a href="#"><i class="icon-big icon-big-region"></i><br>地域</a></li>',
                    '</ul>'
                ].join(''))
                .accordion({
                    heightStyle: "fill",
                    animate : false
                });

            this._on(this.view, {
                'click li' : function (e) {
                    this._trigger('select', null, $(e.currentTarget).attr('data-type'));
                }
            });
        },
        _destroy : function () {
            this.element.removeClass('toolpanel').removeData();
        },
        resize : function (h) {
            this.options.height = h;
            this.element.css('height', h);
            this.view.accordion('refresh');
        }
    });
})(jQuery);