(function ($) {
    var WB_ROOT = 'http://weibo.com',
        defaultUser = {
            "id":2738910765,
            "idstr":"2738910765",
            "screen_name":"新浪功能广告平台",
            "name":"新浪功能广告平台",
            "province":"11",
            "city":"8",
            "location":"北京 海淀区",
            "description":"暂无",
            "url":"",
            "profile_image_url":"http://tp2.sinaimg.cn/2738910765/50/5632534588/1",
            "profile_url":"u/2738910765",
            "domain":"",
            "weihao":"",
            "gender":"m",
            "followers_count":33,
            "friends_count":42,
            "statuses_count":16,
            "favourites_count":0,
            "created_at":"Fri Apr 27 14:22:41 +0800 2012",
            "following":true,
            "allow_all_act_msg":false,
            "geo_enabled":true,
            "verified":true,
            "verified_type":2,
            "remark":"",
            "status":{
                "created_at":"Tue May 22 17:11:21 +0800 2012",
                "id":3448533338240896,
                "mid":"3448533338240896",
                "idstr":"3448533338240896",
                "text":"#互动营销#“新浪正在推动传统门户展示广告巨变，让展示广告逐步趋向功能化，成为人与广告精准互动、人与企业品牌精准互动的重要接触界面。#功能广告平台#实现了广告投放的“标准”、“简单”，并最大程度体现了“广告社交化”， 实现了前置营销核心，缩短营销途径，提高了广告到达率。",
                "source":"<a href=\"http://e.weibo.com\" rel=\"nofollow\">专业版微博</a>",
                "favorited":false,
                "truncated":false,
                "in_reply_to_status_id":"",
                "in_reply_to_user_id":"",
                "in_reply_to_screen_name":"",
                "geo":null,
                "reposts_count":0,
                "comments_count":0,
                "attitudes_count":0,
                "mlevel":0,
                "visible":{
                    "type":0,
                    "list_id":0
                }
            },
            "allow_all_comment":true,
            "avatar_large":"http://tp2.sinaimg.cn/2738910765/180/5632534588/1",
            "verified_reason":"新浪功能广告平台官方微博",
            "follow_me":true,
            "online_status":0,
            "bi_followers_count":7,
            "lang":"zh-cn"
        };

    $.widget('pandora.Wbcom', $.pandora.Com, {
        prop : {
            nick : {
                type : 'string',
                label : '微博昵称'
            },
            wid : {
                label : '微博id'
            },
            verified : {
                label : '用户认证'
            },
            verified_type : {
                label : '认证类型'
            },
            pic : {
                label : '头像'
            },
            domain : {
                label : '用户首页地址'
            }
        },
        options : {
            wid : '2738910765',
            nick : '新浪功能广告平台',
            resizable : false
        },
        _create : function () {
            var me = this,
                options = this.options;

            this._initInfo(defaultUser);

            $.pandora.Com.prototype._create.call(this, this.options);
            this.element.addClass('com-wbcom');
        },
        _setValue : function (k, v) {
            var me = this;
            if (k === 'nick') {
                this._getInfoByNick(v, function (info) {
                    $.pandora.Com.prototype._setValue.call(me, k, v);
                });
            } else {
                $.pandora.Com.prototype._setValue.call(me, k, v);
            }
        },
        _initInfo : function (info) {
            this.options.nick = info.screen_name;
            this.options.wid = info.id;
            this.options.verified = info.verified;
            this.options.verified_type = info.verified_type;
            this.options.domain = info.domain || info.profile_url;
        },
        _getInfoByNick : function (nick, callback, fail) {
            var me = this;
            $.pandora.Wbcom.getInfoByNick(nick, function (data) {
                $.pandora.Wbcom.user = defaultUser = data;
                me._initInfo(data);
                callback && callback(data);
            }, function (data) {
                me._initInfo(data);
                fail && fail(data);
            });
        }
    });

    $.pandora.Wbcom.getInfoByNick  = function (nick, callback, fail) {
        //获取信息
        $.ajax("/wapi/getuser", {
            cache : false,
            data : {
                username : nick
            },
            dataType : 'script',
            success : function () {
                if (getuser && !getuser.data.error) {
                    callback && callback(getuser.data);
                } else {
                    pandora.tipBox.show((getuser && getuser.data.error) || '获取微博信息失败，请重试。', 2);
                    fail && fail(defaultUser);
                }
            }
        });
    };

    $.pandora.Wbcom.getInfoByWid = function (wid, callback, fail) {
        //获取信息
        $.ajax("/wapi/getinfo", {
            cache : false,
            data : {
                wid : wid
            },
            dataType : 'script',
            success : function () {
                if (getinfo && !getinfo.data.error) {
                    callback && callback(getinfo.data);
                } else {
                    pandora.tipBox.show((getinfo && getinfo.data.error) || '获取微博信息失败，请重试。', 2);
                    fail && fail(defaultUser);
                }
            }
        });
    };

    $.pandora.Wbcom.user = defaultUser;

    $.pandora.Wbcom.genUserUrl = function (info) {
        return WB_ROOT + '/' + (info.domain || info.profile_url);
    };
    $.pandora.Wbcom.genAvatarHTML = function (info, w, h) {
        return '<span class="com-wbnick-url" title="' + $.pandora.Wbcom.genUserUrl(info) + '"><img class="com-wbavatar-img" src="' + (info.avatar_large || info.profile_image_url) + '" alt="' + info.screen_name + '" ' + ((w && h) ? 'style="width:' + w + 'px;height:' + h + 'px;"' : '')+ '/></span>';
    };
    $.pandora.Wbcom.genVerifiedHTML = function (info) {
        var v = info.verified ? ['approve_yellow', 'approve_blue', 'approve_blue', 'approve_blue', 'approve_blue', 'approve_blue', 'approve_blue', 'approve_blue'][info.verified_type] : ''; 
        return v ? '<img src="' + '/assets/images/blank.gif" alt="新浪个人认证" class="com-wbnick-v ' + v + '" />' : '';  
    };
    $.pandora.Wbcom.genNickHTML = function (info) {
        return [
            '<span class="com-wbnick-txt" title="' + $.pandora.Wbcom.genUserUrl(info) + '">' + info.screen_name +'</span>',
            $.pandora.Wbcom.genVerifiedHTML(info)
        ].join('');
    };
    $.pandora.Wbcom.genRelationHTML = function (template, info, chain) {
        return '';
    };

    $.pandora.Wbcom.getChainById = function (id, callback, fail) {
        $.ajax('/wapi/getchain', {
            cache : false,
            data : {
                wid : id
            },
            dataType : 'script',
            success : function () {
                if (getchain && !getchain.data.error) {
                    callback && callback(getchain.data);
                } else {
                    pandora.tipBox.show((getchain && getchain.data.error) || '获取微博信息失败，请重试。', 2);
                    fail && fail();
                }
            }
        });
    };
    $.pandora.Wbcom.changDefaultUser = function (data) {
        $.pandora.Wbcom.user = defaultUser = data;
    };
})(jQuery);