(function ($) {
    var pointer = 0, //撤销指针
        len = 100,    //最大容量，包括撤销重做总数
        stack = [];

    $.widget('pandora.Recorder', {
        _create : function () {
            this.widgetEventPrefix = 'recorder';
            this.element.data('widgetName', this.widgetFullName);

            this.restoreBtn = this.element
                .children()
                .first()
                .button({'disabled' : true})
                .click($.proxy(this.restore, this));
            this.redoBtn = this.restoreBtn
                .next()
                .button({'disabled' : true})
                .click($.proxy(this.redo, this));

            this.element.buttonset();
        },
        _destroy : function () {
            this.restoreBtn.unbind('click', this._restore);
            this.redoBtn.unbind('click', this._redo);
            this.element.removeData();
        },
        restore : function () {
            if (pointer > 0) {
                var data = stack[--pointer];
                this.restoreBtn.button('option', 'disabled', !this.getRestoreState());
                this.redoBtn.button('option', 'disabled', !this.getRedoState());
                this._trigger('restore', null, {
                    data : data,
                    canRedo : this.getRedoState(),
                    canRestore : this.getRestoreState()
                });
            }
        },
        redo : function () {
            if (pointer <= stack.length - 1) {
                var data = stack[pointer++];

                this.redoBtn.button('option', 'disabled', !this.getRedoState());
                this.restoreBtn.button('option', 'disabled', !this.getRestoreState());

                this._trigger('redo', null, {
                    data : data,
                    canRedo : this.getRedoState(),
                    canRestore : this.getRestoreState()
                });
            }
        },
        record : function (data) {
            if (pointer < len) {
                stack[pointer++] = data;
                stack.splice(pointer);
            } else {
                stack.shift();
                stack[pointer - 1] = data;
            }
            this.redoBtn.button('option', 'disabled', true);
            this.restoreBtn.button('option', 'disabled', false);

            //console.debug(data, stack, pointer, len);

            return {
                data : data,
                stack : stack,
                pointer : pointer,
                len : len
            };
        },
        clear : function () {
            pointer = -1;
            stack.length = 0;
        },
        getRestoreState : function () {
            return pointer > 0;
        },
        getRedoState : function () {
            return pointer <= stack.length - 1;
        },
        getPointerPos : function () {
            return pointer;
        }
    });
})(jQuery);