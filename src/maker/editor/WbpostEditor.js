(function ($) {
    var BASE_CLASS = 'wbpost-editor';
    $.widget('pandora.WbpostEditor', $.pandora.BaseEditor, {
        _create : function () {
            var me = this,
                options = this.options;

            $.pandora.BaseEditor.prototype._create.call(this, options);

            this.element.addClass(BASE_CLASS);

            this.editor = $('<input type="text" style="width:80px;"/>')
                .val(options.value.url)
                .appendTo(this.element);
            this.ok = $('<button>确定</button>')
                .appendTo(this.element)
                .button()
                .click($.proxy(this._getpostHandler, this));

            this.panel = $('<div class="' + BASE_CLASS + '-panel"></div>')
                .appendTo(this.element);
        },
        _getpostHandler : function (e) {
            var url = this.editor.val(),
                me = this;
            this._getPost(url, function (postId) {
                me._trigger('change', null, { 
                    value : me.options.value = {
                        id : postId,
                        url : url
                    }
                });
            });
        },
        _destroy : function () {
            this.element.removeClass(BASE_CLASS);
            this.ok.unbind('click', this._getpostHandler);
            $.pandora.BaseEditor.prototype._destroy.call(this);
        },
        _getPost : function (url, cb) {
            var me = this;
            $.ajax('/wapi/getweibo', {
                data : {
                    url : url
                },
                dataType : 'script',
                success : function () {
                    $.responseParser(getweibo, function (data) {
                        var html = data.text;
                        data.thumbnail_pic && (html += '<br><img src="' + data.thumbnail_pic + '" />');
                        me.panel.html([
                            '<div class="editor-panel-arrow">\u25C6</div>',
                            '<div class="editor-panel-content">',
                                '<div class="' + BASE_CLASS + '-panel-inner">',
                                    html,
                                '</div>',
                            '</div>'
                        ].join('')).show();
                        cb && cb(data.id);
                    }, function () {
                        alert('获取微博文章失败');
                    });
                }
            });
        }
    });
})(jQuery);