(function ($) {
    $.widget('pandora.Qrcode', $.pandora.Img, {
        prop : {
            src : {
                type : 'picture',
                label : '路径',
                mtype : 1,
                source : [
                    {
                        'type': 'LocalUpload',
                        'label': '本地',
                        'options': {}
                    },
                    {
                        'type': 'UrlUpload',
                        'label': 'url',
                        'options': {}
                    },
                    {
                        'type' : 'QrcodeGenerator',
                        'label' : 'url生成',
                        'options' : {
                            type : 2
                        }
                    },
                    {
                        'type' : 'QrcodeGenerator',
                        'label' : '电话生成',
                        'options' : {
                            type : 1
                        }
                    }
                ]
            },
            color : {
                level : 'base'
            },
            font : {
                level : 'base'
            },
            bgcolor : {
                level : 'base'
            }
        },
        options : {
            w : 0,
            h : 0,
            src : {
                url : 'http://sinastorage.com/sandbox/qr/2497.png',
                width : 60,
                height : 60
            }
        },
        _create : function () {
            $.pandora.Img.prototype._create.call(this, this.options);
        }
    });
})(jQuery);