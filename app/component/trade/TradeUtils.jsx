import React from 'react';
import { Utils } from "../../common";
import CartEdit from './CartEdit';


let TradeUtils = {
    renderCartEdit: (categories, trade, cartIndex, loadTrade) => {
        Utils.common.renderReactDOM(<CartEdit categories={categories} trade={trade} cartIndex={cartIndex} loadTrade={loadTrade} />);
    },
}

export default TradeUtils;