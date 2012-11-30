(function ($) {
    $.widget('pandora.RadioEditor', $.pandora.BaseEditor, {
        _create : function () {
            var me = this,
                options = this.options;

            $.pandora.BaseEditor.prototype._create.call(this, options);

            this.editor = this.element.html(this._getMainHTML()).buttonset().change($.proxy(this._changeHandler, this));

            this._setOption('disabled', options.disabled);

        }, 
        _changeHandler : function (e) {
            this._trigger('change', e, {value : this.options.value = e.srcElement.value});
        },
        _destroy : function () {
            this.editor.unbind('change', this._changeHandler);
            $.pandora.BaseEditor.prototype._destroy.call(this);
        },
        _setOption : function (k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);
            if (k === 'disabled') {
                this.editor.buttonset(v ? 'disable' : 'enable');
            }
        },
        _getMainHTML : function () {
            var me = this,
                html = [],
                ds = this.options.datasource,
                format = this.options.format,
                name = this.options.name || this._getName();

            $.each(ds, function (i, item) {
                var _uid = me._getUID(),
                    checked = (item == me.options.value ? 'checked="checked"' : '');
                html.push('<input type="radio" ' + checked + ' value="' + item + '" id="' + _uid + '" name="' + name + '"/><label for="' + _uid + '">' + (format ? format(i, item) : item) + '</label>');
            });
            return html.join('');
        },
        _formatValue : function (v) {
            return v + '';
        },
        _setValue : function (v) {
            var me = this,
                value = this._formatValue(v);
            $('input[type="radio"]', this.element).each(function (i, item) {
                if (me._formatValue(item.value) === v) {
                    me.options.value = value;
                    item.checked = true;
                }
            });
            this.element.buttonset();
        },
        _getValue : function () {
            var me = this,
                value;
            $('input[type="radio"]', this.element).each(function (i, item) {
                if (item.checked) {
                    return value = me._formatValue(item.value);
                }
            });
            return value;
        }
    })

})(jQuery);