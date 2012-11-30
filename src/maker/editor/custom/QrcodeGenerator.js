(function($) {
    var TYPE_MAP = ['', 'tel', 'url'],
        GEN_URL = '/qr/create';
    $.widget('pandora.QrcodeGenerator', $.pandora.BaseUpload, {
        options: {
            value: {
                url : 'http://sinastorage.com/sandbox/qr/2497.png',
                width : 60,
                height : 60
            },    //二维码图片的链接
            type : 1
        },
        _create: function() {
            var me = this,
                options = this.options;

            $.pandora.BaseUpload.prototype._create.call(this);

            this.inputEl = $('<input type="text" class="ui-input" style="width:45%"/>').appendTo(this.element);

            this.buttonEl = $('<button>生成</button>').button()
                .appendTo(this.element)
                .click(function (e) {
                    me.generate(me.inputEl.val());
                });
        },

        _destroy : function () {
            this.inputEl.remove();
            this.buttonEl.unbind().remove();
        },

        generate: function(text) {
            var me = this,
                par = {};

            me.showLoadingState();

            $.ajax(GEN_URL, {
                data : {
                    text : this.options.type === 1 ? ('TEL:' + text) : text
                },
                dataType : 'json',
                type : 'POST',
                success : function (data) {
                    $.responseParser(data, function (data) {
                        pandora.tipBox.show('生成二维码成功。');
                        me._trigger('change', null, {
                            value : me.options.value = {
                                url : data.url,
                                width : data.width,
                                height : data.height
                            }
                        });
                        me.hideLoadingState();
                    });
                }
            });
        },

        _setValue: function(v) {
            this.options.value = this._formatValue(v);
        },

        _getValue: function() {
            return this.options.value;
        }
    });
})(jQuery);