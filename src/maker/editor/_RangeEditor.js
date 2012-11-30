(function ($) {
    var initialize = false;

    function _updateRangeEditor($target) {

        $.adbox.RangeEditor._rpDiv.data('target', $target);

        var options = $target.editor.data('sliderOptions'),
            _slider = $.adbox.RangeEditor._rpSlider;

        _slider.slider('option', {
            'min' : options.min,
            'max' : options.max
        });
    }

    function _showRangeSlider() {
        var $input = $.adbox.RangeEditor._rpDiv.data('target').editor;

        $.adbox.RangeEditor._rpDiv.position({
            of: $input,
            my: 'left top',
            at: 'right top',
            offset : "-1 0",
            collision : "fit"
        });
    }
    function _hideRangeSlider() {
        $.adbox.RangeEditor._rpDiv.css({
            left : -10000,
            top : -10000
        });
    }

    $.widget('adbox.RangeEditor', $.adbox.BaseEditor, {
        options : {
            value : 0,
            min : 0,
            max : 100,
            format : function (v) {
                return v;
            }
        },
        _create : function () {
            var me = this,
                options = this.options,
                sliderOptions = {
                    min : options.min,
                    max : options.max
                };

            $.adbox.BaseEditor.prototype._create.call(this, options);

            this.editor = $('<input type="text" style="width:24px;">').
                data('sliderOptions', sliderOptions).
                val(options.value).
                focus(function () {
                    var $input = $(this);
                    if (!initialize) {
                        $.adbox.RangeEditor._rpSlider = $('<div>').slider({
                            orientation : 'vertical',
                            change : function (e, ui) {
                                var $target = $.adbox.RangeEditor._rpDiv.data('target'),
                                    options = $target.options;
                                if (options.value !== ui.value) {
                                    $target._trigger('change', e, {value : options.value = ui.value});
                                }
                            },
                            slide : function (e, ui) {
                                var $target = $.adbox.RangeEditor._rpDiv.data('target'),
                                    options = $target.options;
                                $target.editor.val(ui.value);
                            }
                        });

                        $.adbox.RangeEditor._rpDiv = $('<div class="range-editor-pop">').css({
                            position : 'absolute'
                        }).mousedown(function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        }).append($.adbox.RangeEditor._rpSlider);

                        $('body').append($.adbox.RangeEditor._rpDiv).mousedown(function (e) {
                            _hideRangeSlider();
                        });

                        initialize = true;
                    }


                    if (me !== $.adbox.RangeEditor._rpDiv.data('target')) {
                        _updateRangeEditor(me);
                    }

                    $.adbox.RangeEditor._rpSlider.slider('value', options.value);
                    
                    _showRangeSlider();

                    return false;

                });

            this.element.append(this.editor).addClass('range-editor');

            this._setOption('disabled', options.disabled);
        },

        _destroy : function () {
            this.editor.unbind().removeData('sliderOptions').remove();
        },

        _setOption : function (k, v) {
            $.adbox.BaseEditor.prototype._setOption.call(this, k, v);
            if (k === 'disabled') {
                this.editor.attr('disabled', v);
            }
        },
        _formatValue : function (v) {
            //return $.isFunction(this.options.format) ? this.options.format(v) : v;
            return parseInt(v, 10);
        },
        _getValue : function () {
            return this._formatValue(this.editor.val());
        },
        _setValue : function (v) {
            this.editor.val(this.options.value = v);
        }
    });

})(jQuery);