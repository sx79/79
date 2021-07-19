import React from 'react';
import { App, Utils } from "../../common";
import CartEdit from './CartEdit';


let TradeUtils = {
    renderCartEdit: (categories, trade, cartIndex, loadTrade) => {
        Utils.common.renderReactDOM(<CartEdit categories={categories} trade={trade} cartIndex={cartIndex} loadTrade={loadTrade} />);
    },
    loadTrade: (tradeId, component, onTradeLoaded) => {
        App.api('recy/trade/trade', {
            tradeId,
        }).then(trade => {
            component.setState({ trade }, onTradeLoaded);
        });
    }
}

export default TradeUtils;