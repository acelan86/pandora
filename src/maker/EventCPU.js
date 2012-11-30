/*!
 * 潘多拉（新浪功能广告平台）
 * author : acelan(xiaobin8[at]staff.sina.com.cn)
 */
$.extend(pandora, (function () {
    var ADBOX_INDEX = 'http://adbox.sina.com.cn/',
        ADBOX_CREATIVE = ADBOX_INDEX + '#/mycreative/add',
        AMP_REPOST_URL = 'http://amp.ad.sina.com.cn/client/idea/idea!callBack.action?';

    var clipBoard = null;

    $.extend($.ui.keyCode, {
        DEL : 46,
        A : 65,
        Z : 90,
        G : 71,
        I : 73,
        P : 80,
        C : 67,
        V : 86
    });

    var layout = (function () {
        var winW,
            winH,
            navH = $('#XNav').height(),
            mainH,
            sideW = 150,
            toolH,
            objH;

        console.debug(winH, navH, mainH, sideW);

        function initLayout() {
            winH = $('body').height();
            winW = $('body').width();
            mainH = winH - navH;
            toolH = Math.floor(mainH * .6);
            objH = mainH - toolH - 14;
        }

        function _resizeHandler() {
            initLayout();
            stage.resize(winW, mainH);
            sidebar.resize(mainH);
            toolPanel.resize(toolH);
            objPanel.resize(objH);
        }

        $(window).resize(_resizeHandler);

        initLayout();

        return {
            winW : winW,
            winH : winH,
            navH : navH,
            mainH : mainH,
            sideW : sideW,
            sideH : mainH,
            toolH : toolH,
            objH : objH
        };
    })();

    //_initText();

    var sidebar = $('#XSidebar').Sidebar({width : layout.sideW, height: layout.sideH}).getInstance(),
        stage = $('#XStage').Stage({previewId : 'XPreviewIframe', width : layout.winW, height: layout.mainH}).getInstance(),
        propPanel = $('#XProp').PropPanel({containment : $('#XMain')}).getInstance(),
        toolPanel = $('#XToolPanel').ToolPanel({height : layout.toolH}).getInstance(),
        objPanel = $('#XObjPanel').ObjPanel({height : layout.objH}).getInstance(),
        recorder = $('#XRecorder').Recorder().getInstance(),
        toolbar = $('#XToolbar'),
        configDialog = $('#XConfigDialog').formdialog({width : 450}).getInstance(),
        compareData;

    // function _initText() {
    //     if ($('body').width() < 1200) {
    //         $('body').addClass('hide-text');
    //     } else {
    //         $('body').removeClass('hide-text');
    //     }
    // }

    function _getBeforeValues(afterValues) {
        var beforeValues = {},
            before = compareData;
        if (before) {
            $.map(afterValues, function (afterValue, uid) {
                beforeValues[uid] = {};
                $.map(afterValue, function (v, k) {
                    if (before[uid]) {
                        beforeValues[uid][k] = before[uid][k].value;
                        before[uid][k].value = v;
                    }
                });
            });
        }
        return beforeValues;
    }

    var windowEvent = (function () {
        function onkeydown(e) {
            console.debug(e.which);
            //阻止浏览器回退键
            if (e.which === $.ui.keyCode.DEL) {
                stageEvent.removeSelected(e);
                e.preventDefault();
            } else if (e.which != $.ui.keyCode.BACKSPACE || (e.which == $.ui.keyCode.BACKSPACE && (e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA'))) {
                if((e.metaKey || e.ctrlKey) && e.shiftKey && (e.which === $.ui.keyCode.G)) { //取消组合 command + shift + G
                    stageEvent.ungroupSelected(e);
                } else if ((e.metaKey || e.ctrlKey) && (e.which === $.ui.keyCode.G)) {  //组合 command + G
                    e.preventDefault();
                    stageEvent.groupSelected(e);
                } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.which === $.ui.keyCode.A)) { //全选 command + A
                    e.preventDefault();
                    stageEvemt.unselectAll();
                } else if ((e.metaKey || e.ctrlKey) && (e.which === $.ui.keyCode.A)) { //取消全选command + shift + A
                    e.preventDefault();
                    stageEvent.selectAll();
                } else if ((e.metaKey || e.ctrlKey) && (e.which === $.ui.keyCode.I)) { //显示隐藏tag command + i
                    //e.preventDefault();
                    stage.toggleTag();
                } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.which === $.ui.keyCode.P)) { //预览，编辑 command + shift + p
                    stage.togglePreview();
                } else if ((e.metaKey || e.ctrlKey) && e.shiftkey && (e.which === $.ui.keyCode.Z)) {
                    e.preventDefault();
                    recorder.redo();
                } else if ((e.metaKey || e.ctrlKey) && (e.which === $.ui.keyCode.Z)) {
                    e.preventDefault();
                    recorder.restore();
                } else if ((e.metaKey || e.ctrlKey) && (e.which === $.ui.keyCode.C)) {
                    if (!(e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA')) {
                        e.preventDefault();
                        stageEvent.copySelected(e);
                    }
                } else if ((e.metaKey || e.ctrlKey) && (e.which === $.ui.keyCode.V)) {
                    if (!(e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA')) {
                        e.preventDefault();
                        stageEvent.pasteSelected(e);
                    }
                }
            } else {
                //删除
                stageEvent.removeSelected(e);
                e.preventDefault();
            }
        }
        $(document).keydown(onkeydown);
    })();

    /**
     * 舞台事件处理
     * @return {[type]} [description]
     */
    var stageEvent = (function () {
        function onselect(e, data) {
            //objPanel.unselectAll();
            compareData = data;
            objPanel._unselectAll();
            for (var uid in data) {
                objPanel.select(uid);
            }
            $('#DelBtn, #UngroupBtn').button('option', 'disabled', false);
            propPanel.fill(data);
        }
        function onmutiselect(e, data) {
            compareData = data;
            for (var uid in data) {
                objPanel.select(uid);
            }
            $('#GroupBtn, #UngroupBtn, #DelBtn').button('option', 'disabled', false);
            propPanel.clear();
        }
        function onunselectone(e, data) {
            objPanel.unselect(data.uid);
            propPanel.clear();
        }
        function onunselect(e, data) {
            $('input, textarea', propPanel.element).blur(); //fixbug 不太建议这种实现，侵入了。当鼠标点击舞台空白处是修改生效；
            //console.debug('xstage.unselect', $.json.stringify(data));
            $('#GroupBtn, #UngroupBtn, #DelBtn').button('option', 'disabled', true);
            objPanel._unselectAll();
            propPanel.clear();
        }
        function onchange(e, values) {
            //console.debug('xstage.change', $.json.stringify(values));
            propPanel.changeValue(values);
            e && recorder.record(
                {type : 'change', before : _getBeforeValues(values), after : values}
            );
        }
        function onadd(e, objs) {
            ////console.debug('add', objs);
            objs.sort(function (a, b) {
                return a.options.z - b.options.z;
            });
            $.each(objs, function (i, obj) {
                objPanel.add(obj.uid, obj.type);
            });
            e && recorder.record(
                {type : 'add', before : objs, after : objs}
            );
        }
        function onremove(e, objs) {
            $.each(objs, function (i, obj) {
                objPanel.remove(obj.uid);
            });
            propPanel.clear();
            e && recorder.record(
                {type : 'remove', before : objs, after : objs}
            );
        }
        function ongroup(e, objs) {
            $.each(objs, function (i, obj) {
                $.each(obj.objs, function (i, o) {
                    objPanel.remove(o.uid);
                });
                objPanel.add(obj.uid, 'Group');
            });
            propPanel.clear();
            e && recorder.record({
                type : 'group',
                before : objs,
                after : objs
            });
        }
        function onungroup(e, objs) {
            objs.sort(function (a, b) {
                return a.options.z - b.options.z;
            });
            $.each(objs, function (i, obj) {
                obj.objs.sort(function (a, b) {
                    return a.options.z - b.options.z;
                });
                //console.debug('ungroup', obj.objs);
                $.each(obj.objs, function (i, o) {
                    objPanel.add(o.uid, o.type);
                });
                objPanel.remove(obj.uid);
            });
            propPanel.clear();
            e && recorder.record({
                type : 'ungroup',
                before : objs,
                after : objs
            });
        }

        function onobjresizing(e, data) {
            pandora.tipBox.show('宽：' + data.w + ' 高：' + data.h + '，坐标：' + data.x + ',' + data.y, 1, 1000);
        }
        function onobjdragging(e, data) {
            pandora.tipBox.show('坐标：' + data.x + ',' + data.y, 1, 1000);
        }

        $('#XStage').bind({
            'stageselect' : onselect,
            'stagemutiselect' : onmutiselect,
            'stageunselect' : onunselect,
            'stageunselectone' : onunselectone,
            'stagechange' : onchange,
            'stageobjresizing' : onobjresizing,
            'stageobjdragging' : onobjdragging
        });

        return {
            selectAll : function () {
                onmutiselect(stage.selectAll());
            },
            unselectAll : function () {
                stage.unselectAll();
                propPanel.clear();
            },
            change : function (e, values) {
                stage.changeValue(values);
                onchange(e, values);
            },
            add : function (e, type, options) {
                onadd(e, stage.add.apply(stage, Array.prototype.slice.call(arguments, 1)));  
            },
            remove : function (e, objs) {
                onremove(e, stage.remove(objs));
            },
            removeSelected : function (e) {
                onremove(e, stage.removeSelected());
                $('#DelBtn').button('option', 'disabled', true);
                $('#GroupBtn, #UngroupBtn').button('option', 'disabled', true);
            },
            group : function (e, data) {
                ongroup(e, stage.group(data));
            },
            ungroup : function (e, data) {
                onungroup(e, stage.ungroup(data));
            },
            groupSelected : function (e) {
                var objs = stage.groupSelected();
                ongroup(e, objs);
                $.each(objs, function (i, obj) {
                    objPanel.select(obj.uid);
                    stage.select($('#' + obj.uid));
                });
            },
            ungroupSelected : function (e) {
                var objs = stage.ungroupSelected();
                onungroup(e, objs);
                $.each(objs, function (i, obj) {
                    $.each(obj.objs, function (i, o) {
                        stage.select($('#' + o.uid));
                        objPanel.select(o.uid);
                    });
                });
            },
            //想做再做，现在不想做
            copySelected : function (e) {
                function clearUID (objs) {
                    var i = 0, obj, coms;
                    while (obj = objs[i++]) {
                        if (obj.type === 'Group') {
                            coms = obj.options.coms;
                            coms && (coms.length > 0) && clearUID(coms);
                        }
                        delete obj.uid;
                    }
                }
                var objs = stage.getSelectedValue();
                clearUID(objs);
                clipBoard = objs;
            },
            pasteSelected : function (e) {
                console.debug(clipBoard);
                clipBoard && onadd(e, stage.add(clipBoard));
            }
        };
    })();

    /**
     * 记录面板事件处理
     * @return {[type]} [description]
     */
    (function () {
        function onredo(e, data) {
            var type = data.data.type,
                data = data.data.after;
            switch(type) {
                case 'add' : 
                    stageEvent.add(null, data);
                    break;
                case 'remove' : 
                    stageEvent.remove(null, data);
                    break;
                case 'change' : 
                    stageEvent.change(null, data);
                    break;
                case 'group' : 
                    stageEvent.group(null, data);
                    break;
                case 'ungroup' : 
                    stageEvent.ungroup(null, data);
                    break;
                default : break;
            }
            compareData = stage._getSelectedProp();
        }
        function onrestore(e, data) {
            var type = data.data.type;
                data = data.data.before;
            //console.debug('restore', $.json.stringify(data));
            switch(type) {
                case 'add' : 
                    stageEvent.remove(null, data);
                    break;
                case 'remove' :
                    stageEvent.add(null, data);
                    break;
                case 'change' : 
                    stageEvent.change(null, data);
                    break;
                case 'ungroup' : 
                    stageEvent.group(null, data);
                    break;
                case 'group' : 
                    stageEvent.ungroup(null, data);
                    break;
                default : break;
            }
            compareData = stage._getSelectedProp();
        }

        $('#XRecorder').bind({
            'recorderredo' : onredo,
            'recorderrestore' : onrestore
        });
    })();

    /**
     * 属性面板事件处理
     * @return {[type]} [description]
     */
    (function () {
        function onchange(e, values) {
            for (var uid in values) {
                for (var k in values[uid]) {
                    values[uid][k] = values[uid][k].value
                };
            };
            console.debug(values);
            stage.changeValue(values);

            recorder.record(
                {type : 'change', before : _getBeforeValues(values), after : values}
            );
        }
        $('#XProp').bind({
            'proppanelchange' : onchange
        });
    })();

    /**
     * 层面板事件处理
     * @return {[type]} [description]
     */
    (function () {
        function onsort(e, data) {
            var values = stage.reIndex(data.order);
            recorder.record(
                {type : 'change', before : _getBeforeValues(values), after : values}
            );
        }
        function onunselect() {
            stage.unselectAll();
            propPanel.clear();
        }
        function onselect(e, uids) {
            for (var uid in uids) {
                propPanel.fill(stage.select($('#' + uid)));
            };
        }

        $('#XObjPanel').bind({
            'objpanelsort' : onsort,
            'objpanelselect' : onselect,
            'objpanelunselect' : onunselect
        });
    })();

    /**
     * 配置面板事件处理
     */
    (function () {

        $('#XConfigDialog').bind({
            'formdialogok' : function (e, data) {
                pandora.ad.width = data.canvasWidth;
                pandora.ad.height = data.canvasHeight;
                stage.resetCanvasSize(data.canvasWidth, data.canvasHeight);
                stage.resetCanvasBorder(data.canvasBorder, data.canvasBordercolor);
                stage.resetCanvasBgcolor(data.canvasBgcolor);

            },
            'formdialogopen' : function (e, data) {
                var $this = $(this),
                    w = $('.canvas-w', $this),
                    h = $('.canvas-h', $this),
                    bgcolor = $('.canvas-bgcolor', $this),
                    border = $('.canvas-border', $this),
                    bordercolor = $('.canvas-bordercolor', $this),
                    size = $('.canvas-size', $this),
                    hbgcolor = $('.canvas-bgcolor-h', $this).val(stage.options.canvasBgcolor),
                    hborder = $('.canvas-border-h', $this).val(stage.options.canvasBorder),
                    hbordercolor = $('.canvas-bordercolor-h', $this).val(stage.options.canvasBordercolor);

                w.spinner().val(stage.options.canvasWidth);
                h.spinner().val(stage.options.canvasHeight);
                bgcolor.ColorEditor({
                    value : stage.options.canvasBgcolor,
                    change : function (e, data) {
                        hbgcolor.val(data.value);
                    }
                });
                border.SelectEditor({
                    value : parseInt(stage.options.canvasBorder),
                    width : 60,
                    datasource : [
                        {name : '无边框', value : 0},
                        {name : '有边框', value : 1}
                    ],
                    change : function (e, data) {
                        hborder.val(data.value);
                    }
                });
                bordercolor.ColorEditor({
                    value : stage.options.canvasBordercolor,
                    change : function (e, data) {
                        hbordercolor.val(data.value);
                    }
                });
                size.RadioEditor({
                    datasource : [
                        '300x250', '950x90', '300x500', '250x230', '780x90'
                    ],
                    format : function (i, text) {
                        var size = text.split('x'),
                            t = $.centerImage(
                                parseInt(size[0], 10),
                                parseInt(size[1], 10),
                                50,
                                40
                            );
                        return '<div><div style="background:#fff;border:1px solid #222;margin:' + t.hp + 'px ' + t.wp + 'px;width:' + t.w + 'px;height:' + t.h + 'px;"></div></div><div style="padding-top:4px;">' + text + '</div>';
                    },
                    change : function (e, data) {
                        var size = data.value.split('x');
                        w.val(parseInt(size[0], 10));
                        h.val(parseInt(size[1], 10));
                    }
                });
            }
        });
    })();

    (function () {
        $('#XToolPanel').bind({
            'toolpanelselect' : function (e, type) {
                stageEvent.add(e, type);
                // $('body').addClass('x-stage-adding').css('cursor', 'crosshair').data('addtype', type);
                // $('#XStage').one('mousedown', function (e) {
                //     var offset = stage.canvas.offset(),
                //         x = e.pageX - offset.left,
                //         y = e.pageY - offset.top,
                //         type = $('body').data('addtype');
                //     $('body').removeClass('x-stage-adding').css('cursor', 'default').removeData('addtype');
                //     console.debug(e);
                //     stageEvent.add(e, {type : type, options : {x : x, y : y}});
                // });
            }
        });
    })();

    /**
     * 通用工具栏事件处理
     * @return {[type]} [description]
     */
    (function () {
        $('#XToolbar')
            .children().first()
            .next().buttonset()
            .next().buttonset();

        $('#FullscreenBtn').click(function (e) {
            if (!$.toggleFullscreen()) {
                pandora.tipBox.show('您的浏览器不支持全屏接口，请使用F12或更换其他浏览器，如谷歌浏览器等', 1);
            }
        });
        $('#GroupBtn').button('option', 'disabled', true).click(function (e) {
            stageEvent.groupSelected(e);
        });
        $('#UngroupBtn').button('option', 'disabled', true).click(function (e) {
            stageEvent.ungroupSelected(e);
        });
        $('#ConfigBtn').click(function (e) {
            configDialog.open();
        });
        $('#DelBtn').button('option', 'disabled', true).click(function (e) {
            stageEvent.removeSelected(e);
        });

        $('#TagBtn').button().click(function (e) {
            stage.toggleTag();
        });


        $('#PreviewBtn').button().click(function (e) {
            if (!$('body').hasClass('preview')) {
                stage.disable();
                var $form = $('#XPreviewForm form'),
                    data = stage.getValue();

                //console.debug($.json.stringify(data));

                $('#XPreviewFormInput').val($.json.stringify(data));
                $form.submit();
            }
        });

        $('#EditBtn').button().click(function (e) {
            if ($('body').hasClass('preview')) {
                stage.enable();
                stage.resetPreview();
                $('body').removeClass('preview');
            }
        });

        $('#SaveBtn').button().click(function (e) {
            var $btn = $(this);
            $.extend(pandora.ad, {
                tsid : (function (w, h) {
                    return {
                        '250x230' : 1,
                        '950x90' : 2,
                        '300x250' : 3,
                        '780x90' : 4,
                        '300x500' : 5
                    }[w + 'x' + h] || 6;
                })(pandora.ad.width, pandora.ad.height),
                ttid : (function (w, h) {
                    return {
                        '250x230' : 1,
                        '950x90' : 2,
                        '300x250' : 3,
                        '780x90' : 4,
                        '300x500' : 5
                    }[w + 'x' + h] || 6;
                })(pandora.ad.width, pandora.ad.height)
            });

            pandora.tipBox.show('正在为您生成并保存广告，请稍候...', 1);
            $btn.button('option', 'disabled', true);
            $.ajax('/ma/save', {
                type : 'POST',
                dataType : 'json',
                data : {
                    templete_category_id : pandora.ad.tcid,
                    templete_standard_id : pandora.ad.tsid, 
                    templete_type_id : pandora.ad.ttid, 
                    width : pandora.ad.width,
                    height : pandora.ad.height,
                    content : $.json.stringify(stage.getValue())
                },
                success : function (data) {
                    $btn.button('option', 'disabled', false);
                    $.responseParser(data, function (data) {
                        codePanel.open(data.html, data.tid, data.url);
                    });
                }
            });
        });

        $('#XPreviewForm form').submit(function () {
            $('body').toggleClass('preview');
        });


        $('#XToolbar button').tooltip({
            hide : 10,
            items : "[data-tip]",
            content : function () {
                return '<div><div class="ui-tooltip-arrow"><div class="ui-tooltip-arrow-inner">\u25C6</div></div>' + $(this).attr('data-tip') + '</div>';
            },
            position : {
                my: "center top+5",
                at: "center bottom"
            }
        });
    })();


    var codePanel = (function () {
        var textarea = $('#XCodeDialog textarea'),
            tidInput = $('#XCodeDialogTid'),
            urlInput = $('#XCodeDialogUrl'),
            copybtn
            dialog = $('#XCodeDialog').dialog({
                autoOpen : false,
                modal : true,
                close : false,
                width : 500,
                resizable : false,
                closeButton : false,
                buttons : [
                    { 
                        'text' : '复制代码',
                        'id' : 'XCodeDialogCopyButton'
                    },
                    {
                        'text' : '返回',
                        'click' : function () {
                            var ex_t = $.getPar('ex_t');
                            $(this).dialog('close');
                            if (ex_t) {
                                window.location.href = AMP_REPOST_URL + 't=' + ex_t + '&adboxId=' + tidInput.val();
                            } else {
                                window.location.href = ADBOX_CREATIVE;
                            }     
                        },
                        'class' : 'ui-state-em'
                    }
                ]
            });

        return {
            open : function (code, tid, url) {
                textarea.val(code);
                tidInput.val(tid);
                urlInput.val(url);
                $('#XCodeDialogCopyButton').copybutton({
                    content : textarea,
                    width : 60,
                    height : 40,
                    copy : function () {
                        pandora.tipBox.show('复制成功');
                    }
                });
                dialog.dialog('open');
            }
        }
    })();


    /**
     * 元件添加面板
     * @return {[type]} [description]
     */
    // (function () {
    //     $('#XSidebar').bind({
    //         'sidebartoggle' : function (e, data) {
    //             $('body').toggleClass('left-open');
    //         } 
    //     });
    // })();

    var loginBox = $('#XLoginInfo').LoginBox().getInstance();

    var tipBox = (function () {
        var timer = null,
            tip = $('#XTip'),
            DEFAULT_DELAY = 2000;
        return {
            show : function (msg, type, delay) {
                type = ['success', 'alert', 'error'][type || 0];
                delay = delay || DEFAULT_DELAY;
                tip.html(msg);
                tip.show();
                tip.attr('class', 'x-tip x-tip-' + type);
                //console.debug($(window).width(), tip.width());
                tip.css({
                    left : ($(window).width() - tip.width() - 40) / 2
                });
                timer && clearTimeout(timer);
                delay !== -1 && (timer = setTimeout(tipBox.hide, delay));
            },
            hide : function () {
                timer && clearTimeout(timer);
                tip.fadeOut();
            }
        };
    })();


    try {
        document.execCommand("BackgroundImageCache", false, true);
    } catch (e) {

    }

    return {
        tipBox : tipBox,
        configDialog : configDialog,
        loginBox : loginBox,
        open : function (ad) {
            var loading = pandora.loading;
            pandora.ad = ad = $.extend({
                width : 300,
                height : 250,
                ttid : 6,
                tcid : 14,
                tsid : 6
            }, ad || {});
 
            stage.resetCanvasSize(ad.width, ad.height);
            stage.resetCanvasBorder(ad.border, ad.borderColor);
            stage.resetCanvasBgcolor(ad.bgcolor);

            if (ad.objs) {
                if (ad.wb) {
                    $.pandora.Wbcom.getInfoByNick(ad.wb, function (data) {
                        $.pandora.Wbcom.changDefaultUser(data);
                        stageEvent.add(null, ad.objs);
                        loading.hide();
                    }, function (data) {
                        stageEvent.add(null, ad.objs);
                        loading.hide();
                    });
                } else {
                    stageEvent.add(null, ad.objs);
                    loading.hide();
                }
            } else {
                loading.hide();
            }
        }
    };
})());