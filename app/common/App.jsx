import fetch from 'isomorphic-fetch';
import { Toast } from 'antd-mobile';
import { App, KvStorage, U } from "./index";

const hashHistory = require('history').createHashHistory();

let ENV_CONFIG;
if (process.env.API_ENV == 'dev') {
    ENV_CONFIG = require('./env/dev').default;
}

if (process.env.API_ENV == 'sandbox') {
    ENV_CONFIG = require('./env/sandbox').default;
}

if (process.env.API_ENV == 'prod') {
    ENV_CONFIG = require('./env/prod').default;
}

const API_BASE = window.location.protocol + ENV_CONFIG.api;


const api = (path, params = {}, options = {}) => {

    if (options.requireSession === undefined) {
        options.requireSession = true;
    }

    if (options.defaultErrorProcess === undefined) {
        options.defaultErrorProcess = true;
    }

    let defaultError = { 'errcode': 600, 'errmsg': '网络错误' };
    let apiPromise = function (resolve, reject) {
        let rejectWrap = reject;

        if (options.defaultErrorProcess) {
            rejectWrap = function (ret) {
                let { errmsg } = ret;
                Toast.fail(errmsg);
                reject(ret);
            };
        }
        let apiUrl = API_BASE + path;

        var token = getCookie('recycler-token');
        if (U.str.isNotEmpty(token)) {
            params['recycler-token'] = token;
        }

        let dataStr = '';
        for (let key in params) {
            if (dataStr.length > 0) {
                dataStr += '&';
            }
            if (params.hasOwnProperty(key)) {
                let value = params[key];
                if (value === undefined || value === null) {
                    value = '';
                }
                dataStr += (key + '=' + encodeURIComponent(value));
            }
        }
        if (dataStr.length === 0) {
            dataStr = null;
        }

        fetch(apiUrl, {
            method: 'POST',
            body: dataStr,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (response) {
            response.json().then(function (ret) {
                let errcode = ret.errcode;
                if (errcode === 5) {
                    logout();
                    App.go('/signin');
                    return;
                }
                if (errcode) {
                    rejectWrap(ret);
                    return;
                }
                resolve(ret.result);
            }, function () {
                rejectWrap(defaultError);
            });
        }, function () {
            rejectWrap(defaultError);
        }).catch(() => {
        });
    };

    return new Promise(apiPromise);

};

let saveCookie = (k, v) => KvStorage.set(k, v);
let getCookie = (k) => KvStorage.get(k);
let removeCookie = (k) => KvStorage.remove(k);

const go = function (hash) {
    hashHistory.push(hash);
};


let logout = () => {
    removeCookie('recycler-token');
    removeCookie('recycler-sess');
};

let getRecyclerProfile = function () {
    return JSON.parse(getCookie('recycler-profile') || '{}');
};

let getRecyclerToken = function () {
    return getCookie('recycler-token');
};

const REGION_PATH = window.location.protocol + '//c1.wakkaa.com/assets/pca-code.json';

export default {
    go,
    api,
    API_BASE,
    saveCookie,
    REGION_PATH,
    getCookie,
    logout,
    getRecyclerProfile,
    getRecyclerToken,
};
