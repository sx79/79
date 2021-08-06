import React from 'react';
import '../assets/css/grab.scss';
import { App, U, Utils } from "../common";
import Tloader from "./common/react-touch-loader";

import classnames from 'classnames';
import { Empty, message, Spin } from 'antd';
import { FrownOutlined } from '@ant-design/icons';

export default class Grab extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pagination: {
                pageSize: 3,
                current: 1,
                total: 0
            },
            status: 1,
            trades: [],
            currT: new Date().getTime(),
        };
    }

    componentDidMount() {
        Utils.addr.loadRegion(this);
        U.setWXTitle("抢单中心");
        this.doInterval();
        this.loadData();
        this.loadCategories();
    }

    componentWillUnmount() {
        clearInterval(this.timerId);
    }

    doInterval = () => {
        this.timerId = setInterval(() => {
            this.setState({ currT: new Date().getTime() });
        }, 1000)
    }

    getQuery = (pagination = {}) => {
        let { sorter = {}, status } = this.state;
        let { sortFiled = 'id', sortAscDesc = 'desc' } = sorter;

        let param = {};
        param['tradeQo'] = JSON.stringify({
            sortPropertyName: sortFiled,
            sortAscending: sortAscDesc === 'asc',
            pageNumber: pagination.current,
            pageSize: pagination.pageSize,
            status,
            lat: 34.602837, lng: 113.726738
        });
        return param;
    };


    loadData = () => {
        let { pagination = {} } = this.state;
        App.api("/recy/trade/grabs", {
            ...this.getQuery(pagination)
        }).then((result) => {
            let { trades = [], page = {} } = result;
            this.setState({
                trades: trades,
                pagination,
                initializing: 2,
                last: page.last,
            });
        });
    };

    loadMore = (resolve) => {
        let { pagination = {}, status } = this.state;
        pagination.current = pagination.current + 1;
        App.api('/recy/trade/grabs', {
            ...this.getQuery(pagination)
        }).then(result => {
            let { trades = [], page = {} } = result;
            this.setState((prevState) => ({
                trades: prevState.trades.concat(trades),
                pagination,
                initializing: 2,
                last: page.last
            }));
        });
        resolve && resolve();
    };

    refresh = (resolve, reject) => {
        let { pagination = {} } = this.state;
        this.setState({ pagination: { ...pagination, current: 1 } }, () => this.loadData());
        resolve && resolve();
    };


    loadCategories = () => {
        App.api('recy/category/categories', { type: 1 }).then(categories => {
            this.setState({ categories });
        });
    }

    getCartsCategoryNames = (carts = []) => {
        let { categories = [] } = this.state;
        let objs = [];
        let sortobjs = [];
        let names = '';

        carts.map(cart => {
            let _sequence = cart.sequence.substr(0, 2) + '0000';
            let category = categories.find(it => it.sequence == _sequence) || {};
            let { name, priority } = category;
            if (!U.str.isEmpty(name)) {
                if (objs.findIndex(it => it.name == name) < 0) {
                    objs.push({ name, priority });
                }
            }
        });

        if (!objs) {
            return '其他'
        }

        objs.sort((a, b) => {
            return a.priority - b.priority;
        });

        objs.map(obj => {
            sortobjs.push(obj.name);
        });

        names = sortobjs.join('/');

        return names;
    }

    grab = (tradeId) => {
        App.api('recy/trade/grab', { tradeId }).then(() => {
            message.success("抢单成功");
            this.loadData();
        });
    }

    render() {
        let { trades = [], status, pagination = {}, initializing, last, index = 0, currT } = this.state;
        let length = trades.length;
        if (length < 0) {
            return <Spin />
        }
        trades.sort((a, b) => {
            return a.distance - b.distance;
        });
        let emptyEleLength = 0;
        return <div className="grab-page">

            <ul className="trades" >
                {trades.map((trade, index) => {
                    let { tradeId, createdAt, status, address = {}, visitedStartAt, visitedEndAt, carts = [], totalPrice = 0, distance } = trade;
                    let { name, mobile, detail, location = {} } = address;
                    let { code } = location;
                    let codes = Utils.addr.getPCD(code);
                    let str = '';

                    if (codes && codes.length > 0) {
                        str = codes.replace(/\s*/g, '');
                    }
                    let countdown = '等待指派中';

                    let diff = createdAt - currT + 1800000;
                    if (diff > 0) {
                        countdown = `剩余时间:${U.date.seconds2MS(diff / 1000)}`;
                    } else {
                        // emptyEleLength += 1;
                        // return <div></div>
                    }
                    let start = U.date.format(new Date(visitedStartAt), 'yyyy-MM-dd HH:mm');
                    let end = U.date.format(new Date(visitedEndAt), 'HH:mm');

                    let period = start + ' - ' + end;

                    let isNotGrap = distance > 20000;

                    return <li key={index}>
                        {isNotGrap && <div className="tip">
                            <FrownOutlined />
                            <span>距离不符合接单要求哦，无法抢单！</span>
                        </div>}

                        <div className="card">
                            <div className="title">
                                <div className="distance"><i />距离你{U.formatCurrency(distance / 1000, 2)}km</div>
                                {!isNotGrap && <div className="rest">{countdown}</div>}
                            </div>
                            <ul className="content">
                                <li>
                                    <div className="label">物品类型：</div>
                                    <div className="control">{this.getCartsCategoryNames(carts)}</div>
                                </li>
                                <li>
                                    <div className="label">预估价格：</div>
                                    <div className="control">{U.num.formatPrice(totalPrice)}</div>
                                </li>
                                <li>
                                    <div className="label">联&#8194;系&#8194;人：</div>
                                    <div className="control">{name}</div>
                                </li>
                                <li>
                                    <div className="label">上门地址：</div>
                                    <div className="control">{str + detail}</div>
                                </li>

                                <li>
                                    <div className="label">上门时间：</div>
                                    <div className="control">{period}</div>
                                </li>
                            </ul>
                            <div className="footer">
                                <div className="navigation" onClick={() => App.go(`/navigate/${tradeId}`)}><i />导航</div>
                                <div className={classnames('grab', { 'not-grap': isNotGrap || diff < 0 })} onClick={() => {
                                    if (isNotGrap || status != 1) {
                                        return;
                                    }
                                    this.grab(tradeId);
                                }}>抢单</div>
                            </div>
                        </div>
                    </li>
                })}
            </ul>
            {(length <= 0 || emptyEleLength === length) && <Empty description="您暂时没有相关订单！" image={<img src={require('../assets/image/grab/bg_not_trade.png')} />} />}
            {length > 0 && emptyEleLength < length && <Tloader
                className="main"
                autoLoadMore
                onRefresh={this.refresh} onLoadMore={this.loadMore} hasMore={!last}
                initializing={initializing}>
            </Tloader>}
        </div>

    }
}
