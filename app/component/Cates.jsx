import React from 'react';
import { _DATA, U } from "../common";
import '../assets/css/cates.scss';
import { MySearchBar } from "./Comps";
import classnames from 'classnames';
import ConvertPinyin from "../common/ConvertPinyin";

let { CATEGORIES = [], BRANDS = [] } = _DATA.common;
export default class Cates extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        U.setWXTitle('分类大全');
    }


    render() {


        return <div className='cates-page'>


        </div>;
    }
}
