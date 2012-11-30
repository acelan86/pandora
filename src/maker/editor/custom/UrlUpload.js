(function($) {
  var tpl = '<table><tbody>'
      + '<tr><td><input class="ui-input" type="text" style="width:45%"/><button>上传</button></td></tr>'
    + '</tbody></table>',
        FETCH_URL_MAP = [
            '',
            '/pic/fetch',
            '/flash/fetch',
            '/vod/fetch'
        ];;
  
  $.widget('pandora.UrlUpload', $.pandora.BaseUpload, {
    options: {
        value : '',
        mtype : 1
    },

    _create: function() {
      var me = this;

      $.pandora.BaseUpload.prototype._create.call(me);
      
      this.textElement = $(tpl).appendTo(this.element)
        .find('input[type="text"]').val(this.options.value);

      this.element.find('button').button().click(function(e) {
        var value = me.element.find('input[type="text"]').val();
        me.showLoadingState();
        me.fetch(value);
      });
    },
    _destroy : function () {
      this.textElement.remove();
      this.element.find('button').unbind().remove();
    },
    //桥接，方便控制台单测
    fetch: function(url) {
        var me = this;

        me.showLoadingState();

        //不需要encodeURIComponent
        $.ajax(this.options.fetchUrl || FETCH_URL_MAP[this.options.mtype], {
            data : {url: url},
            dataType : 'json',
            type : 'POST',
            success : function(data) {
                me.hideLoadingState();
                $.responseParser(data, function (data) {
                    pandora.tipBox.show('URL获取成功。');
                    me._trigger('upload', null, {value : me.options.value = data});
                });
            }
        });
    },
    //@todo: disabled处理
    _setOption: function(k, v) {

    },

    _formatValue: function(v) {
      return v;
    },

    _setValue: function(v) {
      //本组件的setValue并非输入框中的value，只有上传成功后才会change，否则无效
      this.textElement.val(this._formatValue(v));
      this.fetch(v);

      //不在这里出发change事件
      return false;
    }
  });
})(jQuery);