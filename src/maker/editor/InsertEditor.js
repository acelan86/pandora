(function ($) {
    $.widget('pandora.InsertEditor', $.pandora.TextEditor, {
        options : {
            value : '',
            btnText : '插入昵称',
            insertContent : ' ${nick} '
        },
        _create : function () {
            var me = this,
                options = this.options;

            $.pandora.TextEditor.prototype._create.call(this, this.options);
            this.textarea = this.element.addClass('insert-editor').find('textarea');
            this.insertBtn = $('<button>')
                .html(options.btnText)
                .appendTo($('<div style="text-align:right;">').appendTo(this.element))
                .button()
                .click($.proxy(this._insert, this));
        },
        _insert : function (e) {
            this.textarea.insertAtCaret(this.options.insertContent).keyup();
        },
        _destroy : function () {
            this.element.removeClass('insert-editor');
            this.insertBtn.off('click', this._insert);
            $.pandora.TextEditor.prototype._destroy.call(this);
        }
    });
})(jQuery);