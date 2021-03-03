const urllib = require('urllib');
const {KJUR, hextob64} = require('jsrsasign')
const assert = require('assert')
class Payment {
    constructor({appid, mchid, privateKey, serial_no, notify_url} = {}) {
        assert(appid, 'appid is required')
        assert(mchid, 'mchid is required')
        assert(privateKey, 'privateKey is required')
        assert(serial_no, 'serial_no is required')
       
        this.appid = appid;
        this.mchid = mchid;
        this.privateKey = privateKey;
        this.serial_no = serial_no;
        this.notify_url = notify_url;
        
        this.urls = {
            jsapi:() => {
                return {
                    url:'https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi',
                    method:'POST',
                    pathname:'/v3/pay/transactions/jsapi',
                }
            },
            app:() => {
                return {
                    url:'https://api.mch.weixin.qq.com/v3/pay/transactions/app',
                    method:'POST',
                    pathname:'/v3/pay/transactions/app',
                }
            },
            h5:() => {
                return {
                    url:'https://api.mch.weixin.qq.com/v3/pay/transactions/h5',
                    method:'POST',
                    pathname:'/v3/pay/transactions/h5',
                }
            },
            native:() => {
                return {
                    url:'https://api.mch.weixin.qq.com/v3/pay/transactions/native',
                    method:'POST',
                    pathname:'/v3/pay/transactions/native',
                }
            },
            getTransactionsById:({pathParams}) => {
                return {
                    url:`https://api.mch.weixin.qq.com/v3/pay/transactions/id/${pathParams.transaction_id}?mchid=${this.mchid}`,
                    method:`GET`,
                    pathname:`/v3/pay/transactions/id/${pathParams.transaction_id}?mchid=${this.mchid}`,
                }
            },
            getTransactionsByOutTradeNo:({pathParams}) => {
                return {
                    url:`https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${pathParams.out_trade_no}?mchid=${this.mchid}`,
                    method:`GET`,
                    pathname:`/v3/pay/transactions/out-trade-no/${pathParams.out_trade_no}?mchid=${this.mchid}`,
                }
            },
            close:({pathParams}) => {
                return {
                    url:`https://api.mch.weixin.qq.com/v3/pay/transactions/out-trade-no/${pathParams.out_trade_no}/close`,
                    method:`POST`,
                    pathname:`/v3/pay/transactions/out-trade-no/${pathParams.out_trade_no}/close`,
                }
            },
            refund:() => {
                return {
                    url:`https://api.mch.weixin.qq.com/v3/refund/domestic/refunds`,
                    method:`POST`,
                    pathname:`/v3/refund/domestic/refunds`,
                }
            },
            getRefund:({pathParams}) => {
                return {
                    url:`https://api.mch.weixin.qq.com/v3/refund/domestic/refunds/${pathParams.out_refund_no}`,
                    method:`GET`,
                    pathname:`/v3/refund/domestic/refunds/${pathParams.out_refund_no}`,
                }
            },
        }
    }

    async run({pathParams,queryParams,bodyParams,type}){
        assert(type, 'type is required')
        let {url,method,pathname} = this.urls[type]({pathParams,queryParams})
        let timestamp = Math.floor(Date.now()/1000)
        let onece_str = this.generate();
        let bodyParamsStr = bodyParams&&Object.keys(bodyParams).length?JSON.stringify(bodyParams):''
        let signature = this.rsaSign(`${method}\n${pathname}\n${timestamp}\n${onece_str}\n${bodyParamsStr}\n`,this.privateKey,'SHA256withRSA')
        let Authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchid}",nonce_str="${onece_str}",timestamp="${timestamp}",signature="${signature}",serial_no="${this.serial_no}"`
        let {status, data} = await urllib.request(url, {
            method: method,
            dataType: 'text',
            data: method=='GET'?'':bodyParams,
            timeout: [10000, 15000],
            headers:{
                'Content-Type':'application/json',
                'Accept':'application/json',
                'Authorization':Authorization
            },
        })
        return {status, data}
    }

    //jsapi统一下单
    async jsapi(params){
        let bodyParams = {
            ...params,
            appid:this.appid,
            mchid:this.mchid,
            notify_url:params.notify_url||this.notify_url,            
        }
        return await this.run({bodyParams,type:'jsapi'})
    }

    //app统一下单
    async app(params){
        let bodyParams = {
            ...params,
            appid:this.appid,
            mchid:this.mchid,
            notify_url:params.notify_url||this.notify_url,            
        }
        return await this.run({bodyParams,type:'app'})
    }

    //h5统一下单
    async h5(params){
        let bodyParams = {
            ...params,
            appid:this.appid,
            mchid:this.mchid,
            notify_url:params.notify_url||this.notify_url,            
        }
        return await this.run({bodyParams,type:'h5'})
    }

    //native统一下单
    async native(params){
        let bodyParams = {
            ...params,
            appid:this.appid,
            mchid:this.mchid,
            notify_url:params.notify_url||this.notify_url,            
        }
        return await this.run({bodyParams,type:'native'})
    }

    //通过transaction_id查询订单
    async getTransactionsById(params){
        return await this.run({pathParams:params,type:'getTransactionsById'})
    }

    //通过out_trade_no查询订单
    async getTransactionsByOutTradeNo(params){
        return await this.run({pathParams:params,type:'getTransactionsByOutTradeNo'})
    }

    //关闭订单
    async close(params){
        return await this.run({pathParams:{
            out_trade_no:params.out_trade_no
        },bodyParams:{
            mchid:this.mchid
        },type:'close'})
    }

    //退款
    async refund(params){
        let bodyParams = {
            ...params,
            notify_url:params.notify_url||this.notify_url,            
        }
        return await this.run({bodyParams,type:'refund'})
    }

    //查询单笔退款订单
    async getRefund(params){
        return await this.run({pathParams:params,type:'getRefund'})
    }


    //生成随机字符串
    generate = (length = 32) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let noceStr = '', maxPos = chars.length;
        while (length--) noceStr += chars[Math.random() * maxPos | 0];
        return noceStr;
    }


    /**
     * rsa签名
     * @param content 签名内容
     * @param privateKey 私钥，PKCS#1
     * @param hash hash算法，SHA256withRSA，SHA1withRSA
     * @returns 返回签名字符串，base64
     */
    rsaSign(content, privateKey, hash='SHA256withRSA'){
        // 创建 Signature 对象
        const signature = new KJUR.crypto.Signature({
            alg: hash,
            //!这里指定 私钥 pem!
            prvkeypem: privateKey
        })
        signature.updateString(content)
        const signData = signature.sign()
        // 将内容转成base64
        return hextob64(signData)
    }
}   

module.exports = Payment;
  
