import React from 'react';
import '../assets/css/grab.scss';
import { Toast } from 'antd-mobile';
import { App, CTYPE, U, Utils } from "../common";
import classnames from 'classnames';
import { Empty, message } from 'antd';
import { FrownOutlined } from '@ant-design/icons';

export default class Grab extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            minute: 9,
            second: 59,
        };
    }

    componentDidMount() {
        U.setWXTitle('抢单中心');
        this.loadTrades();
        this.loadCategories();
        Utils.addr.loadRegion(this);
    }

    loadTrades = () => {
        App.api('recy/trade/trades').then(trades => {
            trades.map((trade, index) => {
                trade.distance = 1500 + ((index + 1) * 456);
                if (index == 0) {
                    trade.distance = 33000;
                }
            });
            let _trades = trades.filter(it => it.periods[0] < new Date().getTime());
            this.setState({ trades: _trades });
        });
    }

    loadCategories = () => {
        App.api('recy/category/categories').then(categories => {
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
            this.loadTrades();
        });
    }

    render() {
        let { trades = [], commings } = this.state;
        let _trades = trades.sort((a, b) => {
            return parseInt(a.periods[0]) - parseInt(b.periods[0]);
        });

        let sortTrades = _trades.sort((a, b) => {
            return a.distance - b.distance;
        });

        let now = new Date().getTime();

        return <div className='grab-page'>
            {sortTrades.length <= 0 && <Empty description="暂无订单" image={<img src={require('../assets/image/grab/bg_not_trade.png')} />} />}
            <ul className="trades" >
                {sortTrades.map((trade, index) => {
                    let { tradeId, status, address = {}, periods = [], carts = [], totalPrice = 0, distance } = trade;
                    let { name, mobile, detail, location = {} } = address;
                    let { code } = location;
                    let codes = Utils.addr.getPCD(code);
                    let str = '';
                    if (codes && codes.length > 0) {
                        str = codes.replace(/\s*/g, '');
                    }

                    let start = U.date.format(new Date(parseInt(periods[0])), 'yyyy-MM-dd HH:mm');
                    let end = U.date.format(new Date(parseInt(periods[1])), 'HH:mm');

                    let period = start + ' - ' + end;

                    let isNotGrap = distance > 30000;

                    return <li key={index}>
                        {isNotGrap && <div className="tip">
                            <FrownOutlined />
                            <span>距离不符合接单要求哦，无法抢单！</span>
                        </div>}

                        <div className="card">
                            <div className="title">
                                <div className="distance"><i />距离你{U.formatCurrency(distance / 1000, 1)}km</div>
                                {<div className="rest">{`剩余时间：7:59`}</div>}
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
                                <div className="navigation"><i />导航</div>
                                <div className={classnames('grab', { 'not-grap': isNotGrap })} onClick={() => {
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
        </div >;
    }
}
