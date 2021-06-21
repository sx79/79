import React from 'react';
import '../assets/css/store.scss';
import { Banners, HorizonalScrollContainer, MyRate, MyTag, NavBar, ProductList, MySearchBar, TitleBar } from "./Comps";
import { _DATA, App, CTYPE, U } from "../common";

const { NAVS = [], PRODUCTS, MERCHANTS } = _DATA.store;
const { BRANDS = [] } = _DATA.common;
export default class Store extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
    }

    initData = () => {

    };

    render() {


        return <div className='store-page'>

        </div>;
    }
}
