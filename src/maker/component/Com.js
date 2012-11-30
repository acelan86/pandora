(function ($) {
    $.widget('pandora.Com', $.pandora.ObjBase, {
        /* widget使用的prop属性描述 */
        prop : {
            bgcolor : {
                type : 'color',
                label : '背景颜色'
            },
            font : {
                type : 'font',
                label : '文字样式'
            },
            color : {
                type : 'color',
                label : '文字颜色'
            },
            opacity : {
                type : 'range',
                range : {
                    min : 0,
                    max : 100
                },
                label : '透明度'
            }
        },
        options : {
            x : 0,
            y : 0,
            w : 90,
            h : 60,
            opacity : 0,
            font : {
                'font-family' : 'Arial'
            },
            color : '#333'
        },
        _create : function () {
            $.pandora.ObjBase.prototype._create.call(this, this.options);

            this.options.opacity && (this.options.opacity > 0) && (this._renderOpacity());

            this._renderBgcolor();
            this._renderColor();
            this._renderFont();
            this._renderSkin();

            this.element.addClass('com');
        },

        _destroy : function () {
            this.element.removeClass('com');
            $.pandora.ObjBase.prototype._destroy.call(this);
        },

        _renderBgcolor : function () {
            this.options.bgcolor && this.view.css('background-color', this.options.bgcolor);
        },

        _isSkinClass : function (cn) {
            return cn.indexOf(this.widgetName + '-skin-') >= 0;
        },

        _genSkinClass : function () {
            return this.widgetName + '-skin-' + this.options.skin;
        },

        _renderSkin : function () {
            var me = this,
                cn = this.element[0].className.split(' ');
            $.each(cn, function(i, item) {
                me._isSkinClass(item) && me.element.removeClass(item);
            });
            this.element.addClass(this._genSkinClass());
        },
        _renderOpacity : function () {
            this.view.css('opacity', (100 - this.options.opacity) / 100);
        },
        _renderFont : function () {
            this.view.css(this.options.font);
        },
        _renderColor : function () {
            this.view.css('color', this.options.color);
        },

        //======
        /* 获取控件属性值 */
        getProp : function () {
            var r = {};
            for (var k in this.prop) {
                $.extend(r[k] = {}, this.prop[k], {value : this.options[k]});
            }
            return r;
        }
    });
})(jQuery);