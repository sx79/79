import React from 'react';
import { _DATA, CTYPE, U } from "../common";
import '../assets/css/home.scss';
import { Banners, HorizonalScrollContainer, NavBar, TitleBar } from "./Comps";
import classnames from 'classnames';

const { BANNERS, NAVS, ARTISANS, CASES, ALBUMS, BANNERS_AD, ARTICLES } = _DATA.home;
const { PARTNERS = [] } = _DATA.common;
export default class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            _ARTISANS: ARTISANS
        };
    }

    componentDidMount() {
        U.setWXTitle('首页');
    }

    render() {


        return <div className='home-page'>


        </div>;
    }
}
