let CTYPE = (() => {

    return {
        page_limit: 20,

        bannerTypes: {
            banner: Symbol('banner'),
            ad: Symbol('ad'),
            product: Symbol('product')
        },

        productStyles: {
            box: Symbol('box'),
            flat: Symbol('flat')
        },

        userType: { admin: 1, user: 2 },
        accountType: { mobile: 1, email: 2 },

        colors: ['白色', '红色', '黄色', '土豪金', '绿色', '蓝色', '黑色', '紫色'],

        specs: ['30mmX40mm', '35mmX50mm'],

        reasionForCancellation: [
            {
                value: 1,
                label: '天气不好，取消订单'
            },
            {
                value: 2,
                label: '客户今天不方便，改天再下单'
            },
            {
                value: 3,
                label: '拍错了，不想下单了'
            },
            {
                value: 4,
                label: '客户有钱任性'
            },
            {
                value: 5,
                label: '没有原因啦啦啦啦'
            },
            {
                value: 6,
                label: '其他'
            }
        ],

    };

})();

export default CTYPE;
