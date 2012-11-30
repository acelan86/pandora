/*!
 * 潘多拉广告基础元件
 * author : acelan(xiaobin8[at]staff.sina.com.cn)
 */
/*
 * com & group base
 * 实现一个可以拖拽跟缩放的对象
 */
(function ($) {
    var z = 0;
    $.widget('pandora.ObjBase', {
        prop : {
            w : {
                type : 'number',
                label : '宽'
            },
            h : {
                type : 'number',
                label : '高'
            },
            x : {
                type : 'number',
                label : '坐标x',
                level : 'base'
            },
            y : {
                type : 'number',
                label : '坐标y',
                level : 'base'
            },
            z : {
                label : '坐标z',
                level : 'base'
            },
            interactive : {
                type : 'objarray',
                map : {
                    effect : {
                        type : 'interactive',
                        label : ''
                    }
                },
                min : 0,
                max : 3,
                label : '动作',
                buttonText : ' + 添加一个动作'
            }
        },
        options : {
            resizable : true,
            x : 0,
            y : 0,
            w : 60,
            h : 40
        },
        _create : function () {
            var options = this.options,
                container = options.container || this.element.parent() || $('body'),
                z = options.z || (z++);

            this.widgetEventPrefix = 'obj';

            this.view = $('<div class="obj-view"/>').appendTo(this.element);

            this.element
                .css({
                    'z-index' : z,
                    'position' : 'absolute'
                })
                .addClass('obj')
                .data('widgetName', this.widgetFullName)
                .draggable({
                    containment : container,
                    start : $.proxy(this._dragstartHandler, this),
                    drag : $.proxy(this._draggingHandler, this),
                    stop : $.proxy(this._dragendHandler, this)
                });

            options.resizable && this.element.resizable({
                minWidth : this.options.minWidth || 60,
                minHeight : this.options.minHeight || 20,
                zIndex : z,
                helper : "ui-resizable-helper",
                //八个方向均可拖拽缩放
                handles : "n, e, s, w, ne, se, sw, nw",
                resize : $.proxy(this._resizingHandler, this),
                stop : $.proxy(this._resizeendHandler, this)
            });


            options.tag && this.element.append($('<div class="obj-tag">' + options.tag + '</div>'));

            this.setSize(this.options.w, this.options.h);
            this.setPos(this.options.x, this.options.y);

            this._setOption('disabled', options.disabled);
        },

        _destroy : function () {
            this.view
                .removeClass('obj-view')
                .unbind()
                .removeData()
                .remove();
        },

        _setOption : function (k, v) {
            $.Widget.prototype._setOption.call(this, k, v);

            if (k === 'disabled') {
                v ? this.element.addClass('obj-disabled') : this.element.removeClass('obj-disabled');
                this.element.draggable('option', 'disabled', v);
                this.options.resizable && this.element.resizable('option', 'disabled', v);
            }
        },

        setSize : function (w, h) {
            this.element.css({
                width : w,
                height : h
            });
            this.view.css({
                width : w,
                height : h
            });
        },

        setPos : function (x, y) {
            this.element.css({
                left : x,
                top : y
            });
        },

        _renderW : function () {
            this.setSize(this.options.w, this.options.h);
        },
        _renderH : function () {
            this.setSize(this.options.w, this.options.h);
        },
        _renderX : function () {
            this.setPos(this.options.x, this.options.y);
        },
        _renderY : function () {
            this.setPos(this.options.x, this.options.y);
        },
        _renderZ : function () {
            this.element.css('zIndex', this.options.z);
        },

        _dragstartHandler : function (e, ui) {
            this._trigger('dragstart', e, {
                x : ui.position.left,
                y : ui.position.top
            });
        },
        _draggingHandler : function (e, ui) {
            this._trigger('dragging', e, {
                x : ui.position.left,
                y : ui.position.top,
                offsetX : ui.position.left - ui.originalPosition.left,
                offsetY : ui.position.top - ui.originalPosition.top
            });
        },
        _dragendHandler : function (e, ui) {
            this.setPos(ui.position.left, ui.position.top);
            this._trigger('dragend', e, {
                x : this.options.x = ui.position.left,
                y : this.options.y = ui.position.top,
                offsetX : ui.position.left - ui.originalPosition.left,
                offsetY : ui.position.top - ui.originalPosition.top
            });
        },
        _resizingHandler : function (e, ui) {
            this._trigger('resizing', e, {
                w : ui.size.width,
                h : ui.size.height,
                x : ui.position.left,
                y : ui.position.top
            });
        },
        _resizeendHandler : function (e, ui) {
            var x = this.options.x + ui.position.left - ui.originalPosition.left,
                y = this.options.y + ui.position.top - ui.originalPosition.top;

            this.setSize(ui.size.width, ui.size.height);
            this.setPos(x, y);
            this._trigger('resizend', e, {
                w : this.options.w = ui.size.width,
                h : this.options.h = ui.size.height,
                x : this.options.x = x,
                y : this.options.y = y
            });
        },

        getProp : $.noop,

        /* 设置控件属性 */
        _setValue : function (k, v) {
            var handler = this[$.pandora.ObjBase.getRefreshPropHandlerName(k)];
            this.options[k] = v;
            handler && handler.call(this);
        },
        setValue : function () {
            if (arguments.length === 1) {
                var o = arguments[0];
                for (var k in o) {
                    this._setValue(k, o[k]);
                }
            } else if (arguments.length === 2){
                this._setValue(arguments[0], arguments[1]);
            }
        },
        getValue : function () {
            var r = {};
            r.type = this.widgetName;
            r.options = {};
            for (var k in this.prop) {
                ('undefined' != typeof this.options[k]) && (r.options[k] = this.options[k]);
            }
            return r;
        }
    });
    $.pandora.ObjBase.getRefreshPropHandlerName = function (k) {
        return '_render' + k.charAt(0).toUpperCase() + k.substring(1);
    };
})(jQuery);