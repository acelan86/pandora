(function ($) {
    var GROUP_FILTER = 'group',
        GROUP_ATOM_FILTER = 'group-atom';

    $.widget('pandora.Group', $.pandora.ObjBase, {
        prop : {
            w : {
                disabled : true
            },
            h : {
                disabled : true
            },
            type : {
                type : 'switchobj',
                label : '类型'
            }
        },
        options : {
            resizable : false
        },
        _create : function () {
            $.pandora.ObjBase.prototype._create.call(this, this.options);
            this.element.addClass(GROUP_FILTER);
        },
        _destroy : function () {
            this.element.removeClass(GROUP_FILTER);
            $.pandora.ObjBase.prototype._destroy.call(this);
        },
        connect : function (coms) {
            var me = this,
                options = this.options,
                x, y, w, h, relativeX, relativeY,
                lefts = [],
                tops = [],
                rights = [],
                bottoms = [],
                $item,
                instance,
                value;

            this.options.coms = coms;

            $.each(coms, function (i, item) {
                $item = $('#' + item.uid);
                instance = $item.getInstance();
                value = instance.getValue().options;

                $item.addClass(GROUP_ATOM_FILTER);
                instance.disable();

                lefts.push(value.x - 0);
                tops.push(value.y - 0);
                rights.push((value.w - 0) + (value.x - 0));
                bottoms.push((value.h - 0) + (value.y - 0));
            });

            x = Math.min.apply(null, lefts);
            y = Math.min.apply(null, tops);
            w = Math.max.apply(null, rights) - x + 2;
            h = Math.max.apply(null, bottoms) - y + 2,
            z = this.options.z;

            $.extend(this.options, {
                x : x,
                y : y,
                w : w,
                h : h
            });

            $.each(coms, function (i, item) {
                //console.debug(coms);
                $item = $('#' + item.uid);
                relativeX = lefts[i] - x;
                relativeY = tops[i] - y;
                relativeZ = z + item.options.z;
                $item.getInstance().setValue({
                    x : relativeX,
                    y : relativeY,
                    z : relativeZ
                });
                $item.data({
                    'relativeX' : relativeX,
                    'relativeY' : relativeY,
                    'relativeZ' : relativeZ
                });
                me.view.append($item);
            });
            
            if (options.resizable) {
                this.element.resizable('option', {'minHeight' : h, 'minWidth' : w});
            }
            this.setPos(x, y);
            this.setSize(w, h);
        },
        unconnect : function () {
            var container = this.element.parent(),
                x = this.options.x,
                y = this.options.y,
                z = this.options.z,
                objs = [];
            $.each(this.options.coms, function (i, item) {
                objs.push(item);
                var $item = $('#' + item.uid),
                    instance = $item.getInstance();
                $item.removeClass(GROUP_ATOM_FILTER);
                $item.appendTo(container);
                instance.enable();
                console.debug(item, z);
                instance.setValue({
                    x : $item.data('relativeX') + x,
                    y : $item.data('relativeY') + y,
                    z : $item.data('relativeZ') - z
                });
            });
            this.options.coms = null;
            return objs;
        },
        getProp : function () {
            var r = {},
                me = this;

            $.map(this.prop, function (prop, k) {
                prop.value = me.options[k];
                r[k] = prop;
            });

            return r;
        },
        /* 设置控件属性 */
        _setValue : function (k, v) {
            if (this.prop[k]) {
                var handler = this[$.pandora.ObjBase.getRefreshPropHandlerName(k)];
                this.options[k] = v;
                handler && handler.call(this);
            }
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
            var r = {},
                value;

            r.type = this.widgetName;
            r.options = {
                coms : []
            };
            for (var k in this.prop) {
                ('undefined' != typeof this.options[k]) && (r.options[k] = this.options[k]);
            }
            $.each(this.options.coms, function (i, item) {
                value = $('#' + item.uid).getInstance().getValue();
                value.uid = item.uid;
                r.options.coms.push(value);
            });
            return r;
        }
    });
    $.pandora.Group.isGroup = function (item) {
        return $(item).hasClass(GROUP_FILTER);
    };
    $.pandora.Group.isGroupAtom = function (item) {
        return $(item).hasClass(GROUP_ATOM_FILTER);
    };
})(jQuery);