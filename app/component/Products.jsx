import React from 'react';
import '../assets/css/products.scss';
import { Toast } from 'antd-mobile';
import _DATA from "../common/data";
import { U } from "../common";
import { FilterBar, ProductList } from "./Comps";

const { PRODUCTS = [] } = _DATA.store;
export default class Products extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
    }


    render() {


        return <div className='products-page'>


        </div>;
    }
}