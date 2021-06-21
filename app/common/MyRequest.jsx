import U from './U.jsx';
import {App} from "./index";

var params = null;
var getParameter = function (key) {
    if (!params) {
        params = U.url.getParameters();
    }
    var value = params[key];
    if (value === undefined) {
        value = null;
    }
    return value;
};
var getCommonHeaders = function () {
    var headers = {};
    return headers;
};
var wrapParameters = function (params) {
    var headers = getCommonHeaders();
    for (var key in headers) {
        var value = headers[key];
        if (value === undefined || value === null || value === '') {
            continue;
        }
        if (!params[key]) {
            params[key] = value;
        }
    }
    return params;
};
var wrapUrl = function (api) {
    return window.location.protocol + App.API_BASE + api;
};
var MyRequest = {
    getParameter,
    wrapParameters,
    wrapUrl
};

export default MyRequest;
