import React from 'react';
import { App, Utils, CTYPE, U } from "../common";
import PropTypes from 'prop-types';
import '../assets/css/comps.scss';
import { Tree, Steps, Drawer, Button } from 'antd';
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { List, Radio, Toast, SwipeAction, } from 'antd-mobile';

const { Step } = Steps;
const RadioItem = Radio.RadioItem;

const { TreeNode } = Tree;

class Carts extends React.Component {

    static propType = {
        carts: PropTypes.array.isRequired,
        categories: PropTypes.array.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
    }

    selectedValue = (items, values) => {
        let vals = [];
        let value = '';

        values.map((v) => {
            let item = items.find((it, index) => index == v) || {};
            if (item.label) {
                vals.push(item.label);
            }
        });

        if (vals.length <= 1) {
            return vals;
        }
        if (vals.length >= 2 && vals.length <= 3) {
            value = vals.join(',');
            return value;
        }

        value = vals.join('/');

        return value
    }

    onClickItem = (switchItem) => {
        let { switchItems = [] } = this.state;
        let cindex = switchItem.cindex;
        if (switchItems[cindex]) {
            switchItems[cindex] = {
                cindex: cindex,
                isSwitch: !switchItem.isSwitch
            }
        } else {
            switchItem = { ...switchItem, isSwitch: true }
            switchItems.push(switchItem);
        }
        this.setState({ switchItems });
    }

    render() {
        let { trade = {}, categories = [], isFinish = false } = this.props;
        let { carts = [], totalAmount, totalPrice, status } = trade;
        let { switchItems = [{ isSwitch: false }] } = this.state;

        let price = U.num.formatPrice(totalPrice);

        return <div className="carts">
            {carts && carts.length > 0 && <ul className="items">
                {carts.map((cartItem, index) => {
                    let { sequence = '', count, amount, quote = {} } = cartItem;
                    let { quotationItem = [] } = quote;

                    let category = categories.find(it => it.sequence === (sequence.substr(0, 2) + '0000')) || {};
                    let children = category.children || [];
                    let _category = children.find(it => it.sequence === (sequence.substr(0, 4) + '00')) || {};
                    let _children = _category.children || [];
                    let __category = _children.find(it => it.sequence === sequence) || {};

                    let { isSwitch = false } = switchItems[index] || {};

                    let cartPrice = U.num.formatPrice(amount);

                    return <li key={index}>
                        <div className={`cart-info ${isFinish ? 'finish' : ''}`} >
                            <div className="img" style={{ backgroundImage: `url(${category.icon})` }}></div>
                            <div className="content">
                                <div className="title">
                                    {`${category.name}/${_category.name}/${__category.name}`}
                                </div>
                                <div className="extra-info">
                                    <div>数量：{count}</div>
                                    <div>预估价：¥ {U.formatCurrency(cartPrice, 2)}</div>
                                </div>
                            </div>
                        </div>
                        {!isFinish && <div className="quote">
                            {isSwitch && <ul className={`quote-items ${isSwitch ? 'start' : 'end'}`}>
                                {quotationItem.map((item, i) => {
                                    let { label, values = [], quotationPriceItems = [] } = item;
                                    let value = this.selectedValue(quotationPriceItems, values);
                                    return <li key={i}>
                                        <div className="label">{label}：</div>
                                        <div className="value" style={{ textAlign: `${value.length > 21 ? 'left' : 'right'}` }}>{value}</div>
                                    </li>
                                })}
                            </ul>}
                            <div className="switch" onClick={() => {
                                this.onClickItem({ cindex: index, isSwitch: isSwitch });
                            }}>
                                {!isSwitch ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
                                {!isSwitch ? '展开查看详情' : '收起详情'}
                            </div>
                        </div>}
                    </li>
                })}
            </ul>}

            {status == 3 && <div className="collate">
                <ul className="collate-info">
                    <li>
                        <div className="label">核算数量：</div>
                        <div className="value">{totalAmount}</div>
                    </li>
                    <li>
                        <div className="label">核算价格：</div>
                        <div className="value">¥ {U.formatCurrency(price, 2)}</div>
                    </li>
                </ul>
                <div className="total">
                    <div className="convert">折合= {totalPrice * 100 / 100}环保币</div>
                    <div className="actual">实付金额：¥ {U.formatCurrency(price, 2)}</div>
                </div>
            </div>}
        </div>
    }
}

class ProgressStep extends React.Component {

    render() {
        let { trade = {} } = this.props;

        let { user = {}, address = {}, periods = [], status, distance } = trade;

        console.log(trade);

        let { avatar, nick } = user;

        let { location = {}, detail } = address;
        let { poiaddress } = location;

        let start = U.date.format(new Date(parseInt(periods[0])), 'yyyy-MM-dd HH:mm');
        let end = U.date.format(new Date(parseInt(periods[1])), 'HH:mm');

        let period = start + ' - ' + end;

        return <div className={`progress-step ${status == 3 ? 'progress-step-finish' : ''}`}>
            <div className="title-user">
                <div className="user">
                    <img src={avatar} />
                    <div className="name">{nick}</div>
                </div>
                {status == 2 && <div className="distance">距离您{distance / 1000}km</div>}
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
            </div>
        </div>
    }
}

const id_div = 'div-drawer-cancel-trade';
class CancelTrade extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        document.body.style.overflow = 'hidden';
        window.onhashchange = () => {
            this.close();
        }
    }

    close = () => {
        Utils.common.closeModalContainer(id_div);
        document.body.style.overflow = 'auto';
    };

    changeChecked = (value) => {
        this.setState({
            checked: value,
        });
    }

    cancel = () => {
        let { trade = {} } = this.props;
        let { checked = 1 } = this.state;
        let { tradeId } = trade;

        let mark = CTYPE.reasionForCancellation.find(it => it.value == checked) || {};

        App.api('recy/trade/cancel', {
            trade: JSON.stringify({
                tradeId,
                tradeInfo: {
                    recyCancelMark: mark.label
                },
            })
        }).then(() => {
            this.close();
            Toast.success("订单已取消");
            App.go('/trades')
        })
    }

    render() {
        let { checked = 1 } = this.state;

        return <Drawer
            visible={true}
            height="55%"
            getContainer={() => Utils.common.createModalContainer(id_div)}
            onClose={this.cancel}
            placement="bottom"
            title={<div className="title">
                取消订单的理由
                <div className="cancel" onClick={this.close}>取消</div>
            </div>}
            closable={false}>
            <List >
                {CTYPE.reasionForCancellation.map(i => (
                    <RadioItem key={i.value} checked={checked === i.value} onChange={() => this.changeChecked(i.value)}>
                        {i.label}
                    </RadioItem>
                ))}
            </List>
        </Drawer>
    }
}

class CollateCarts extends React.Component {

    static propType = {
        carts: PropTypes.array.isRequired,
        categories: PropTypes.array.isRequired,
    }

    getCategoryName = (sequence) => {
        let { categories = [] } = this.props;
        let names = '';
        let objs = [];

        let first = categories.find(it => it.sequence === sequence.substr(0, 2) + '0000') || {};
        if (first) {
            objs.push(first.name);
            if (first.children && first.children.length > 0) {
                let second = first.children.find(it => it.sequence === sequence.substr(0, 4) + '00') || {};
                objs.push(second.name);
                let thir = second.children.find(it => it.sequence === sequence) || {};
                if (thir) {
                    objs.push(thir.name);
                }
            }
        }

        names = objs.join('/');

        return names;
    }

    render() {
        let { carts = [] } = this.props;

        return <div className="collate-carts">
            <ul className="carts-list">
                {carts.map((cart, index) => {
                    let { amount, count, sequence } = cart;

                    let _amount = U.num.formatPrice(amount);

                    return <li key={index}>
                        <SwipeAction
                            autoClose
                            right={[
                                {
                                    text: '删除',
                                    onPress: () => console.log('删除'),
                                    style: { width: '73px', marginLeft: '10px' },
                                }
                            ]}>
                            <div className="cart-title">
                                <div className="name">{this.getCategoryName(sequence)}</div>
                                <div className="delete"></div>
                            </div>
                            <ul className="total">
                                <li>
                                    <div className="label">价格：</div>
                                    <div className="value">¥ {U.formatCurrency(_amount, 2)}</div>
                                </li>
                                <li>
                                    <div className="label">数量：</div>
                                    <div className="value">{count}</div>
                                </li>
                            </ul>
                        </SwipeAction>
                    </li>
                })}
            </ul>
        </div>
    }

}

const id_div_cart = 'div-drawer-cart-edit';
class CartEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount() {
        document.body.style.overflow = 'hidden';
        window.onhashchange = () => {
            this.close();
        }
    }

    close = () => {
        Utils.common.closeModalContainer(id_div_cart);
        document.body.style.overflow = 'auto';
    };

    radioOnChange = () => {

    }

    renderTitle = (item3) => {
        let { checked } = this.state;
        return <RadioItem
            key={item3.sequence}
            checked={checked === item3.sequence}
            onChange={() => {
                this.setState({ checked: item3.sequence });
            }}>
            {item3.name}
        </RadioItem>
    }

    initTreeData = () => {
        let { categories = [] } = this.props;
        // let { checked = '010101' } = this.state;
        categories.map((item1, index1) => {
            let { children = [] } = item1;
            item1.key = `${index1}`;
            item1.title = item1.name;
            children.map((item2, index2) => {
                let { children = [] } = item2;
                item2.key = `${index1}-${index2}`;
                item2.title = item2.name;
                children.map((item3, index3) => {
                    item3.key = `${index1}-${index2}-${index3}`;
                    item3.title = this.renderTitle(item3);
                });
            });
        });
    }



    render() {

        let { categories = [] } = this.props;
        categories.sort((a, b) => {
            return a.sequence.localeCompare(b.sequence);
        });

        console.log(categories);
        this.initTreeData();

        return <Drawer
            visible={true}
            height="65%"
            getContainer={() => Utils.common.createModalContainer(id_div_cart)}
            placement="bottom"
            closable={false}
            onClose={this.close}
            title={<div className="title">
                请选择分类
                <div className="cancel" onClick={this.close}>取消</div>
            </div>}
            closable={false}>
            <div className="wrap">
                <Tree
                    treeData={categories} defaultExpandAll={true} />
            </div>
            <div className="btn">
                <Button type="primary">确定</Button>
            </div>
        </Drawer>
    }
}

export {
    Carts,
    ProgressStep,
    CancelTrade,
    CollateCarts,
    CartEdit,
    // TitleBar,
    // Banners,
    // NavBar,
    // HorizonalScrollContainer,
    // MyRate,
    // MyTag,
    // ProductList,
    // FilterBar,
    // PickBar,
    // CommonPopup,
    // CommonTabs,
    // MySearchBar
};
