const urllib = require('urllib');
const {KJUR, hextob64} = require('jsrsasign')
const assert = require('assert')
const nodeAesGcm = require('node-aes-gcm')
const crypto = require("crypto");
class Payment {
    constructor({appid, mchid, privateKey, serial_no, notify_url,api_v3_private_key,publicKey} = {}) {
        assert(appid, 'appid is required')
        assert(mchid, 'mchid is required')
        assert(privateKey, 'privateKey is required')
        assert(serial_no, 'serial_no is required')
       
        this.appid = appid;
        this.mchid = mchid;
        this.privateKey = privateKey;
        this.serial_no = serial_no;
        this.notify_url = notify_url;
        this.api_v3_private_key = api_v3_private_key;
        this.publicKey = publicKey;
        
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
            getCertificates:() => {
                return {
                    url:`https://api.mch.weixin.qq.com/v3/certificates`,
                    method:`GET`,
                    pathname:`/v3/certificates`,
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
        let res = await urllib.request(url, {
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
        let {status, data} = res
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

    /*
    获取平台证书列表，new Paymeny()传了api_v3_private_key或在此传入api_v3_private_key
    则会解密decrypt_certificate，你可通过decrypt_certificate获取public key
    获取方式：1新建一个*_cert.pem 2.通过 openssl x509 -in *_cert.pem -pubkey -noout 获取公钥
    */
    async getCertificates(api_v3_private_key){
        let result = await this.run({type:'getCertificates'})
        let data = typeof result.data == 'string'?JSON.parse(result.data):esult.data
        if(api_v3_private_key||this.api_v3_private_key){
            let certificates = data.data
            for(let cert of certificates){
                let {plaintext} = this.decode(cert.encrypt_certificate,api_v3_private_key)
                cert.decrypt_certificate = plaintext.toString()
            }
        }            
        return data;
    }

    //验证签名
    verifySign(data, sign, publicKey) {
        publicKey = publicKey||this.publicKey
        let verify = crypto.createVerify('RSA-SHA256');
        verify.update(Buffer.from(data));
        return verify.verify(publicKey, sign, 'base64');
    }    

    //通知资源数据
    decodeResource(resource,api_v3_private_key){        
        let {plaintext} = this.decode(resource,api_v3_private_key)
        return JSON.parse(plaintext.toString());
    }

    //解密
    decode(params,api_v3_private_key){
        assert(api_v3_private_key||this.api_v3_private_key, 'api_v3_private_key is required')
        this.api_v3_private_key = api_v3_private_key||this.api_v3_private_key;
        let AUTH_KEY_LENGTH = 16;
        let { ciphertext, associated_data , nonce } = params;
        let key_bytes = Buffer.from(api_v3_private_key||this.api_v3_private_key, 'utf8');
        let nonce_bytes = Buffer.from(nonce, 'utf8');
        let associated_data_bytes = Buffer.from(associated_data, 'utf8');
        let ciphertext_bytes = Buffer.from(ciphertext, 'base64');
        let cipherdata_length = ciphertext_bytes.length - AUTH_KEY_LENGTH;
        let cipherdata_bytes = ciphertext_bytes.slice(0, cipherdata_length);
        let auth_tag_bytes = ciphertext_bytes.slice(cipherdata_length, ciphertext_bytes.length);
        return nodeAesGcm.decrypt(key_bytes, nonce_bytes, cipherdata_bytes, associated_data_bytes, auth_tag_bytes);
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
  