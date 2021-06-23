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

        specs: ['30mmX40mm', '35mmX50mm']

    };

})();

export default CTYPE;
