import React, { Component } from 'react';
import '../../assets/css/trade/trade-navigate.scss';
import { App, U } from "../../common";
// import UserProfile from '../common/UserProfile';
import TradeUtils from "./TradeUtils";
import { Steps } from 'antd';
const { Step } = Steps;

export default class TradeNavigate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tradeId: this.props.match.params.tradeId,
            trade: {},
            recycler: {}
        };
        this.start = null;
        this.end = null;
        this.map = null;
    }

    componentDidMount() {
        U.setWXTitle("导航");
        App.api('recy/recycler/profile').then((recycler) => {
            this.setState({ recycler }, () => {
                let { tradeId = 0 } = this.state;
                TradeUtils.loadTrade(tradeId, this, this.onTradeLoaded);
            });
        });
    }

    onTradeLoaded = () => {
        this.initMap();
    };

    initMap = () => {
        let { trade = {}, recycler = {} } = this.state;
        let { address = {} } = trade;
        let { location = {} } = address;
        let { lat, lng } = recycler;

        console.log(location, location.lat, location.lng);

        console.log(recycler, lat, lng);


        let start = new TMap.LatLng(lat, lng);
        let end = new TMap.LatLng(location.lat, location.lng);

        this.map = new TMap.Map('mapContainer', {
            center: start,
            zoom: 14
        });

        App.api('common/driving_routes', {
            latitudeFrom: lat, longitudeFrom: lng, latitudeTo: location.lat, longitudeTo: location.lng, key: 'EVWBZ-WYILQ-CL35H-GGOPS-QABVF-PJFGS'
        }).then((ret = {}) => {

            let { result = {} } = ret;
            console.log(result);
            let { routes = [] } = result;
            console.log(routes);
            let { polyline = [] } = routes[0];

            let pl = [];

            var kr = 1000000;
            for (var i = 2; i < polyline.length; i++) {
                polyline[i] = Number(polyline[i - 2]) + Number(polyline[i]) / kr;
            }
            for (var i = 0; i < polyline.length; i += 2) {
                pl.push(new TMap.LatLng(polyline[i], polyline[i + 1]));
            }

            this.displayPolyline(pl);

            new TMap.MultiMarker({
                id: 'marker-layer',
                map: this.map,
                styles: {
                    "start": new TMap.MarkerStyle({
                        "width": 25,
                        "height": 35,
                        "anchor": { x: 16, y: 32 },
                        "src": 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/start.png'
                    }),
                    "end": new TMap.MarkerStyle({
                        "width": 25,
                        "height": 35,
                        "anchor": { x: 16, y: 32 },
                        "src": 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/end.png'
                    })
                },
                geometries: [{
                    "id": 'start',
                    "styleId": 'start',
                    "position": start
                }, {
                    "id": 'end',
                    "styleId": 'end',
                    "position": end
                }]
            });
        })
    };

    displayPolyline = (pl) => {
        new TMap.MultiPolyline({
            id: 'polyline-layer', //图层唯一标识
            map: this.map,//绘制到目标地图
            styles: {
                'style_blue': new TMap.PolylineStyle({
                    'color': '#3777FF', //线填充色
                    'width': 4, //折线宽度
                    'borderWidth': 2, //边线宽度
                    'borderColor': '#FFF', //边线颜色
                    'lineCap': 'round', //线端头方式
                })
            },
            geometries: [{
                'id': 'pl_1',//折线唯一标识，删除时使用
                'styleId': 'style_blue',//绑定样式名
                'paths': pl
            }]
        });
    }


    render() {
        let { trade = {} } = this.state;
        let { user = {}, distance, completedAt, tradeId, status, updatedAt, totalAmount, totalPrice, createdAt, remark, imgs = [], visitedStartAt, visitedEndAt, carts = [], address = {}, tradeInfo = {} } = trade;

        let { avatar } = user;
        let { code, name, location = {}, detail = "" } = address;
        let { poiaddress } = location;

        let available = status == 1 && visitedEndAt !== '0:00';

        let start = U.date.format(new Date(visitedStartAt), 'yyyy-MM-dd HH:mm');
        let end = U.date.format(new Date(visitedEndAt), 'HH:mm');
        let visitedAt = start + ' - ' + end;

        return <div>
            {trade.id && <div className='trade-navigate-page'>

                <div className='map-container' id='mapContainer'></div>

                <div className={`progress-step ${status == 3 ? 'progress-step-finish' : ''}`}>
                    <div className="title-user">
                        <div className="user">
                            <img src={user.avatar} />
                            <div className="name">{user.nick}</div>
                        </div>
                        <div className="distance">距离您{U.formatCurrency(distance / 1000, 2)}km</div>
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
                                title={visitedAt} />
                        </Steps>
                    </div>

                    <div className="btn-wrap">
                        <div className="btn">立即抢单</div>
                    </div>

                </div>
            </div>}
        </div>
    }
}