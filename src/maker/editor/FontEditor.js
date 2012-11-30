(function ($) {
    var FONT_FAMILY_LIST = [
        "Arial 默认",
        "SimSun 宋体",
        "SimHei 黑体",  
        "FangSong_GB2312 仿宋_GB2312",  
        "KaiTi_GB2312 楷体_GB2312"  
        // "YouYuan 幼圆",  
        // "STSong 华文宋体",  
        // "STZhongsong 华文中宋",   
        // "STKaiti 华文楷体",   
        // "STFangsong 华文仿宋",   
        // "STXihei 华文细黑",   
        // "STLiti 华文隶书",   
        // "STXingkai 华文行楷",   
        // "STXinwei 华文新魏",   
        // "STHupo 华文琥珀"
    ];
    var FONT_SIZE_LIST = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72];

    $.widget('pandora.FontEditor', $.pandora.BaseEditor, {
        options : {
            value : {
                'font-family' : 'SimSun'
            }
        },
        _create : function () {
            var options = this.options;
           
            $.pandora.BaseEditor.prototype._create.call(this, options);

            this._fontFamily = $('<select/>')
                .html(this._getFontFamilyHTML())
                .val(options.value['font-family'])
                .appendTo(this.element)
                .selectmenu({
                    width : 35,
                    menuWidth : 120,
                    change : $.proxy(this._changeHandler, this),
                    format : function (text, item) {
                        return '<span style="font-family:' + item.value + '">' + text + '</span>';
                    }
                });

            this._fontSize = $('<select/>')
                .html(this._getFontSizeHTML())
                .val(options.value['font-size'])
                .appendTo(this.element)
                .selectmenu({
                    width : 28,
                    menuWidth : 70,
                    change : $.proxy(this._changeHandler, this)
                });

            this._fontStyle = $('<div>')
                .addClass('font-editor-style')
                .html(this._getFontStyleHTML(options.value))
                .appendTo(this.element)
                .buttonset()
                .change($.proxy(this._changeHandler, this));

            this.element.addClass('font-editor');
            this._setOption('disabled', options.disabled);
        },
        _changeHandler : function (e, ui) {
            this._trigger('change', e, {value : this.options.value = this._getValue()});
        },
        _destroy : function () {
            this.element.removeClass('font-editor');
            $.pandora.BaseEditor.prototype._destroy.call(this);
        },
        _setOption : function (k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);
            if (k === 'disabled') {
                this._fontFamily.selectmenu(v ? 'disable' : 'enable');
                this._fontStyle.buttonset(v ? 'disable' : 'enable');
                this._fontSize.selectmenu(v ? 'disable' : 'enable');
            }
        },
        _getFontFamilyHTML : function () {
            var html = [];
            $.each(FONT_FAMILY_LIST, function (i, item) {
                var _item = item.split(' ');
                html.push('<option value="' + _item[0] + '">' + _item[1] + '</option>');
            });
            return html.join('');
        },
        _getFontSizeHTML : function () {
            var html = [];
            $.each(FONT_SIZE_LIST, function (i, item) {
                html.push('<option value="' + item + '">' + item + 'px</option>');
            });
            return html.join('');
        },
        _getFontStyleHTML : function (value) {
            var uid = this._getUID() + 'Style';
            return [
                '<input type="checkbox" name="font-weight"' + (value['font-weight'] === 'bold' && ' checked="checked"') + ' value="bold" id="' + uid + 'B" /><label for="' + uid + 'B"><b>B</b></label>',
                '<input type="checkbox" name="font-style"' + (value['font-style'] === 'italic' && ' checked="checked"') + ' value="italic" id="' + uid + 'I" /><label for="' + uid + 'I"><i>I</i></label>',
                '<input type="checkbox" name="text-decoration"' + (value['text-decoration'] === 'underline' && ' checked="checked"') + ' value="underline" id="' + uid + 'U" /><label for="' + uid + 'U"><u>U</u></label>'
            ].join('');
            uid = null;
        },
        _getValue : function () {
            var r = {},
                cbs = this._fontStyle.children('input[type="checkbox"]');

            r['font-family'] = this._fontFamily.val();
            r['font-size'] = parseInt(this._fontSize.val());

            cbs.each(function (i, item) {
                r[item.name] = (item.checked ? item.value : (item.name == 'text-decoration' ? 'none' : 'normal'));
            });

            return r;
        },
        _setValue : function (v) {
            var bold = v['font-weight'],
                italic = v['font-style'],
                underline = v['text-decoration'],
                font = v['font-family'],
                size = v['font-size'] + '';

            this._fontFamily.selectmenu('value', font);
            this._fontSize.selectmenu('value', size);

            var cbs = this._fontStyle.children('input[type="checkbox"]');
            cbs[0].checked = bold && bold !== 'normal';
            cbs[1].checked = italic && italic !== 'normal';
            cbs[2].checked = underline && underline !== 'none';

            this._fontStyle.buttonset();

            this.options.value = v;
        }
    });
})(jQuery);
