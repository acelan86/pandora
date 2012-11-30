/**
 * 抽象上传类
 * @author  hushicai
 *
 * @link: http://lucifr.com/139225/sublime-text-2-tricks-and-tips/
 */
(function($) {
	$.widget('pandora.BaseUpload', $.pandora.BaseEditor, {
		options: {
			value: ''
		},
		_create: function() {
			$.pandora.BaseEditor.prototype._create.call(this);

			this._setOption('disabled', this.options.disabled);

			this.element.addClass('baseupload-editor');

			this.mask = $('<div class="baseupload-editor-mask">正在加载...</div>').appendTo(this.element);
		},
		_destroy : function () {
			this.mask.remove();
		},
		//获取地址
		_getValue: function() {
			return this.options.value;
		},
		/**
		 * 加载状态
		 * @return {undefined}
		 */
		showLoadingState: function() {
			this.element.addClass('baseupload-editor-busy');
		},

		hideLoadingState: function() {
			this.element.removeClass('baseupload-editor-busy');
		},

		/*data: {url: '', width: '', height: ''}*/
		getImgHtml: function(data, w, h) {
			//todo: 等比缩放
			var size = $.imageScale(data.width, data.height, w, h);

			return '<img alt="" src="'+ data.url +'" width="'+ size.width +'" height="'+ size.height +'" />';
		},

		/**
		 * 处理后端返回的状态码
		 * @param  {String} code json格式的字符串
		 * @param  {Object} fns  json格式的回调函数集合
		 */
		handleStatus: function(data, success, fail) {
			$.responseParser(data, success, fail);
		}
	});
})(jQuery);