import React from 'react';
import { Utils } from "../../common";
import CartEdit from './CartEdit';


let TradeUtils = {
    renderCartEdit: (categories, trade, cartIndex) => {
        Utils.common.renderReactDOM(<CartEdit categories={categories} trade={trade} cartIndex={cartIndex} />);
    },
}

export default TradeUtils;