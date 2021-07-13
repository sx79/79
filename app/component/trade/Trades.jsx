import React from 'react';
import { App, CTYPE, U, Utils, OSSWrap } from '../../common';
import '../../assets/css/trade/trades.scss';
import classnames from 'classnames';
import { Empty, message } from 'antd';


export default class Trades extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeIndex: 2,
        }
    }

    componentDidMount() {
        U.setWXTitle('订单中心');
        Utils.addr.loadRegion(this);
        this.loadTrades();
        this.loadCategories();
    }

    loadCategories = () => {
        App.api('recy/category/categories').then(categories => {
            this.setState({ categories });
        });
    }

    loadTrades = () => {
        let { pagination = {}, status } = this.state;
        App.api("/recy/trade/trades", {
            tradeQo: JSON.stringify({
                pageSize: pagination.pageSize,
                pageNumber: pagination.current,
                status,
                lat: 34.602837, lng: 113.726738
            })
        }).then((result) => {
            console.log(result);
            let { trades = [] } = result;
            this.setState({
                trades: trades,
                pagination,
                initializing: 2,
                last: result.last,
            });
        });
    };

    loadMore = (resolve) => {
        let { pagination = {}, status } = this.state;
        pagination.current = pagination.current + 1;
        App.api('/recy/trade/trades', {
            tradeQo: JSON.stringify({
                pageNumber: pagination.current,
                pageSize: pagination.pageSize,
                status,
                lat: 34.602837, lng: 113.726738
            })
        }).then(result => {
            let { trades = [] } = result;
            this.setState((prevState) => ({
                trades: prevState.trades.concat(trades),
                pagination,
                initializing: 2,
                last: result.last
            }));
        });
        resolve && resolve();
    };

    refresh = (resolve, reject) => {
        let { pagination = {} } = this.state;
        this.setState({ pagination: { ...pagination, current: 1 } }, () => this.loadTrades());
        resolve && resolve();
    };

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

    tabClick = (v) => {
        let { allTrades = [] } = this.state;
        this.setState({
            activeIndex: parseInt(v),
            trades: allTrades.filter(it => it.status == v)
        });
    }

    go = (tradeId) => {
        App.go(`/trade/${tradeId}`);
    }

    render() {
        let { activeIndex = 1, trades = [] } = this.state;

        let _trades = trades.sort((a, b) => {
            return parseInt(a.periods[0]) - parseInt(b.periods[0]);
        });

        _trades.sort((a, b) => {
            return a.distance - b.distance;
        });

        return <div className="trades-page">
            <ul className="tabs">
                <li className={classnames({ 'active': activeIndex == 2 })} onClick={() => this.tabClick(2)}>待上门</li>
                <li className={classnames({ 'active': activeIndex == 3 })} onClick={() => this.tabClick(3)}>已完成</li>
            </ul>
            {_trades.length <= 0 && <Empty description="暂无订单" image={<img src={require('../../assets/image/grab/bg_not_trade.png')} />} />}
            <ul className="trades">
                {_trades.map((trade, index) => {
                    let { tradeId, status, createdAt, address = {}, periods = [], carts = [], totalPrice = 0, distance } = trade;
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

                    let isFinish = status == 3;

                    return <li key={index} onClick={() => this.go(tradeId)}>
                        <div className="title" onClick={() => this.go(tradeId)}>
                            <div className={isFinish ? 'trade-id' : 'distance'}><i />{isFinish ? `订单编号${tradeId}` : `距离你${U.formatCurrency(distance / 1000, 2)}km`}</div>
                            {isFinish && <div className="detail">查看详情&nbsp;</div>}
                        </div>
                        <ul className="content">
                            <li>
                                <div className="label">物品类型：</div>
                                <div className="control">{this.getCartsCategoryNames(carts)}</div>
                            </li>
                            <li>
                                <div className="label">{`${isFinish ? '核算' : '预估'}价格：`}</div>
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

                            {!isFinish && <li>
                                <div className="label">上门时间：</div>
                                <div className="control">{period}</div>
                            </li>}

                            {isFinish && <li>
                                <div className="label">下单时间：</div>
                                <div className="control">{U.date.format(new Date(createdAt), 'yyyy-MM-dd HH:mm')}</div>
                            </li>}

                        </ul>
                    </li>
                })}
            </ul>
        </div>
    }
}