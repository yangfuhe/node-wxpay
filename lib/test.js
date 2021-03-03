
const fs = require('fs')
const path = require('path')
const Payment = require("./index");

//商户API证书*_key.pem中内容  可在微信支付平台获取
const privateKey = 
`-----BEGIN PRIVATE KEY-----
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
-----END PRIVATE KEY-----`;

//证书序列号，可在微信支付平台获取 也可以通过此命令获取(*_cert.pem为你的证书文件) openssl x509 -in *_cert.pem -noout -serial  
const serial_no = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
//公众号ID
const appid = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
//微信商户号
const mchid = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
//支付退款结果通知的回调地址
const notify_url = 'https://xxxx.xxx.xxx/xxx/xxx/xxx'

let payment = new Payment({
    appid,
    mchid,
    privateKey:privateKey,//或fs.readFileSync(path.join(__dirname,'*_key.pem证书文件路径')).toString(),
    serial_no,    
    notify_url
})

//jsapi统一下单 测试命令 node ./lib/test.js --method=jsapi
this.jsapi = async () => {
    let result = await payment.jsapi({
        description:'点存云-测试支付',
        out_trade_no:Date.now().toString(),
        amount:{
            total:1
        },
        payer:{
            openid:'ouEJk65CZr8_7eb95RIPDNWZKrvI'
        },

    })
    console.log(result)
}

//app统一下单 测试命令 node ./lib/test.js --method=app
this.app = async () => {
    let result = await payment.app({
        description:'点存云-测试支付',
        out_trade_no:Date.now().toString(),
        amount:{
           total:1
        }
   })
   console.log(result)
}

//h5统一下单 测试命令 node ./lib/test.js --method=h5
this.h5 = async () => {
    let result = await payment.h5({
        description:'点存云-测试支付',
        out_trade_no:Date.now().toString(),
        amount:{
            total:1
        },
        scene_info:{
            payer_client_ip:'203.205.219.187'
        }
   })
   console.log(result)
}

//native统一下单 测试命令 node ./lib/test.js --method=native
this.native = async () => {
    let result = await payment.native({
        description:'点存云-测试支付',
        out_trade_no:Date.now().toString(),
        amount:{
            total:1
        }
   })
   console.log(result)
}

//通过transaction_id查询订单 测试命令 node ./lib/test.js --method=getTransactionsById
this.getTransactionsById = async () => {
    let result = await payment.getTransactionsById({
        transaction_id:'4200000928202103013162567337'
   })
   console.log(result)
}

//通过out_trade_no查询订单 测试命令 node ./lib/test.js --method=getTransactionsByOutTradeNo
this.getTransactionsByOutTradeNo = async () => {
    let result = await payment.getTransactionsByOutTradeNo({
        out_trade_no:'1614602083807'
   })
   console.log(result)
}

//关闭订单 测试命令 node ./lib/test.js --method=close
this.close = async () => {
    let result = await payment.close({
        out_trade_no:'1614602083807'
   })
   console.log(result)
}

//退款 测试命令 node ./lib/test.js --method=refund
this.refund = async () => {
    let result = await payment.refund({
        transaction_id:'4200000902202103026804947229',
        //out_trade_no:'1614602083807',
        out_refund_no:Date.now().toString(),
        amount:{
            refund:1,
            total:1,
            currency:'CNY'
        }
   })
   console.log(result)
}

//查询单笔退款订单 测试命令 node ./lib/test.js --method=getRefund
this.getRefund = async () => {
    let result = await payment.getRefund({
        out_refund_no:'1614757507992',
   })
   console.log(result)
}




const args = require('minimist')(process.argv.slice(2))
this[args['method']]()