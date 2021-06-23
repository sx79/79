import React from 'react';
import { CTYPE, U } from "../common";
import '../assets/css/home.scss';
import { Banners, HorizonalScrollContainer, NavBar, TitleBar } from "./Comps";
import classnames from 'classnames';
export default class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

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
