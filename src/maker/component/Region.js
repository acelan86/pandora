(function ($) {
    $.widget('pandora.Region', $.pandora.Com, {
        prop : {
            provname : {
                type : 'string',
                label : '省字段名'
            },
            cityname : {
                type : 'string',
                label : '市字段名'
            },
            provW : {
                type : 'number',
                label : '省选项宽'
            },
            cityW : {
                type : 'number',
                label : '市选项宽'
            }
        },
        options : {
            w : 220,
            h : 40,
            provname : 'pname',
            cityname : 'cname',
            provW : 100,
            cityW : 100
        },
        _create : function () {
            $.pandora.Com.prototype._create.call(this, this.options);

            this.view.addClass('com-region');
            this.view.html('<select style="margin-right:5px;"><option value="-1">省</option></select><select><option>市</option></select>');
            this._renderProvW();
            this._renderCityW();
        },
        _destroy : function () {
            this.view.removeClass('com-region');
            $.pandora.Com.prototype._destroy.call(this);
        },
        _renderProvW : function () {
            this.view.children().first().width(this.options.provW);
        },
        _renderCityW : function () {
            this.view.children().last().width(this.options.cityW);
        }
    });
})(jQuery);