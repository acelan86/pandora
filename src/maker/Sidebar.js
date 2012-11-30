(function ($) {
    var BASE_INDEX = 3000;
    $.widget('pandora.Sidebar', {
        _create : function () {
            var me = this,
                options = this.options;


            options.height = options.height || this.sidebar.parent().height;

            this.widgetEventPrefix = 'sidebar';

            this.isShow = 1;

            this.element.data('widgetName', this.widgetFullName).addClass('sidebar-content');

            this.sidebar = $('<div/>')
                .addClass('sidebar')
                .css({
                    'z-index' : BASE_INDEX,
                    'height' : options.height
                })
                .appendTo(this.element.parent())
                .disableSelection();

            this.toggleBtn = $('<div class="toolpanel-toggle-split" />')
                .appendTo(this.sidebar)
                .html('<div class="toolpanel-toggle-button"><div class="toolpanel-right-arrow">\u25C6</div></div><div class="toolpanel-toggle-button-mask"></div>');

            this.view = this.element
                .css('width', options.width)
                .appendTo(this.sidebar)
                .appendTo(this.sidebar);


            //以下会造成ie下button抖动
            //this._hoverable(this.toggleBtn);

            //$(window).resize($.proxy(this._resizeHandler, this));


            this.toggleBtn.click($.proxy(this._toggleHandler, this));
        },
        _resizeHandler : function () {
            this.resize(this.sidebar.parent().height());
        },
        resize : function (h) {
            this.sidebar.height(this.options.height = h);
        },
        _toggleHandler : function (e) {
            //this.view.toggle();
            this.element.parent().toggleClass('sidebar-close');
        },
        _destroy : function () {
            this.element.removeClass().removeData();
            this.toggleBtn.unbind('click', this._toggleHandler);
        }
    });
})(jQuery);