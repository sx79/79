import React from 'react';
import { App, CTYPE, U } from "../common";
import '../assets/css/home.scss';
import { MySchedule } from "./Comps";
import classnames from 'classnames';
import { Spin } from 'antd';
import { List } from 'antd-mobile';
import WechatTools from '../common/WechatTools';

const Item = List.Item;
export default class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            profile: {},
            statistics: {},
            schedules: [],
        };
    }

    componentDidMount() {
        U.setWXTitle('首页');
        this.loadProfile();
        this.loadStatistics();
        this.loadSchedule();
        this.syncLocation();
    }
    loadProfile = () => {
        App.api('recy/recycler/profile').then((profile) => {
            this.setState({ profile });
        });
    }

    loadStatistics = () => {
        App.api('recy/recycler/statistics').then(result => {
            this.setState({ statistics: result })
        });
    }

    syncLocation = () => {
        WechatTools.getLocation().then(res => {
            console.log(res);
            let { latitude, longitude } = res;
            App.api('recy/recycler/sync_location', { lat: latitude, lng: longitude });
        });
    };

    loadSchedule = () => {
        App.api('recy/trade/schedule').then((schedules) => {
            this.setState({ schedules, scheduleLoaded: true });
        });
    };

    render() {
        let { profile = {}, statistics = {}, schedules = [], scheduleLoaded, message = '' } = this.state;
        if (!profile.id) {
            return <Spin />
        }
        let { name, verify = {}, jobNumber } = profile;
        let { jobProve = require('../assets/image/common/icon_author_default.png') } = verify;
        let { comoletedCount = 0, todayCount = 0, visitCount = 0, waitCount = 0 } = statistics;

        return <div className='home-page'>
            <div className="top">
                <div className="bg-circle"></div>
                <div className="bg-hollow-circle"></div>
                <div className="bg-center-circle"></div>
                <ul className="numbers">
                    <li>
                        <div className="number">{todayCount}</div>
                        <div className="mean">今日接单</div>
                    </li>
                    <li>
                        <div className="number">{comoletedCount}</div>
                        <div className="mean">累计完成</div>
                    </li>
                </ul>
            </div>
            <div className="avatar">
                <img src={jobProve} />
            </div>
            <div className="message"></div>
            <div className="trade-center">
                <List >
                    <Item arrow="horizontal" onClick={() => App.go('/grab')}>
                        <i className="icon-trade" />
                        订单中心
                    </Item>
                </List>
                <ul className="center-num">
                    <li>
                        <div className="number">{waitCount}</div>
                        <div className="mean" onClick={() => App.go('/trades')}>待接单</div>
                    </li>
                    <li>
                        <div className="number">{visitCount}</div>
                        <div className="mean" onClick={() => App.go('/trades')}>待上门</div>
                    </li>
                </ul>
            </div>
            <div className="trade-center">
                <List>
                    <Item>
                        <i className="icon-calendar" />
                        我的日程表
                    </Item>
                </List>
                {scheduleLoaded && <MySchedule maxDay={21} schedules={schedules} />}
            </div>
        </div>;
    }
}
