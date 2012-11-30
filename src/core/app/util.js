var adbox = adbox || {};

adbox.util = {};

/**
 * 分析状态码
 * @param  {String | Object} code    json数据
 * @param  {Object} fns     回调函数map
 * @param  {Object} context 回调函数的上下文
 */
adbox.util.ajaxStatus = function(code, fns, context) {
	var json,
		status,
		toString = Object.prototype.toString;

	fns = fns || {};
	context = context || window;

	if(toString.call(code) === '[object String]') {
		try {
			json = eval('('+ code +')');
		} catch(ex) {
			json = null;
		}
	} else if(toString.call(code) === '[object Object]') {
		json = code;
	}

	if(!json) {
		return false;
	}

	status = json.status;
	//成功
	fns['0'] = fns['0'] || function(j) {

	};
	//系统异常
	fns['1'] = fns['1'] || function(j) {
		alert('system error!');
	};
	//业务异常
	fns['2'] = fns['2'] || function(j) {

	};
	//某项功能无权限
	fns['126'] = fns['126'] || function(j) {

	};
	//未登录/登录超时
	fns['127'] = fns['127'] || function(j) {
		//显示登录框
	};

	return fns[status].call(context, json);
};