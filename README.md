# node-wechat-pay
微信支付API v3 for nodejs


## 功能概述
- `完成模块` jsapi,native,h5,app统一下单，付款交易查询,退款,退款交易查询
- `支付模式支持`  付款码/公众号/小程序/APP/H5/扫码支付

## 交流
微信：yangfuhe036，如有任何问题欢迎加微信交流。

## 使用前必读
#### 版本要求
nodejs >= 8.3.0

## 安装
```Bash
npm i wxpay-v3 --save

# 如已安装旧版, 重新安装最新版
npm i wxpay-v3@latest
```

## 实例化
```javascript
const Payment = require('wxpay-v3');
const paymnet = new Payment({
    appid: '公众号ID',
    mchid: '微信商户号',
    privateKey: require('fs').readFileSync('*_key.pem证书文件路径').toString(),//或者直接复制证书文件内容
    serial_no:'证书序列号',
    notify_url: '支付退款结果通知的回调地址',
})
```

#### config说明:
- `appid` - 公众号ID(必填)
- `mchid` - 微信商户号(必填)
- `privateKey` - 商户API证书*_key.pem中内容  可在微信支付平台获取(必填, 在微信商户管理界面获取)
- `serial_no` - 证书序列号(必填, 证书序列号，可在微信支付平台获取 也可以通过此命令获取(*_cert.pem为你的证书文件) openssl x509 -in *_cert.pem -noout -serial )
- `notify_url` - 支付退款结果通知的回调地址(选填)
  - 可以在初始化的时候传入设为默认值, 不传则需在调用相关API时传入
  - 调用相关API时传入新值则使用新值


### jsapi统一下单
```javascript
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
```
### app统一下单
```javascript
let result = await payment.app({
    description:'点存云-测试支付',
    out_trade_no:Date.now().toString(),
    amount:{
        total:1
    }
})
console.log(result)
```

### h5统一下单
```javascript
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
```

### native统一下单
```javascript
let result = await payment.native({
    description:'点存云-测试支付',
    out_trade_no:Date.now().toString(),
    amount:{
        total:1
    }
})
console.log(result)
```

### 通过transaction_id查询订单
```javascript
let result = await payment.getTransactionsById({
    transaction_id:'4200000928202103013162567337'
})
console.log(result)
```

### 通过out_trade_no查询订单
```javascript
let result = await payment.getTransactionsByOutTradeNo({
    out_trade_no:'1614602083807'
})
console.log(result)
```

### 关闭订单
```javascript
let result = await payment.close({
    out_trade_no:'1614602083807'
})
console.log(result)
```

### 退款
```javascript
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
```

### 查询单笔退款订单
```javascript
let result = await payment.getRefund({
    out_refund_no:'1614757507992',
})
console.log(result)
```
