(function($) {
    $.widget('pandora.ColorEditor', $.pandora.BaseEditor, {
        options: {
            value: ''
        },

        _create: function() {
            var me = this,
                options = this.options;

            $.pandora.BaseEditor.prototype._create.call(this);

            this.editor = $('<div class="color-editor"><div class="color-editor-btn" style="background-color:' + options.value + '"></div><i class="icon-arrow-down"></i></div>').addClass('ui-state-default').data('color', options.value).appendTo(this.element);

            this._hoverable(this.editor);

            this.editor.colorpicker({
                change :  function(e, data) {
                    var color = 'transparent';
                    if (data !== 'transparent') {
                        color = data.toHex();
                    }
                    me.setValue(color);
                    me._trigger('change', e, {value : color});
                }
            });

            this._setOption('disabled', options.disabled);
        },
        _destroy : function () {
            $.pandora.BaseEditor.prototype._destroy.call(this);
        },

        _setOption: function(k, v) {
            $.pandora.BaseEditor.prototype._setOption.call(this, k, v);

            if(k == 'disabled') {
                this.editor.attr('disabled', v);
                this.editor.colorpicker('option', 'disabled', v);
            }
        },

        _setValue: function(v) {
            this.editor.find('.color-editor-btn').css('background-color', v);
            this.editor.data('color', this.options.value = v);
        }
    });
})(jQuery);