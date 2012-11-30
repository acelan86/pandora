(function ($) {
    var uid = 0;
    $.widget('pandora.Input', $.pandora.Inputcom, {
        prop : {
            type : {
                type : 'select',
                datasource : [
                    {name : '普通文本', value : 'text'},
                    {name : '密码', value : 'password'}
                ],
                label : '类型'
            },
            label : {
                type : 'string',
                label : '标签'
            },
            minlength : {
                type : 'number',
                label : '最小长度'
            },
            maxlength : {
                type : 'number',
                label : '最大长度'
            },
            require : {
                type : 'select',
                datasource : [
                    {name : '否', value : 0},
                    {name : '是', value : 1}
                ],
                label : '必填'
            },
            rule : {
                type : 'select',
                datasource : [
                    {name : '无', value : 'none'},
                    {name : '整数', value : 'intege'},
                    {name : '正整数', value : 'intege1'},
                    {name : '负整数', value : 'intege2'},
                    {name : '邮箱', value : 'email'},
                    {name : '中文', value : 'chinese'},
                    {name : '邮编', value : 'zipcode'},
                    {name : '移动电话', value : 'mobile'},
                    {name : '自定义', value : 'other'}
                ],
                width : 100,
                label : '验证规则'
            },
            pattern : {
                //type : 'string',
                label : '验证正则'
            },
            placeholder : {
                type : 'string',
                label : '默认文字'
            }
        },
        options : {
            w : 120,
            h : 20,
            label : '标签'
        },
        _create : function () {
            var me = this,
                options = this.options;
            $.pandora.Inputcom.prototype._create.call(this, options);
            this.view.addClass('com-input');
            this._renderPlaceholder();
        },
        _renderPlaceholder : function () {
            var txt = this.options.placeholder || '';
            this.view.html(this.options.type === 'password' ? txt.replace(/./g, '\u2022') : txt);
        },
        _renderType : function () {
            this._renderPlaceholder();
        }
    });
})(jQuery);