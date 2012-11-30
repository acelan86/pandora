(function($) {
    var DEFAULT_TEXT = '选择文件...';
    var tpl = '<table><tbody>'
         + '<tr>'
            + '<td>'
                + '<form enctype="multipart/form-data" target="localUploadTemp" method="post">'
                    + '<div style="position:relative;display:inline-block;*display:inline;*zoom:1;"><button class="ui-button ui-state-default choosefilebtn" type="button">' + DEFAULT_TEXT + '</button><input class="ui-input file" type="file" name="filename" style="width:60px;opacity:0;*filter:Alpha(opacity=0);position:absolute;left:0px;top:0px;"/></div>'
                    + '<button type="submit">上传</button>'
                + '</form>'
            + '</td>'
        + '</tbody></table>',
        UPLOAD_URL_MAP = [
            '',
            '/pic/upload',
            '/flash/upload',
            '/vod/upload'
        ];

    var iframe = $('<iframe name="localUploadTemp" style="display:none;" src="about:blank"></iframe>')
        .load(function (e) {
            //@notice: src:blank
            var $iframe = $(this),
                iframeDoc = $iframe.contents(),
                uploader = $iframe.data('uploader'),
                code = iframeDoc.text();
            if (uploader) {
                if (code.indexOf('<code>') !== -1) {
                    var match = code.match('<code>(.*)</code>');
                    code = (match && match[1] ? match[1] : '');
                }
                if (code) {
                    $.responseParser($.json.parse(code), function (data) {
                        //me.hideLoadingState();
                        uploader.doneUpload(uploader.options.value = {
                            url : data.url,
                            width : data.width || 300,
                            height : data.height || 250
                        });
                    });
                }
                uploader.hideLoadingState();
            }
        });

    $('body').append(iframe);

    $.widget('pandora.LocalUpload', $.pandora.BaseUpload, {
        options: {
            value: '',
            mtype : 1
        },
        _create: function() {
            var me = this,
                options = this.options;

            $.pandora.BaseUpload.prototype._create.call(this);



            this.element
                .append($(tpl))
                .find('form')
                .attr('action', options.action || UPLOAD_URL_MAP[options.mtype]);
            
            //console.debug(this.element.find('iframe'));
            // this.element
            //     .find('iframe').load($.proxy(this._iframeloadHandler, this));

            this.element
                .find('.file').change(function (e) {
                    me.element.find('.choosefilebtn').html($(this).val().substring(0, 8) + '...');
                });

            this.element
                .find('button[type="submit"]').button().click(function(e) {
                    me.showLoadingState();
                    iframe.data('uploader', me);
                });
        },

        _destroy : function () {
            $('iframe', this.element).unbind('load', this._iframeloadHandler);
            $('file', this.element).unbind();
            this.element.find('button[type="submit"]').unbind().remove();
            $.pandora.BaseUpload.prototype._destroy.call(this);
        },

        _setOption: function(k, v) {
            
        },

        
        doneUpload: function(data) {
            var me = this;


            pandora.tipBox.show('上传成功');
            this.element.find('.choosefilebtn').html(DEFAULT_TEXT);

            this._trigger('upload', null, {value : data});

            //预览图片
            //previewEl.html('').append($(this.getImgHtml(data, previewEl.width() - 10, previewEl.height() - 10)));

            me.setValue(data);
        },

        _formatValue: function(v) {
            return v;
        },

        _setValue: function(v) {
            //无法设置input[type="file"]的值，不能直接调用setValue，只能被动的调用
            //忽略控制台直接调用setValue的情况
            this.options.value = this._formatValue(v);
        }
    });
})(jQuery);