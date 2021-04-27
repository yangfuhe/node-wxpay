# node-wxpay
微信支付APIv3 for nodejs


## 功能概述
- `完成模块` jsapi,native,h5,app统一下单，付款交易查询,退款,退款交易查询,解密通知参数,公钥获取,验证签名,交易账单,资金账单,下载账单
- `支付模式支持`  付款码/公众号/小程序/APP/H5/扫码支付

## 交流
微信：yangfuhe036，如有任何问题欢迎加微信交流。喜欢或对你有帮助，欢迎右上角 star，非常感谢！

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
    private_key: require('fs').readFileSync('*_key.pem证书文件路径').toString(),//或者直接复制证书文件内容
    serial_no:'证书序列号',
    apiv3_private_key:'api v3密钥',
    notify_url: '支付退款结果通知的回调地址',
})
```

#### config说明:
- `appid` - 公众号ID(必填)
- `mchid` - 微信商户号(必填)
- `private_key` - 商户API证书*_key.pem中内容  可在微信支付平台获取(必填, 在微信商户管理界面获取)
- `serial_no` - 证书序列号(必填, 证书序列号，可在微信支付平台获取 也可以通过此命令获取(*_cert.pem为你的证书文件) openssl x509 -in *_cert.pem -noout -serial )
- `apiv3_private_key` - apiv3密钥 在创建实例时通过apiv3密钥会自动获取平台证书的公钥，以便于验证签名(必填)
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

### 获取平台证书列表
```javascript
let result = await payment.getCertificates()
console.log(result)
```

### 解密支付退款通知参数
```javascript
let result = payment.decodeResource({
    "original_type":"refund",
    "algorithm":"AEAD_AES_256_GCM",
    "ciphertext":"d2Zi2VToOGXqB3K6bgQaFKktgA3AHm+cJg0vGZPcD22OUZ+CBymtrFJsFtaKKEwebSDN8Habic7NJVpKJpAxZd8ejm32v4UePg139/gj+X7vJtqB39ZkjZXLH973LT5R5yZQ351R3onlpx9JILN2+FNEbrUNenjgEufuQn45b9jwGSBX/sU6n/+gsCdt8+sSkbMy37sSX1bjMicHzte27fR0QSuO1TDjZjjDqP2ou0j7Jb+x9RRtWlbZ1hOYe7AhSTFzOXvkdCq0M6P6ja1cc2olV9xG8UzKxZN0JLnoqIGWwPzTVOPqmt/N3/MrzCK3TT1mNagBnhqEvSXhL9KUjpAIY8J6tkjfoG+9QwnJA8kW48C3nGsgePvNYvikJooQii7rx78Y2paR7cS8Pn8+sxKg4q91DiovBSdW2/ePDruI6SH/FWFrPmLQCG11fCjz/C9o6bqjaSsHKMaSVSAW9e/et04MP6GcZIDweG5AN9FgOXMI",
    "associated_data":"refund",
    "nonce":"AqfRSFm7h9Sa"
})
console.log(result)
```


### 验证签名
```javascript
setTimeout(async ()=>{
    //timestamp,nonce,serial,signature均在HTTP头中获取，body为请求参数
    let result = await payment.verifySign({
        timestamp:'1614829763',
        nonce:'Eeumuhd3zA5TirWeJUCLCpkENYM8PSUA',
        serial:'3DEA336346E96C002B7B0D514D424C8DEDBF9145',
        signature:'ame3lX1y6FeXrlBN973M1Dhg5n77M1wVsD3VgeyZlb8c3dz/hpQ+9vNOMBBHGdv8kDIfZUxKDdfoeUaVJhfqAEn9ZV4x112ntEzCHpJtIXQ3rr8fScY7cO71EN/QyQHtY1Ovt8U2Yr891iYaLujUrBHtWrhiR6UKecRA+/RgsUBYh4D10rrqW5ywNrLVN+PSuG4QB85bz3jSslMvRrSG7HP/Xwo3e2sWMDuQ2Uadefu+8/FK1P3KDLDO2fq5teSaaqs7oof2WpV6zrVtyQ+P4p5t8NJ0ExlOSAs2xGJ0+xi+U996tq3VYZXf/4nVsfGW9rn0m/mOrYTmiST9PF+q1g==',
        body:'{"id":"3b66121d-c9b9-5d61-9d92-eeec248e993d","create_time":"2021-03-04T11:49:23+08:00","resource_type":"encrypt-resource","event_type":"TRANSACTION.SUCCESS","summary":"支付成功","resource":{"original_type":"transaction","algorithm":"AEAD_AES_256_GCM","ciphertext":"PB305U6jR6TN8mBzbzGts5TaKnDXQt/7C+uJpGnvOT1SyCvI18L4f42eTZtrZv+5XUdOkxwEHGWDVl2MwbvpgLjLdjyisaHc+uRQCDoYlusiaeDJzd515Rl36nqmdPD8xFKZahWZBBkAlCgXLuW3qcdxSISTk/pyqPziwUtFKfMeq3LEEm4z8DfBM9cVXJrN8EiY2WaQsm+lGnZAV4+pxCELj67xmccXs3JgJwHSKE4exqW919atQWTwJHzuP3WNd+Xvp0zwm9RtDPTvZ8egehqqBw+DARC5jg8MmDtlMR2sTgH2xq6b4+QqLXPPIooOyvEZKMOteSI4FmSfPNwDfZ26D4ga9yGRIxSQKkWDq3QRNhOzvmSkCax08t2hdq12NxBSE9y7aZkjKIr4/uMEtKDU/3wcSoVKlawfN1hlCKo2nWbdKH1avRvc6FAFxXHtXRw0Y0MRnSk8gPMF/T+QqEMRJniXbrylt21xR0AEKbIVk0xK9jvhXex0AvST4x3eKM0r4DXkmL/pCjo1XmZLZIMc2uJ1jJEyqWcURXirrxADCATIAEWOu1hNL6PE","associated_data":"transaction","nonce":"KcsMoPx5UW1i"}}'
    })
    console.log(result)
},2000)
```

### 申请交易账单 
```javascript
let result = await payment.tradebill({
    bill_date:'2021-03-03'
})
console.log(result)
```

### 申请资金账单 
```javascript
let result = await payment.fundflowbill({
    bill_date:'2021-03-03'
})
console.log(result)
```

### 下载账单 
```javascript
let result = await payment.downloadbill('https://api.mch.weixin.qq.com/v3/billdownload/file?token=ktWgOuBvGNvmCk0NaOTMF41tG3yWsZrdM4zdgl10r1GRRNo4tG5V9mPi04ku-PY8&tartype=gzip')
console.log(result)
```

## 交流
微信：yangfuhe036，如有任何问题欢迎加微信交流。喜欢或对你有帮助，欢迎右上角 star，非常感谢！
