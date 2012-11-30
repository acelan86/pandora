/**
 * 舞台
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 *
 * params ===========
 * tolerance //判断选中方法
 *
 *
 * zIndx ===========
 *
 * canvas : 1
 * com : 10 -  1022  //最多允许1000个com
 * group : 1024 - 2046,
 * stage-helper : 2047
 * maker界面 ： 1024+
 */


(function ($) {
    var OBJ_FILTER = 'stage-obj',
        SELECTED_FILTER = OBJ_FILTER + '-selected',
        HOVER_FILTER = OBJ_FILTER + '-hover',

        COM_FILTER = 'stage-com',
        GROUP_FILTER = 'stage-group',

        uid = 1,
        ZINDEX = 1,
        comid = 0,
        groupid = 0, //组合groupid

        BASE_INDEX = 10, //com元件的起始index
        CANVAS_INDEX = 1,
        SELECT_HELPER_INDEX = 2047;

    $.widget('pandora.Stage', $.ui.mouse, {
        options : {
            canvasWidth : 360,
            canvasHeight : 250,
            canvasBgcolor : '#fff',
            canvasBordercolor : '#000',
            canvasBorder : 0,
            tolerance : 'touch',
            distance : 20
        },
        _create: function () {
            var me = this,
                options = this.options;

            options.width = options.width || this.element.parent().width();
            options.height = options.height || this.element.parent().height();

            this.widgetEventPrefix = 'stage';
            this.element
                .data('widgetName', this.widgetFullName)
                .addClass("stage")
                .css({
                    width : options.width,
                    height : options.height
                })
                .disableSelection();

            this._mouseInit();

            this.helper = $('<div class="stage-helper"></div>').css('z-index', SELECT_HELPER_INDEX);
            this.canvas = $('<div class="stage-canvas">')
                .css({'background-color' : options.canvasBgcolor, 'position' : 'absolute', 'z-index' : CANVAS_INDEX})
                .appendTo(this.element);


            this.editor = $('<div class="stage-canvas-editor">')
                .css('position', 'absolute')
                .appendTo(this.canvas);

            this.preview = $('<iframe scrolling="no" frameborder="0" class="stage-canvas-preview" id="' + options.previewId + '" name="' + options.previewId + '" src="about:blank" style="border:none;"></iframe>').css('position', 'absolute').appendTo(this.canvas);

            this._renderCanvasSize();
            this.centerCanvas();

            //$(window).resize($.proxy(this.centerCanvas, this));
            $(document).keydown($.proxy(this._doKey, this));

            this._on({
                'click' : function (e) {
                    //补丁。。mouseInit引起的blur不起作用
                    $('textarea', this.editor).blur();
                    this.unselectAll();
                    this._trigger('unselect', null);
                }
            });

            this._on(this.editor, function () {
                var h = {};
                h['click .' + OBJ_FILTER] = function (e) {
                    var item = e.currentTarget,
                        $item = $(item);
                    if ($item.hasClass(SELECTED_FILTER) && (e.ctrlKey || e.shiftKey)) {
                        this.unselect(item);
                        this._trigger('unselectone', e, { uid : $item.attr('id')});
                    } else {
                        this._select(item, e, e.ctrlKey || e.shiftKey);
                    }
                    e.stopPropagation();
                    e.preventDefault();
                };
                h['mouseenter .' + OBJ_FILTER] = function (e) {
                    $(e.currentTarget).addClass(HOVER_FILTER);
                };
                h['mouseleave .' + OBJ_FILTER] = function (e) {
                    $(e.currentTarget).removeClass(HOVER_FILTER);
                };
                h['objdragstart .' + OBJ_FILTER] = function (e, ui) {
                    var objs = this.dragObjs = [];

                    !$(e.currentTarget).hasClass(SELECTED_FILTER) && this._select(e.currentTarget, e);

                    /* 记录拖拽需要初始化的原始位置 */
                    this._getSelected().each(function (i, item){
                        var $item = $(item);
                        if (item !== e.currentTarget) {
                            objs.push(item);
                            $item.data({
                                'dragOLeft' : parseInt($item.css('left'), 10),
                                'dragOTop' : parseInt($item.css('top'), 10)
                            });
                        }
                    });
                };
                h['objdragging .' + OBJ_FILTER] = function (e, ui) {
                    var objs = this.dragObjs;
                    /* 其他选中元素跟随拖拽 */
                    objs && $.each(objs, function (i, item) {
                        var $item = $(item);
                        $item.getInstance().setPos(ui.offsetX + $item.data('dragOLeft'), ui.offsetY + $item.data('dragOTop'));
                    });
                    /* end */
                    this._trigger('objdragging', e, ui);
                };

                h['objdragend .' + OBJ_FILTER] = function (e, ui) {
                    var objs = this.dragObjs,
                        p = {};
                    /* 其他选中元素跟随拖拽 */
                    objs && $.each(objs, function (i, item) {
                        var $item = $(item),
                            instance = $item.getInstance(),
                            x = ui.offsetX + $item.data('dragOLeft'),
                            y = ui.offsetY + $item.data('dragOTop');
                        instance.setValue({
                            'x' : x,
                            'y' : y
                        });

                        p[$item.attr('id')] = {
                            'x' : x,
                            'y' : y
                        };
                    });
                    /* end */
                    p[e.target.id] = {
                        x : ui.x,
                        y : ui.y
                    };
                    this._trigger('change', e, p);

                    this.dragObjs = [];
                };

                h['objresizing.' + OBJ_FILTER] = function (e, ui) {
                    this._trigger('objresizing', e, ui);
                };

                h['objresizend.' + OBJ_FILTER] = function (e, ui) {
                    var p = {};
                    p[e.target.id] = {
                        w : ui.w,
                        h : ui.h,
                        x : ui.x,
                        y : ui.y
                    };
                    this._trigger('change', e, p);
                };
                return h;
            }());
        },
        _doKey : function (e) {
            var me = this,
                k,
                prop = {},
                selecteds = this._getSelected(),
                instance,
                value;
            switch (e.which) {
                case $.ui.keyCode.UP : k = 'y'; prop.y = -1; break;
                case $.ui.keyCode.DOWN : k = 'y'; prop.y = 1; break;
                case $.ui.keyCode.LEFT : k = 'x'; prop.x = -1; break;
                case $.ui.keyCode.RIGHT : k = 'x'; prop.x = 1; break;
                default : break;
            }

            k && $.each(selecteds, function (i, item) {
                instance = $(item).getInstance(),
                value = instance.getValue().options;
                instance.setValue(k, prop[k] + value[k]);
                me._trigger('objdragging', e, instance.getValue().options);
            });
            me = null;
        },
        _renderCanvasSize : function () {
            this.canvas.css({
                width : this.options.canvasWidth,
                height : this.options.canvasHeight
            });
            this.editor.css({
                width : this.options.canvasWidth,
                height : this.options.canvasHeight
            });
            this.preview.css({
                width : this.options.canvasWidth,
                height : this.options.canvasHeight
            });
        },

        _destroy: function() {
            $(document).off('keydown', this._doKey);
            $(window).off('resize', this.centerCanvas);
            this._mouseDestroy();
        },

        _mouseStart : function (e) {
            var options = this.options;

            if(options.disabled) { return; }

            this.opos = [e.pageX, e.pageY];
            $('body').append(this.helper);

            this.selectees = this._getObjs();
            this._cache(this.selectees);

            (!e.ctrlKey || !e.shiftKey) && this.unselectAll();

            this.helper.css({
                "left": e.clientX,
                "top": e.clientY,
                "width": 0,
                "height": 0
            });
        },
        _mouseDrag : function (e) {
            var me = this,
                options = this.options;

            if(options.disabled) { return; }

            this.dragged = true;

            var x1 = this.opos[0], y1 = this.opos[1], x2 = e.pageX, y2 = e.pageY;
            if (x1 > x2) {
                var tmp = x2; x2 = x1; x1 = tmp;
            }
            if (y1 > y2) {
                var tmp = y2; y2 = y1; y1 = tmp;
            }
            this.helper.css({
                left : x1,
                top : y1,
                width : x2 - x1,
                height : y2 - y1
            });

            this.selectees.each(function() {
                var selectee = $.data(this, "selectable-item"),
                    hit = false;

                if (!selectee || selectee.element == me.element[0]) return;

                if (options.tolerance == 'touch') {
                    hit = (!(selectee.left > x2 || selectee.right < x1 || selectee.top > y2 || selectee.bottom < y1));
                } else if (options.tolerance == 'fit') {
                    hit = (selectee.left > x1 && selectee.right < x2 && selectee.top > y1 && selectee.bottom < y2);
                }

                hit && (!selectee.$element.hasClass('obj-disabled')) && selectee.$element.addClass(SELECTED_FILTER);
            });

            return false;
        },
        _mouseStop : function (e) {
            var me = this,
                options = this.options;

            if(options.disabled) { return; }

            this.dragged = false;

            this.helper.remove();
            var props = this._getSelectedProp();
            if (!$.isEmptyObject(props)) {
                this._trigger("mutiselect", e, props);
            }

            return false;
        },

        _cache : function(selectees) {
            selectees.each(function() {
                var $this = $(this);
                var pos = $this.offset();
                $.data(this, "selectable-item", {
                    element: this,
                    $element: $this,
                    left: pos.left,
                    top: pos.top,
                    right: pos.left + $this.outerWidth(),
                    bottom: pos.top + $this.outerHeight()
                });
            });
        },

        _select : function (el, e, muti) {
            if (!$(el).hasClass(SELECTED_FILTER)) {
                if (!muti) {
                    this.unselectAll();
                    this._trigger('select', e, this.select(el));
                } else {
                    this.select(el);
                    this._trigger("mutiselect", e, this._getSelectedProp());
                }
            }
        },

        _getObjs : function () {
            return $('>.' + OBJ_FILTER, this.editor);
        },

        _getSelected : function () {
            return $('>.' + SELECTED_FILTER, this.editor);
        },

        _getSelectedProp : function () {
            var r = {},
                instance;
            this._getSelected().each(function (i, item) {
                instance = $(item).getInstance();
                r[item.id] = instance.getProp();
            });
            return r;
        },

        _genId : function () {
            return OBJ_FILTER + (uid++) + (+new Date());
        },
        _genTag : function (type) {
            return (type === 'Group' ? ('组合' + (groupid++)) : ('元件' + (comid++)));
        },

        _addCom : function (type, options, uid) {
            var type = type || 'ObjBase',
                options = options || {},
                _options = {},
                uid = uid || this._genId(),
                tag = this._genTag(type);
            $.extend(_options, options);
            _options.tag = options.tag = tag;
            _options.z = options.z = (options.z || BASE_INDEX + (ZINDEX++));
            _options.container = this.element;
            $('<div id="' + uid + '" data-tag="' + tag + '">').addClass(OBJ_FILTER).appendTo(this.editor)[type](_options);
            return {
                uid : uid,
                type : type,
                options : options
            };
        },
        _addGroup : function (options, uid) {
            //先设好分散后的x, y
            $.map(options.coms, function (atom, atomid) {
                atom.options.x += options.x;
                atom.options.y += options.y;
            });
            var group = this.group([{
                uid : uid,
                objs : this.add(options.coms),
                options : options
            }]);
            return group[0];
        },

        /**
         * ======================================================
         */
        resetCanvasSize : function (w, h) {
            this.options.canvasWidth = w;
            this.options.canvasHeight = h;
            this._renderCanvasSize();
            this.centerCanvas();
        },

        resetCanvasBgcolor : function (color) {
            color = color || this.options.canvasBgcolor || 'transparent';
            this.options.canvasBgcolor = color;
            this.editor.css({
                backgroundColor : color
            });
        },

        resetCanvasBorder : function (b, color) {
            b = parseInt(b, 10) || 0;
            color = color || this.options.canvasBordercolor || 'transparent';
            this.options.canvasBordercolor = color;
            this.options.canvasBorder = b;
            this.editor.css({
                borderWidth : b,
                borderStyle : 'solid',
                borderColor : color
            });
        },

        resize : function (w, h) {
            this.options.width = w;
            this.options.height = h;
            this.element.css({
                'width' : w,
                'height' : h
            });
            this.centerCanvas();
        },

        centerCanvas : function () {
            var options = this.options;
            this.canvas.css({
                left : (options.width - options.canvasWidth) / 2,
                top : (options.height - options.canvasHeight) / 2
            });
        },

        togglePreview : function ()  {
            $('body').toggleClass('preview');
            this.element.toggleClass('stage-preview');
        },
        resetPreview : function () {
            this.preview.attr('src', 'about:blank');
        },

        toggleTag : function () {
            $('body').toggleClass('stage-hide-tag');
        },

        reIndex : function (order) {
            var values = {};
            $.each(order, function (i, uid) {
                values[uid] = {z : BASE_INDEX + i};
            });
            this.changeValue(values);
            return values;
        },

        /**
         * 添加
         */
        remove : function (objs) {
            var me = this,
                p = [],
                value,
                instance,
                $obj;
            $.each(objs, function (i, obj) {
                $obj = $('#' + obj.uid);
                instance = $obj.getInstance();
                value = instance.getValue();
                value.uid = obj.uid;
                p.push(value);
                if ($.pandora.Group.isGroup(obj)) {
                    me.remove(instance.unconnect);
                }
                $obj.remove();
            });
            return p;
        },

        removeSelected : function () {
            var selecteds = this._getSelected(),
                objs = [];
            $.each(selecteds, function (i, selected) {
                objs.push({uid : selected.id});
            });
            return this.remove(objs);
        },


        //atoms = {uid : id, type : type}
        group : function (objs) {
            var me = this,
                r = [],
                uid,
                tag,
                group,
                atoms;
            $.each(objs, function (i, obj) {
                atoms = obj.objs;
                uid = obj.uid || me._genId();
                tag = me._genTag('Group'),
                options = $.extend(obj.options || {}, {
                    tag : tag,
                    z : BASE_INDEX + (ZINDEX++)
                });
                options.container = me.element;
                group = $('<div id="' + uid + '" data-tag="' + tag + '">')
                    .addClass(OBJ_FILTER)
                    .appendTo(me.editor)
                    .Group(options);

                $.each(atoms, function (i, atom) {
                    var $atom = $('#' + atom.uid);
                    me.unselect($atom[0]);
                    $atom.removeClass(HOVER_FILTER);
                });

                group.getInstance().connect(atoms);
                r.push({
                    uid : uid,
                    type : 'Group',
                    objs : atoms,
                    options : options
                });
            });

            return r;
        },
        /**
         * 组合选中的元件
         */
        groupSelected : function () {
            var me = this,
                selecteds = this._getSelected(),
                instance,
                atoms = [],
                r = [];

            if (selecteds.length >= 2) {
                $.each(selecteds, function (i, select) {
                    instance = $(select).getInstance();
                    atoms.push({
                        uid : select.id,
                        type : instance.widgetName,
                        options : instance.getValue().options
                    });
                });
                //生成组容器并连接已选项
                r = this.group([{
                    objs : atoms
                }]);
            }
            return r;
        },
        /**
         * 取消组合
         */
        ungroup : function (objs) {
            var me = this,
                atoms,
                r = [],
                $item;
            $.each(objs, function(i, obj) {
                $item = $('#' + obj.uid);
                if ($.pandora.Group.isGroup($item)) {
                    //取消链接,选中被取消的连接的对象，并删除组元素
                    atoms = $item.getInstance().unconnect();
                    $item.remove();
                    groupid--;
                    r.push({
                        uid : obj.uid,
                        objs : atoms
                    });
                }
            });
            return r;
        },

        ungroupSelected : function () {
            var me = this,
                r = [],
                objs = [],
                selecteds = this._getSelected();

            $.each(selecteds, function (i, selected) {
                if($.pandora.Group.isGroup(selected)) {
                    var instance = $(selected).getInstance();
                    objs.push({
                        uid : selected.id,
                        type : instance.widgetName
                    });
                }
            });
            return me.ungroup(objs);
        },

        //全选
        selectAll : function () {
            var me = this;
            this._getObjs().each(function (i, item) {
                me.select(item);
            });
            return this._getSelectedProp();
        },

        unselectAll : function () {
            var me = this;
            this._getSelected().each(function (i, item) {
                me.unselect(item);
            });
        },

        select : function (item) {
            var r = {},
                $item = $(item);
            $item.addClass(SELECTED_FILTER);
            r[$item.attr('id')] = $item.getInstance().getProp();
            return r;
        },

        unselect : function (item) {
            $(item).removeClass(SELECTED_FILTER);
        },

        changeValue : function (values) {
            var me = this,
                instance;
            
            $.map(values, function (value, uid) {
                instance = $('#' + uid).getInstance();
                if (instance) {
                    instance.setValue(value);
                }
                //微博控件全部刷新
                if (instance.widgetName.indexOf('Wb') === 0 && value.nick) {
                    $('.com-wbcom', me.element).each(function (i, item) {
                        $(item).getInstance().setValue({nick : value.nick});
                    });
                }
            });
        },

        add : function (values) {
            var me = this,
                objs = [],
                arrayValues = [],
                obj;

            //add(type [, options, uid])
            if (arguments.length > 1) {
                values = {
                    type : arguments[0],
                    options : arguments[1] || {},
                    uid : arguments[2] || null
                };
            }

            //add({uid : {type : xxx, options : xxx}})
            if (('object' === typeof values) && !$.isArray(values) && !values.type) {
                $.map(values, function (value, uid) {
                    value.uid = uid;
                    arrayValues.push(value);
                });
            //add('xxxx') || add({type : xxx, options : xxx})
            } else if (!$.isArray(values)) {
                arrayValues = [values];
            } else {
                arrayValues = values;
            }


            //add(['xxxxx', 'xxxxxx']) || add([{type : xxx, options: xxx}])
            $.each(arrayValues, function (i, value) {
                if ('string' === typeof value) {
                    value = {type : value};
                }
                if (value.type === 'Group') {
                    obj = me._addGroup(value.options, value.uid);
                } else {
                    obj = me._addCom(value.type, value.options, value.uid);
                }
                objs.push(obj);
            });
            return objs;
        },

        //for copy
        getSelectedValue : function () {
            var r = [];
            this._getSelected().each(function (i, obj) {
                var v = $(obj).getInstance().getValue();
                v.uid = obj.id;
                r.push(v);
            });
            return r;
        },

        setValue : function (values) {
            this.add(values);
        },
        getValue : function () {
            var r = [],
                wb = 0;
            this._getObjs().each(function (i, obj) {
                var v = $(obj).getInstance().getValue();
                v.uid = obj.id;
                if (v.type.indexOf('Wb') === 0) {
                    wb = v.options.nick;
                }
                r.push(v);
            });
            return {
                wb : wb,
                width : this.options.canvasWidth,
                height : this.options.canvasHeight,
                bgcolor : this.options.canvasBgcolor,
                border : this.options.canvasBorder ? '1|1|1|1' : '',
                borderColor : this.options.canvasBordercolor,
                objs : r
            };
        }
    });
})(jQuery);