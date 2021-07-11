import React from 'react';
import { App, CTYPE, U } from "../common";
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
        this.loadProfile();
    }
    loadProfile = () => {
        let recycler = App.getRecyclerProfile();
        this.setState({ recycler });
    }

    render() {
        let { recycler = {} } = this.state;
        let { name, avatar, recyclerNumber } = recycler;
        let defaultAvatar = require('../assets/image/common/icon_author_default.png');
        return <div className='home-page'>
            <div className="top">
                <div className="bg-circle"></div>
                <div className="bg-hollow-circle"></div>
                <div className="bg-center-circle"></div>
                <ul className="numbers">
                    <li>
                        <div className="number">5</div>
                        <div className="mean">今日接单</div>
                    </li>
                    <li>
                        <div className="number">129</div>
                        <div className="mean">累计完成</div>
                    </li>
                </ul>
            </div>
            <div className="avatar">
                <img src={avatar || defaultAvatar} />
            </div>
        </div>;
    }
}
