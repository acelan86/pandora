/**
 * 元件面板
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
(function ($) {
    var ITEM_FILTER = 'obj-panel-item',
        HEADER_HEIGHT = 30;
        ITEM_SELECTED_FILTER = ITEM_FILTER + '-selected',
        ICON_MAP = {
            'Com' : 'icon-star-empty',
            'Txt' : 'icon-text',
            'Img' : 'icon-image',
            'Btn' : 'icon-button',
            'Imgslider' : 'icon-slider',
            'Tabslider' : 'icon-tabslider',
            'Formlist' : 'icon-form',
            'Input' : 'icon-input',
            'Radio' : 'icon-radio',
            'Checkbox' : 'icon-checkbox',
            'Select' : 'icon-select',
            'Region' : 'icon-region',
            'Wbnick' : 'icon-wbnick',
            'Wbavatar' : 'icon-wbavatar',
            'Wbfocus' : 'icon-wbfocus',
            'Wbrelation' : 'icon-wbrelation',
            'Group' : 'icon-group',
            'Wbrepos' : 'icon-wbrepos',
            'Video' : 'icon-video',
            'Fla' : 'icon-flash',
            'Qrcode' : 'icon-qrcode',
            'Retangle' : 'icon-retangle',
            'Useravatar' : 'icon-useravatar',
            'Usernick' : 'icon-usernick',
            'Wbshare' : 'icon-wbshare'
        };

    $.widget('pandora.ObjPanel', {
        _create : function () {
            var options = this.options;

            this.widgetEventPrefix = 'objpanel';

            this.element
                .data('widgetName', this.widgetFullName)
                .addClass('obj-panel')
                .css('height', options.height)
                .append($('<div class="ui-widget-header">元件顺序</div>'));

            this.body = $('<div class="obj-panel-body">')
                .css('height', options.height - HEADER_HEIGHT)
                .appendTo(this.element)
                .sortable({
                    placeholder: "ui-state-highlight",
                    axis : 'y',
                    stop : $.proxy(this._sortHandler, this)
                });

            this._on(function () {
                var h = {};
                h['click .' + ITEM_FILTER] = function (e) {
                    !$(e.currentTarget).hasClass(ITEM_SELECTED_FILTER) && this._select(e.currentTarget, e);
                    e.stopPropagation();
                };
                h['hover .' + ITEM_FILTER] = function (e) {
                    $(e.currentTarget).toggleClass('ui-state-hover');
                };
                h['click'] = function (e) {
                    e.stopPropagation();
                };
                return h;
            }());
        },
        resize : function (h) {
            this.element.css('height', h);
            this.body.css('height', h - HEADER_HEIGHT);
        },
        _destroy : function () {
            this.element.removeClass('obj-panel').removeData();
        },
        _sortHandler : function (e, ui) {
            var r = [];
            $('.' + ITEM_FILTER, this.element).each(function (i, item) {
                r.push(item.id.replace('ObjItem', ''));
            });
            this._trigger('sort', e, {
                order : r.reverse()
            });
        },
        _genId : function (uid) {
            return uid + 'ObjItem';
        },
        _select : function (el, e) {
            this.unselectAll();
            $(el).addClass(ITEM_SELECTED_FILTER + ' ui-state-selected');
            this._trigger('select', e, this._getSelectedId());
        },
        _getSelectedId : function () {
            var uids = {};
            this._getSelected().each(function (i, item) {
                uids[item.id.replace('ObjItem', '')] = 1;
            });
            return uids;
        },
        _getSelected : function () {
            return $('.' + ITEM_SELECTED_FILTER, this.body);
        },
        add : function (uid, type) {
            this.body.prepend(
                $('<li id="' + this._genId(uid) + '" class="' + ITEM_FILTER + '">').html('<i class="icon ' + ICON_MAP[type] + '"></i><span> ' + $('#' + uid).attr('data-tag') + '</span>')
            );
        },
        remove : function (uid) {
            $('#' + this._genId(uid)).remove();
        },
        select : function (uid) {
            $('#' + this._genId(uid)).addClass(ITEM_SELECTED_FILTER + ' ui-state-selected');
        },
        unselect : function (uid) {
            $('#' + this._genId(uid)).removeClass(ITEM_SELECTED_FILTER + ' ui-state-selected');
        },
        _unselectAll : function () {
            $('.' + ITEM_FILTER, this.body).each(function (i, item) {
                $(item).removeClass(ITEM_SELECTED_FILTER + ' ui-state-selected');
            });
        },
        unselectAll : function () {
            $('.' + ITEM_FILTER, this.body).each(function (i, item) {
                $(item).removeClass(ITEM_SELECTED_FILTER + ' ui-state-selected');
            });
            this._trigger('unselect', null);
        }
    });
})(jQuery);