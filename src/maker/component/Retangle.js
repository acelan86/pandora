(function ($) {
    $.widget('pandora.Retangle', $.pandora.Com, {
        prop : {
            color : {
                level : 'base'
            },
            font : {
                level : 'base'
            },
            url : {
                type : 'text',
                label : '链接地址'
            }
        },
    	options : {
    		bgcolor : '#ccc'
    	},
        _create : function () {
            $.pandora.Com.prototype._create.call(this, this.options);
        }
    });
})(jQuery);