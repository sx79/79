import React from 'react';
import '../assets/css/profile.scss';
import { App, CTYPE, U, Utils } from "../common";
import { List, Switch } from 'antd-mobile';

const Item = List.Item;
export default class Profile extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        U.setWXTitle("个人中心");
        this.loadProfile();
    }

    loadProfile = () => {
        let recycler = App.getRecyclerProfile();
        this.setState({ recycler });
    }


    render() {
        let { recycler = {} } = this.state;
        let { name, mobile, recyclerNumber, workStatus, avatar } = recycler
        return <div className='profile-page'>
            <div className="top">
                <img src={avatar} />
                <div className="name">{name}</div>
                <div className="number">ID：{recyclerNumber}</div>
            </div>
            <List>
                <Item
                    extra={<Switch checked={workStatus == 1 ? true : false} />}>
                    <i className="work" />
                    工作状态：{workStatus == 1 ? '上班' : '下班'}
                </Item>
                <Item arrow="horizontal" onClick={() => App.go('/trades')}>
                    <i className="trade" />
                    我的订单
                </Item>
                <Item
                    extra={U.str.formatMobile(mobile)}
                    arrow="horizontal">
                    <i className="mobile" />
                    手机号
                </Item>
            </List>
        </div>;
    }
}
