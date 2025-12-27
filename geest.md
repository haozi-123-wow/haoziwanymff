服务端部署：
二次校验接口
当用户在前端界面通过验证码后，会产生一批与验证码相关的参数，用户的业务请求带上这些参数，后台业务接口再将这些参数上传到极验二次校验接口，确认该用户本次验证的有效性。

接口信息	说明
接口地址	http://gcaptcha4.geetest.com/validate
协议支持	http/https
请求方法	GET/POST
请求格式	application/x-www-form-urlencoded
返回类型	json
请求参数
参数名	类型	说明
lot_number	string	验证流水号
captcha_output	string	验证输出信息
pass_token	string	验证通过标识
gen_time	string	验证通过时间戳
captcha_id	string	验证 id
sign_token	string	验证签名
响应参数
一般只需要处理校验成功和校验失败时的返回，异常返回一般只会出现在客户接入时没有以正确的方式进行请求。
1.校验成功返回示例

{
    "status": "success", // 请求状态
    "result": "success", // 二次校验结果
    "reason": "", // 校验结果说明
    "captcha_args": { // 验证输出参数
        "used_type": "slide", 
        "user_ip": "127.0.0.1", 
        "lot_number": "4dc3cfc2cdff448cad8d13107198d473", 
        "scene": "反爬虫", 
        "referer": "http://127.0.0.1:8077/"
        // ...
    }
}
2.校验失败返回示例

{
    "status": "success", // 请求状态
    "result": "fail", // 二次校验结果
    "reason": "pass_token expire", // 校验结果说明
    "captcha_args": { // 验证输出参数
        ...
    }
}
3.请求异常返回示例

{
    "status": "error", // 请求状态
    "code": "-50005", // 错误码
    "msg": "illegal gen_time", // 错误信息
    "desc": { // 错误描述
        "type": "defined error"
    }
}
接入代码示例
def post(self):
    # 1.初始化极验参数信息
    captcha_id = '647f5ed2ed8acb4be36784e01556bb71'
    captcha_key = 'b09a7aafbfd83f73b35a9b530d0337bf'
    api_server = 'http://gcaptcha4.geetest.com'

    # 2.获取用户验证后前端传过来的验证参数
    lot_number = self.get_argument('lot_number', '')
    captcha_output = self.get_argument('captcha_output', '')
    pass_token = self.get_argument('pass_token', '')
    gen_time = self.get_argument('gen_time', '')

    # 3.生成签名
    # 生成签名使用标准的hmac算法，使用用户当前完成验证的流水号lot_number作为原始消息message，使用客户验证私钥作为key
    # 采用sha256散列算法将message和key进行单向散列生成最终的签名
    lotnumber_bytes = lot_number.encode()
    prikey_bytes = captcha_key.encode()
    sign_token = hmac.new(prikey_bytes, lotnumber_bytes, digestmod='SHA256').hexdigest()

    # 4.上传校验参数到极验二次验证接口, 校验用户验证状态
    query = {
        "lot_number": lot_number,
        "captcha_output": captcha_output,
        "pass_token": pass_token,
        "gen_time": gen_time,
        "sign_token": sign_token,
    }
    # captcha_id 参数建议放在 url 后面, 方便请求异常时可以在日志中根据id快速定位到异常请求
    url = api_server + '/validate' + '?captcha_id={}'.format(captcha_id)
    # 注意处理接口异常情况，当请求极验二次验证接口异常或响应状态非200时做出相应异常处理
    # 保证不会因为接口请求超时或服务未响应而阻碍业务流程
    try:
        res = requests.post(url, query)
        assert res.status_code == 200
        gt_msg = json.loads(res.text)
    except Exception as e:
        gt_msg = {'result': 'success', 'reason': 'request geetest api fail'}
    
    # 5.根据极验返回的用户验证状态, 网站主进行自己的业务逻辑
    if gt_msg['result'] == 'success':
        self.write({'login': 'success', 'reason': gt_msg['reason']})
    else:
        self.write({'login': 'fail', 'reason': gt_msg['reason']})

客户端部署：
引入初始化函数(gt4.js下载地址: https://static.geetest.com/v4/gt4.js)
<script src="gt4.js"></script>
注： 行为验证要求初始化在业务页面加载时同时初始化，否则验证无法读取用户在业务页面操作的行为数据，会导致验证策略失效。

需要说明的是这里的gt4.js文件，它用于加载对应的验证JS库

通过以上代码引入 `initGeetest4` 初始化函数
调用初始化函数进行初始化
initGeetest4({
    captchaId: '您的captchaId'
},function (captcha) {
    // captcha为验证码实例
    captcha.appendTo("#captcha");// 调用appendTo将验证码插入到页的某一个元素中，这个元素用户可以自定义
});
注： 对于同一个页面存在多个验证码场景的初始化，需要每个验证码场景调用 initGeetest4 方法单独进行初始化；如果一个场景下有多个验证入口，需要进行多次初始化。如果在iframe中使用验证码，需要设置sandbox=“allow-scripts allow-popups”来保证验证码功能完整性。