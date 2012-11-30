(function ($) {
    var EVENT_TYPE_LIST = [
            "always 一直",
            "click 鼠标点击",  
            "mouseover 鼠标滑过",  
            "mouseout 鼠标移开"
        ],
        EVENT_ANIMATE_LIST = [
            "none 无效果",
            "show 出现",
            "hide 隐藏"
        ];

    $.widget('pandora.InteractiveEditor', $.pandora.BaseEditor, {
        options : {
            value : {
                type : 'always',
                animate : 'none',
                target : 'none'
            }
        },
        _create : function () {
            var me = this,
                options = this.options;

            $.pandora.BaseEditor.prototype._create.call(this, options);

            this._interType = $('<select/>')
                .html(this._getTypeHTML())
                .val(options.value.type)
                .appendTo(this.element)
                .selectmenu({
                    width : 35,
                    menuWidth : 100,
                    change : $.proxy(this._changeHandler, this)
                });
            this._interTarget = $('<select/>')
                .html(this._getTargetHTML())
                .val(options.value.target)
                .appendTo(this.element)
                .selectmenu({
                    width : 35,
                    menuWidth : 100,
                    change : $.proxy(this._changeHandler, this)
                });
            this._interAnimate = $('<select>')
                .html(this._getAnimateHTML())
                .val(options.value.animate)
                .appendTo(this.element)
                .selectmenu({
                    width : 35,
                    menuWidth : 100,
                    change : $.proxy(this._changeHandler, this)
                });

            this.element.addClass('interactive-editor');

            this._setOption('disabled', options.disabled);
        },
        _changeHandler : function (e) {
            this._trigger('change', e, {value : this.options.value = this._getValue()});
        },
        _destroy : function () {
            this.element.removeClass('interactive-editor');
            $.pandora.BaseEditor.prototype._destroy.call(this);
        },
        _setOption : function (k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);
            if (k === 'disabled') {
                this._interType.selectmenu(v ? 'disable' : 'enable');
                this._interTarget.selectmenu(v ? 'disable' : 'enable');
                this._interAnimate.selectmenu(v ? 'disable' : 'enable');
            }
        },
        _getTypeHTML : function () {
            var html = [];
            $.each(EVENT_TYPE_LIST, function (i, item) {
                var _item = item.split(' ');
                html.push('<option value="' + _item[0] + '">' + _item[1] + '</option>');
            });
            return html.join('');
        },
        _getTargetHTML : function () {
            var html = [],
                list = ('function' == typeof $.pandora.InteractiveEditor.getObjectList) ? $.pandora.InteractiveEditor.getObjectList() : $.pandora.InteractiveEditor.getObjectList;

            list.unshift('none 无');
            $.each(list, function (i, item) {
                var _item = item.split(' ');
                html.push('<option value="' + _item[0] + '">' + _item[1] + '</option>');
            });
            return html.join('');
        },
        _getAnimateHTML : function (value) {
            var html = [];
            $.each(EVENT_ANIMATE_LIST, function (i, item) {
                var _item = item.split(' ');
                html.push('<option value="' + _item[0] + '">' + _item[1] + '</option>');
            });
            return html.join('');
        },
        _getValue : function () {
            return {
                type : this._interType.val(),
                target : this._interTarget.val(),
                animate : this._interAnimate.val()
            };
        },
        _setValue : function (v) {
            this._interType.selectmenu('value', v.type);
            this._interTarget.selectmenu('value', v.target);
            this._interAnimate.selectmenu('value', v.animate);
            this.options.value = v;
        }
    });
    
    $.pandora.InteractiveEditor.getObjectList = function () {
        return [];
    };
})(jQuery);