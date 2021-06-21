import fetch from 'isomorphic-fetch';
import {Toast} from 'antd-mobile';
import {KvStorage, U} from "./index";

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

const API_BASE = ENV_CONFIG.api;

const api = (path, params = {}, options = {}) => {

    if (options.requireSession === undefined) {
        options.requireSession = true;
    }

    if (options.defaultErrorProcess === undefined) {
        options.defaultErrorProcess = true;
    }

    let defaultError = {'errcode': 600, 'errmsg': '网络错误'};
    let apiPromise = function (resolve, reject) {
        let rejectWrap = reject;

        if (options.defaultErrorProcess) {
            rejectWrap = function (ret) {
                let {errmsg} = ret;
                Toast.fail(errmsg);
                reject(ret);
            };
        }
        let apiUrl = API_BASE + path;

        fetch(apiUrl, {
            method: 'POST',
            body: U.url.serializeParameters(params),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (response) {
            response.json().then(function (ret) {
                let errcode = ret.errcode;
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

};

let saveCookie = (k, v) => KvStorage.set(k, v);
let getCookie = (k) => KvStorage.get(k);
let removeCookie = (k) => KvStorage.remove(k);

const go = function (hash) {
    hashHistory.push(hash);
};

const REGION_PATH = window.location.protocol + '//c1.wakkaa.com/assets/pca-code.json';

export default {
    go,
    api,
    API_BASE,
    saveCookie,
    REGION_PATH,
    getCookie,
};
