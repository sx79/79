import React from 'react';
import '../../assets/css/trade/trade.scss';
import { App, CTYPE, U, Utils, OSSWrap } from '../../common';
import { Carts, ProgressStep, CancelTrade } from '../Comps';
import classnames from 'classnames';
import { message, Spin, Steps } from 'antd';
import copy from 'copy-to-clipboard';
import TradeUtils from './TradeUtils';
import WechatTools from '../../common/WechatTools';

import { Modal, Toast } from 'antd-mobile';
const alert = Modal.alert;
const { Step } = Steps;

export default class Trade extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tradeId: this.props.match.params.tradeId,
            trade: {},
        }
    }

    componentDidMount() {
        U.setWXTitle('订单详情');
        // this.loadTrade();
        this.loadCategories();
        Utils.addr.loadRegion(this);
        U.setWXTitle("订单详情");
        let { tradeId = 0 } = this.state;
        TradeUtils.loadTrade(tradeId, this, this.onTradeLoaded);
    }


    // loadTrade = () => {
    //     let { tradeId } = this.state;
    //     App.api('recy/trade/trade', {
    //         tradeId,
    //     }).then(trade => {
    //         this.setState({ trade });
    //     });
    // }

    loadCategories = () => {
        App.api('recy/category/categories', { type: 1 }).then(categories => {
            this.setState({ categories });
        });
    }

    cancelTrade = () => {
        let { trade = {} } = this.state;
        Utils.common.renderReactDOM(<CancelTrade trade={trade} />)
    }

    onTradeLoaded = () => {
        this.initMap();
    };

    initMap = () => {
        let { trade = {} } = this.state;
        let { address = {}, user = {} } = trade;
        let { location = {} } = address;
        let { lat, lng } = location;

        document.getElementById('map_container').innerHTML = "";

        let center = new TMap.LatLng(lat, lng);
        let map = new TMap.Map("map_container", { center, zoom: 16 });
        map.removeControl(TMap.constants.DEFAULT_CONTROL_ID.ZOOM);

        new TMap.MultiMarker({
            id: "marker-layer",
            map,
            // styles: {
            //     "marker": new TMap.MarkerStyle({
            //         "width": 30,
            //         "height": 30,
            //         "src": user.avatar
            //     })
            // },
            geometries: [{
                "id": "demo",
                "styleId": "marker",
                "position": center,
                "properties": {
                    "title": user.nick
                }
            }]
        });
    };


    render() {
        let { trade = {}, categories = [] } = this.state;

        if (!trade.id) {
            return <Spin />
        }
        let { user = {}, distance, completedAt, tradeId, status, updatedAt, totalAmount, totalPrice, createdAt, remark, imgs = [], visitedStartAt, visitedEndAt, carts = [], address = {}, tradeInfo = {} } = trade;
        let { canceledAt } = tradeInfo;
        let { name, mobile, detail, location = {}, } = address;
        let { poiaddress } = location;

        let pictures = [];
        imgs.map((item) => {
            pictures.push(item);
        });

        let price = U.num.formatPrice(totalPrice);

        let str = '';
        if (address) {
            let { code } = location;
            let codes = Utils.addr.getPCD(code) || '';
            str = codes.replace(/\s*/g, '');
        }
        let start = U.date.format(new Date(visitedStartAt), 'yyyy-MM-dd HH:mm');
        let end = U.date.format(new Date(visitedEndAt), 'HH:mm');
        let period = start + ' - ' + end;
        let statusTxt = status == 2 ? '待上门' : status == 3 ? '已完成' : '已取消';

        return <div className="trade-page" style={{ paddingBottom: `${status == 4 && '20px'}` }}>
            <div className="top-bar">
                <div className="trade-id">订单：{tradeId}</div>
                <div className={classnames('status', { 'success': status >= 3 })}>{statusTxt}</div>
            </div>

            {/* <ProgressStep trade={trade} onTradeLoaded={this.onTradeLoaded} /> */}
            <div className={`progress-step ${status == 3 ? 'progress-step-finish' : ''}`}>
                <div className="title-user">
                    <div className="user">
                        <img src={user.avatar} />
                        <div className="name">{user.nick}</div>
                    </div>
                    {status == 2 && <div className="distance">距离您{U.formatCurrency(distance / 1000, 2)}km</div>}
                </div>

                <div className="step" >
                    <Steps size="small"
                        direction="vertical"
                        current={1}>
                        <Step
                            icon={<i className="icon address" />}
                            title={poiaddress + detail} />
                        <Step
                            icon={<i className="icon time" />}
                            title={period} />
                    </Steps>
                    <div className="map">
                        <div className="map-inner" id="map_container"></div>
                        {/* <div className="btn" onClick={() => WechatTools.openLocation(address)}>地图导航</div> */}
                    </div>
                </div>
            </div>

            <div className={`carts-comp ${status == 3 ? 'trade-finish' : ''}`}>
                <div className="title"> 物品信息 </div>
                <Carts trade={trade} categories={categories} isFinish={status >= 3} />
            </div>

            <div className={`trade ${status == 3 ? 'trade-finish' : ''}`}>
                <div className="title">订单信息</div>
                <ul className="content">
                    <li>
                        <div className="label">联&#8194;系&#8194;人：</div>
                        <div className="control">{name}</div>
                    </li>
                    <li>
                        <div className="label">联系电话：</div>
                        <div className="control">{mobile}</div>
                    </li>
                    <li>
                        <div className="label">上门地址：</div>
                        <div className="control">{str + detail}</div>
                    </li>
                    <li>
                        <div className="label">上门时间：</div>
                        <div className="control">{period}</div>
                    </li>
                    <li>
                        <div className="label">备注信息：</div>
                        <div className="control">{remark}</div>
                    </li>
                    <li className="imgs">
                        <div className="label">图片信息：</div>
                        <div className="control">
                            {imgs.map((img, index) => {
                                return <img key={index} src={img} onClick={() => Utils.common.showImgLightbox(pictures, index)} />
                            })}
                        </div>
                    </li>
                </ul>
            </div>

            <div className={`trade trade-base ${status == 3 ? 'trade-finish' : ''}`}>
                <ul className="content">
                    <li>
                        <div className="label">订单编号：</div>
                        <div className="control">{tradeId}<div className="copy" onClick={() => {
                            copy(tradeId);
                            message.success('已复制到剪切面板')
                        }}>复制</div></div>
                    </li>
                    <li>
                        <div className="label">下单时间：</div>
                        <div className="control">{U.date.format(new Date(createdAt), 'yyyy-MM-dd HH:mm')}</div>
                    </li>
                    {status >= 2 && <li>
                        <div className="label">接单时间：</div>
                        <div className="control">{U.date.format(new Date(updatedAt), 'yyyy-MM-dd HH:mm')}</div>
                    </li>}
                    {status == 3 && <li>
                        <div className="label">完成时间：</div>
                        <div className="control">{completedAt ? U.date.format(new Date(completedAt), 'yyyy-MM-dd HH:mm') : U.date.format(new Date(new Date().getTime()), 'yyyy-MM-dd HH:mm')}</div>
                    </li>}
                    {status == 4 && <li>
                        <div className="label">取消时间：</div>
                        <div className="control">{canceledAt ? U.date.format(new Date(canceledAt), 'yyyy-MM-dd HH:mm') : '暂无'}</div>
                    </li>}
                </ul>
            </div>

            {status != 4 && <div className="btn-wrap">
                {status == 2 && <div className="btn">
                    <div className="btn-common contact">联系客户</div>
                    <div className="btn-common cancel" onClick={this.cancelTrade}>取消订单</div>
                    <div className="btn-common collate" onClick={() => App.go(`/collate/${tradeId}`)}>核对订单</div>
                </div>}
                {status == 3 && <div className="trade-total">
                    <div className="tatol-content">
                        <div className="total-label">总计数量：</div>
                        <div className="total-value">{totalAmount}</div>
                    </div>
                    <div className="tatol-content">
                        <div className="total-label">合计金额：</div>
                        <div className="total-value">¥ {U.formatCurrency(price, 2)}</div>
                    </div>
                </div>}
            </div>}
        </div>
    }
}