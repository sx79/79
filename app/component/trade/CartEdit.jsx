
import React from 'react';
import '../../assets/css/trade/cart-edit.scss';
import { App, Utils, CTYPE, U } from "../../common";
import { Collapse, Drawer, Button } from 'antd';
import classnames from 'classnames';

const id_div_cart = 'div-drawer-cart-edit';
const { Panel } = Collapse;

export default class CartEdit extends React.Component {

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

    render() {
        let { categories = [], trade = {}, cartIndex } = this.props;

        let { carts = [] } = trade;

        let { cart = {} } = this.state;

        let { sequence } = cart;

        let first = categories.find(it => it.sequence.substr(0, 2) === sequence.substr(0, 2)) || {};

        categories.sort((a, b) => {
            return a.sequence.localeCompare(b.sequence);
        });

        return <Drawer
            visible={true}
            height="75%"
            getContainer={() => Utils.common.createModalContainer(id_div_cart)}
            placement="bottom"
            closable={false}
            onClose={this.close}
            title={<div className="title">
                选择物品明细
                <div className="cancel" onClick={this.close}>取消</div>
            </div>}
            closable={false}>
            <div className="wrap">
                <Collapse ghost={true} expandIconPosition='right' defaultActiveKey={[0, 1, 2, 3, 4, 5, 6, 7, 8]}>
                    <Panel
                        header={<span>选择类型 *</span>}
                        extra={'请选择'}>
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
                    <Panel
                        header={<span>选择品牌 *</span>}
                        extra={'请选择'}>
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
                </Collapse>
            </div>

            <div className="btn">
                <Button type="primary">确定</Button>
            </div>
        </Drawer>
    }
}