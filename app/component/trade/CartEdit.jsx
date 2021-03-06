
import React from 'react';
import '../../assets/css/trade/cart-edit.scss';
import { App, Utils, CTYPE, U } from "../../common";
import { Collapse, Drawer, Button, Radio, Checkbox, InputNumber, Input, Spin } from 'antd';
import classnames from 'classnames';
import { MinusOutlined } from '@ant-design/icons';
import { Modal, Toast } from 'antd-mobile';

const id_div_cart = 'div-drawer-cart-edit';
const { Panel } = Collapse;
const prompt = Modal.prompt;

export default class CartEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cartIndex: this.props.cartIndex,
            trade: this.props.trade,
            categories: this.props.categories,
            cart: {},
        };
    }

    componentDidMount() {
        let { cartIndex, trade = {} } = this.state;
        let { carts = [] } = trade;
        if (cartIndex > -1) {
            this.setState({ cart: carts[cartIndex] });
        }
        document.body.style.overflow = 'hidden';
        window.onhashchange = () => {
            this.close();
        }
    }

    calc = () => {
        let { cart = {}, } = this.state;
        let { quote = {}, count = 1 } = cart;
        let { quotationItem = [], maxPrice = 0, minPrice = 0 } = quote;

        let amount = maxPrice;

        quotationItem.map((quoteItem) => {
            let { values = [], quotationPriceItems = [] } = quoteItem;
            if (values && values.length > 0) {
                values.map((value) => {
                    let item = quotationPriceItems.find(it => it.value == value) || {};
                    let { price } = item;
                    if (price) {
                        if (amount - price <= minPrice) {
                            amount = minPrice;
                        } else {
                            amount = amount - price;
                        }
                    }
                });
            }
        });
        cart.amount = amount * count;
        this.setState({ cart })
    }

    close = () => {
        Utils.common.closeModalContainer(id_div_cart);
        document.body.style.overflow = 'auto';
    };

    onSave = () => {
        let { trade = {}, cartIndex, cart = {}, isNoRepeat = false } = this.state;
        if (isNoRepeat) {
            return;
        }
        let { carts = [] } = trade;
        if (cartIndex < 0) {
            carts.push(cart);
        } else {
            carts[cartIndex] = cart;
        }
        trade.totalAmount = carts.reduce((total = 0, item) => {
            let { count } = item;
            return total + count
        }, 0);
        trade.totalPrice = carts.reduce((total = 0, item) => {
            let { amount } = item;
            return total + amount
        }, 0);

        App.api('recy/trade/collate_trade', { trade: JSON.stringify(trade) }).then(() => {
            this.setState({ isNoRepeat: true });
            Toast.success("??????????????????");
            this.close();
            this.props.loadTrade();
        })

    }

    render() {
        let { categories = [], trade = {}, cart = {} } = this.state;

        categories.sort((a, b) => {
            return a.sequence.localeCompare(b.sequence);
        });

        let { sequence = '000000', quote = {}, count = 1, amount = 0 } = cart;
        let { quotationItem = [] } = quote;
        let first = categories.find(it => it.sequence.substr(0, 2) === sequence.substr(0, 2)) || {};
        let firstChildren = first.children || [];
        let second = firstChildren.find(it => it.sequence.substr(0, 4) === sequence.substr(0, 4)) || {};
        let secondChildren = second.children || [];
        let third = secondChildren.find(it => it.sequence == sequence) || {};
        return <Drawer
            visible={true}
            height="75%"
            getContainer={() => Utils.common.createModalContainer(id_div_cart)}
            placement="bottom"
            closable={false}
            onClose={this.close}
            title={<div className="title">
                ??????????????????
                <div className="cancel" onClick={this.close}>??????</div>
            </div>}
            closable={false}>
            <div className="wrap">
                <Collapse ghost={true} expandIconPosition='right' defaultActiveKey={[0, 1, 2, 3, 4, 5, 6, 7, 8]}>
                    <Panel
                        header={<span>???????????? *</span>}
                        extra={first.name ? first.name : '?????????'}>
                        <ul className="category">
                            {categories.map((categoryItem, index) => {
                                let active = false;
                                if (sequence) {
                                    active = sequence.substr(0, 2) === categoryItem.sequence.substr(0, 2);
                                }
                                return <li key={index} className={classnames({ 'active': active })}
                                    onClick={() => {
                                        this.setState({ cart: { sequence: categoryItem.sequence } })
                                    }}>
                                    {categoryItem.name}
                                </li>
                            })}
                        </ul>
                    </Panel>
                    {firstChildren && firstChildren.length > 0 && <Panel
                        header={<span>???????????? *</span>}
                        extra={second.name ? second.name : '?????????'}>
                        <ul className="category">
                            {firstChildren.map((secondItem, index) => {
                                return <li key={index} className={classnames({ 'active': sequence.substr(0, 4) === secondItem.sequence.substr(0, 4) })}
                                    onClick={() => {
                                        this.setState({ cart: { sequence: secondItem.sequence } })
                                    }}>
                                    {secondItem.name}
                                </li>
                            })}
                        </ul>
                    </Panel>}
                    {secondChildren && secondChildren.length > 0 && <Panel
                        header={<span>???????????? *</span>}
                        extra={third.name ? third.name : '?????????'}>
                        <ul className="category">
                            {secondChildren.map((thirdItem, index) => {
                                let { quotation = {} } = thirdItem;
                                let { maxPrice = 0 } = quotation;
                                return <li key={index} className={classnames({ 'active': sequence === thirdItem.sequence })}
                                    onClick={() => {
                                        quotationItem.map((it => {
                                            if (it.values) {
                                                it.values = [];
                                            }
                                        }));
                                        this.setState({ cart: { sequence: thirdItem.sequence, count: 1, amount: maxPrice, quote: { ...thirdItem.quotation } } }, this.calc)
                                    }}>
                                    {thirdItem.name}
                                </li>
                            })}
                        </ul>
                    </Panel>}
                    {quotationItem && quotationItem.length > 0 && quotationItem.map((quoteItem, index) => {

                        let { type, label, values = [], quotationPriceItems = [] } = quoteItem;

                        quotationPriceItems.map((item, i) => {
                            item.value = i;
                        })
                        return <Panel key={index + 3}
                            header={<span>{label} {type == 2 && '(??????)'} *</span>}
                            extra={values.length <= 0 ? '?????????' : (type == 2 ? `${values.length}???` : values.length > 0 && quotationPriceItems[values[0]].label)}>
                            {type == 1 && <Radio.Group buttonStyle="solid"
                                value={values[0]}
                                onChange={e => {
                                    cart.quote.quotationItem[index].values = [e.target.value];
                                    this.setState({ cart }, this.calc);
                                }}>
                                {quotationPriceItems.map((priceItem, cindex) => {
                                    return <Radio.Button key={cindex} value={cindex}>{priceItem.label}</Radio.Button>
                                })}
                            </Radio.Group>}
                            {type == 2 && <Checkbox.Group
                                options={quotationPriceItems}
                                value={values}
                                onChange={val => {
                                    cart.quote.quotationItem[index].values = val;
                                    this.setState({ cart }, this.calc);
                                }}
                            />}
                        </Panel>
                    })}
                </Collapse>
                <div className="empty"></div>
            </div>

            <div className="footer-wrap">
                <div className="footer">
                    <div className="number-wrap">
                        <div className="txt">
                            ??????
                            <span>*</span>
                        </div>
                        <div className="number">
                            <div className="btn minus" onClick={() => {
                                if (count - 1 < 1) {
                                    return;
                                }
                                cart.count = count < 1 ? 1 : count - 1;
                                this.setState({ cart }, this.calc);
                            }}><MinusOutlined /></div>
                            <InputNumber defaultValue={1} max={99} min={1} value={count} />
                            <div className="plus" onClick={() => {
                                if (count + 1 > 99) {
                                    return;
                                }
                                cart.count = count > 99 ? 99 : count + 1;
                                this.setState({ cart }, this.calc);
                            }}>+</div>
                        </div>
                    </div>
                    <div className="btn-wrap">
                        <div className="price">
                            ????????????
                            <span onClick={() => prompt('??????????????????', '????????????????????????', [
                                { text: '??????' },
                                { text: '??????', onPress: value => this.setState({ cart: { ...cart, amount: value * 100 } }) },
                            ], 'default', `${amount / 100}`)}>{U.num.formatPrice(amount)}</span>
                        </div>
                        <Button type="primary" onClick={this.onSave}>??????</Button>
                    </div>
                </div>
            </div>
        </Drawer >
    }
}