import React from 'react';
import '../assets/css/profile.scss';
import { App, CTYPE, U, Utils } from "../common";
import { List, Switch, Toast } from 'antd-mobile';
import { Modal, message } from 'antd';

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

    componentWillUnmount() {

    }

    loadProfile = () => {
        App.api('recy/recycler/profile').then((recycler) => {
            this.setState({ recycler });
        });
    }

    work = (id, workStatus) => {
        let _workStatus = workStatus === 1 ? 2 : 1;
        let tip = workStatus == 1 ? '下班' : '上班';
        App.api('/recy/recycler/work', { id, workStatus: _workStatus }).then((recycler) => {
            this.setState({ recycler }, this.loadProfile());
            message.success(`已设置${tip}状态`);
        });
    }


    render() {
        let { recycler = {}, work = 1 } = this.state;
        let { name, mobile, recyclerNumber, workStatus, avatar } = recycler
        return <div className='profile-page'>
            <div className="top">
                <img src={avatar} />
                <div className="name">{name}</div>
                <div className="number">ID：{recyclerNumber}</div>
            </div>
            <List>
                <Item
                    extra={<Switch checked={workStatus == 1 ? true : false} onChange={(checked) => {
                        this.work(recycler.id, workStatus)
                    }} />}>
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
            <div className="signout" onClick={() => {
                App.logout();
            }}>
                退出登录
            </div>
        </div>;
    }
}
