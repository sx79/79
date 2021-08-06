import React from 'react';
import { App, CTYPE, U, Utils, OSSWrap } from '../../common';
import '../../assets/css/trade/trades.scss';
import classnames from 'classnames';
import Tloader from "../common/react-touch-loader";
import { Empty, Spin } from 'antd';


export default class Trades extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeIndex: 2,
            pagination: {
                pageSize: 3,
                current: 1,
                total: 0
            },
            trades: [],
        }
    }

    componentDidMount() {
        U.setWXTitle('订单中心');
        Utils.addr.loadRegion(this);
        this.loadTrades();
        this.loadCategories();
    }

    loadCategories = () => {
        App.api('recy/category/categories', { type: 1 }).then(categories => {
            this.setState({ categories });
        });
    }

    getQuery = (pagination = {}) => {
        let { sorter = {}, status, activeIndex } = this.state;
        let { sortFiled = 'id', sortAscDesc = 'desc' } = sorter;

        let param = {};
        param['tradeQo'] = JSON.stringify({
            sortPropertyName: sortFiled,
            sortAscending: sortAscDesc === 'asc',
            pageNumber: pagination.current,
            pageSize: pagination.pageSize,
            status: activeIndex,
            lat: 34.602837, lng: 113.726738
        });
        return param;
    };

    loadTrades = () => {
        let { pagination = {}, activeIndex } = this.state;
        console.log(activeIndex);
        App.api("/recy/trade/trades", {
            ...this.getQuery(pagination),
        }).then((result) => {
            let { page = {}, trades = [] } = result;
            this.setState({
                trades: result.trades,
                pagination,
                initializing: 2,
                last: page.last,
            });
        });
    };

    loadMore = (resolve) => {
        let { pagination = {}, activeIndex } = this.state;
        pagination.current = pagination.current + 1;
        App.api('/recy/trade/trades', {
            ...this.getQuery(pagination),
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
        this.setState({
            activeIndex: parseInt(v),
            trades: [],
            pagination: {
                pageSize: 3,
                current: 1,
                total: 0
            },
            initializing: 2,
        }, () => {
            this.loadTrades();
        });
    }
    go = (tradeId) => {
        App.go(`/trade/${tradeId}`);
    }

    render() {
        let { activeIndex = 2, trades = [], initializing, last } = this.state;

        let length = trades.length;

        let _trades = trades.sort((a, b) => {
            return parseInt(a.visitedStartAt) - parseInt(b.visitedStartAt);
        });

        _trades.sort((a, b) => {
            return a.distance - b.distance;
        });
        _trades.sort((a, b) => {
            return b.createdAt - a.createdAt;
        });

        return <div className="trades-page">
            <ul className="tabs">
                <li className={classnames({ 'active': activeIndex == 2 })} onClick={() => this.tabClick(2)}>待上门</li>
                <li className={classnames({ 'active': activeIndex == 3 })} onClick={() => this.tabClick(3)}>已完成</li>
                <li className={classnames({ 'active': activeIndex == 4 })} onClick={() => this.tabClick(4)}>已取消</li>
            </ul>
            {_trades.length <= 0 && <Empty description="暂无订单" image={<img src={require('../../assets/image/grab/bg_not_trade.png')} />} />}
            <ul className="trades">
                {_trades.map((trade, index) => {
                    let { tradeId, status, createdAt, address = {}, visitedStartAt, visitedEndAt, carts = [], totalPrice = 0, distance } = trade;
                    let { name, mobile, detail, location = {} } = address;
                    let { code } = location;
                    let codes = Utils.addr.getPCD(code);
                    let str = '';
                    if (codes && codes.length > 0) {
                        str = codes.replace(/\s*/g, '');
                    }

                    let start = U.date.format(new Date(visitedStartAt), 'yyyy-MM-dd HH:mm');
                    let end = U.date.format(new Date(visitedEndAt), 'HH:mm');

                    let period = start + ' - ' + end;

                    let isFinish = status >= 3;

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
            {length >= 3 && <Tloader
                className="main"
                autoLoadMore
                onRefresh={this.refresh} onLoadMore={this.loadMore} hasMore={!last}
                initializing={initializing}>
            </Tloader>}
        </div>
    }
}