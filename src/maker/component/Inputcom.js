(function ($) {
    var uid = 0;
    $.widget('pandora.Inputcom', $.pandora.Com, {
        prop : {
            name : {
                type : 'string',
                label : '字段名'
            }
        },
        options : {
        },
        _create : function () {
            $.pandora.Com.prototype._create.call(this, this.options);
            this.options.name = this.options.name || this._genName();
            this.element.addClass('com-inputcom');
        },
        _destroy : function () {
            this.element.removeClass('com-inputcom');
            $.pandora.Com.prototype._destroy.call(this);
        },
        _genName : function () {
            return this.widgetName + (uid++);
        }
    });
})(jQuery);