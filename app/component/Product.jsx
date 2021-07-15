import React from 'react';
import '../assets/css/product.scss';
import { App, CTYPE, U, Utils } from "../common";
import { Banners, CommonPopup, CommonTabs, PickBar } from "./Comps";
import classnames from 'classnames';
import { Comment, Icon, Tooltip } from 'antd';
import moment from 'moment';

export default class Product extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            id: parseInt(this.props.match.params.id),
        };
    }

    componentDidMount() {
    }


    render() {


        return <div className='product-page'>


        </div>;
    }
}
