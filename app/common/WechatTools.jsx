import fetch from 'isomorphic-fetch';
import { App, U } from "./index";
import MyRequest from "./MyRequest";

let ticketState = -1;
let lastHash = null;
let shareHref = null;

let hideMenus = function () {
    if (window.location.hash == lastHash) {
        return;
    }
    lastHash = window.location.hash;
    if (window.location.href == shareHref) {
        // call after enableShare
        return;
    }
    wx.hideAllNonBaseMenuItem();
};

let tryToInit = function (options) {

    return new Promise(function (resolve, reject) {
        let params = MyRequest.wrapParameters({
            url: window.location.href.split('#')[0],
            appId: options.appId,
        });

        fetch(MyRequest.wrapUrl('common/wx_jsticket'), {
            method: 'POST',
            body: U.url.serializeParameters(params),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then((response) => {
            response.json().then((ret) => {
                let ticket = ret.result;
                if (!ticket) {
                    reject();
                    return;
                }
                wx.ready(function () {
                    wx.hideAllNonBaseMenuItem({
                        success: function () {
                            window.addEventListener("hashchange", hideMenus);
                            resolve();
                        }
                    });
                });
                wx.error(reject);
                wx.config({
                    debug: false,
                    appId: ticket.appId,
                    timestamp: ticket.timestamp,
                    nonceStr: ticket.nonceStr,
                    signature: ticket.signature,
                    jsApiList: ['openLocation', 'getLocation', 'checkJsApi', 'showMenuItems', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'updateAppMessageShareData', 'updateTimelineShareData']
                });
            }, reject);
        }, reject);
    });
};

let init = function (options) {
    let trial = 0;
    let doInit = function () {
        tryToInit(options).then(function () {
            ticketState = 1;
        }, function () {
            trial++;
            if (trial > 5) {
                // abort
                ticketState = 0;
                return;
            }
            setTimeout(doInit, Math.min(trial * 30, 3000));
        });
    };
    doInit();
};

let ready = function () {
    return new Promise(function (resolve, reject) {
        console.log(ticketState);
        let checkTicket = function () {
            if (ticketState === 1) {
                if (resolve) {
                    resolve();
                }
                return;
            } else if (ticketState === 0) {
                if (reject) {
                    reject();
                }
                return;
            } else {
                setTimeout(checkTicket, 30);
            }
        };
        checkTicket();
    });
};

var enableShare = function (options) {
    var href = window.location.href;
    return ready().then(function () {
        if (href != window.location.href) {
            // avoid slow page loading bugs
            return;
        }
        shareHref = href;
        console.log(options.link);
        wx.hideAllNonBaseMenuItem({
            success: function () {
                wx.showMenuItems({
                    menuList: options.menus ? options.menus : ['menuItem:share:appMessage', 'menuItem:share:timeline', "menuItem:favorite", 'menuItem:copyUrl'],
                    success: function () {
                        var onSuccess = function (channel, ok) {
                            if (options.debug) {
                                console.log('[Wechat] shared to ' + channel + ', success: ' + ok);
                            }
                            if (options.success) {
                                options.success(channel, ok);
                            }
                        };
                        wx.updateAppMessageShareData({
                            title: options.title,
                            desc: options.desc,
                            link: options.link,
                            imgUrl: options.imgUrl,
                            success: function () {
                                onSuccess('wxmsg', true);
                            },
                            cancel: function () {
                                onSuccess('wxmsg', false);
                            }
                        });
                        wx.updateTimelineShareData({
                            title: options.title,
                            link: options.link,
                            imgUrl: options.imgUrl,
                            success: function () {
                                onSuccess('wxtl', true);
                            },
                            cancel: function () {
                                onSuccess('wxtl', false);
                            }
                        });
                    }
                });
            }
        });
    }, () => {
        if (options.debug) {
            console.log('Failed to enableShare: ' + JSON.stringify(options));
        }
    });
};

let getShareLink = function (wrap) {
    console.log(wrap);
    let { route, shareLink } = wrap;
    if (U.str.isNotEmpty(shareLink)) {
        return shareLink;
    }

    console.log(route);

    if (!route) {
        let hash = window.location.hash.substr(1);
        let hashEndIndex = hash.indexOf('?');
        if (hashEndIndex > 0) {
            hash = hash.substring(0, hashEndIndex);
        }
        route = hash;
    }
    let userId = App.getUserId();
    let loc = window.location;
    let ret = loc.protocol + '//' + loc.host + loc.pathname + '#' + route + '?sponsorId=' + (userId ? userId : 0);
    console.log(ret);
    // alert(ret);
    return ret;

    // let link = loc.protocol + '//' + loc.host + loc.pathname + '#' + route + '?sponsorId=' + (userId ? userId : 0);
    // return App.makeWeixinRedirectUrl(link);

};
let getLocation = () => {
    return new Promise((resolve, reject) => {
        console.log('请求微信定位');
        if (U.isWeChat()) {
            // ready().then(() => {
            console.log('请求微信定位3');
            try {
                wx.getLocation({
                    type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                    success: (res) => {
                        console.log(res);
                        resolve(res);
                    }
                });

            } catch (e) {
                console.log('定位失败1');
                reject();
            }
            // });
        } else {
            console.log('定位失败2');
            reject();
        }
    });
};

let openLocation = (address = {}) => {
    return new Promise((resolve, reject) => {
        if (U.isWeChat()) {
            // ready().then(() => {
            try {
                let { location = {}, name } = address;
                let { lat, lng } = location;
                wx.openLocation({
                    lat,
                    lng,
                    name,
                    address: address.location,
                    scale: 14
                });
            } catch (e) {
                console.log('定位失败1');
                reject();
            }
            // });
        } else {
            console.log('定位失败2');
            reject();
        }
    });
};

let WechatTools = {
    init, ready, enableShare, getShareLink, getLocation, openLocation
};

export default WechatTools;
