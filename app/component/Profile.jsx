import React from 'react';
import '../assets/css/profile.scss';
import { App, CTYPE, U, Utils } from "../common";
import { List, Switch, Toast, Badge } from 'antd-mobile';
import { Modal, message } from 'antd';
import { MessageOutlined } from '@ant-design/icons';

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

    work = (id, rest) => {
        let _rest = rest === 1 ? 2 : 1;
        let tip = rest === 1 ? '下班' : '上班';
        App.api('/recy/recycler/work', { id, rest: _rest }).then((recycler) => {
            this.setState({ recycler }, this.loadProfile());
            message.success(`已设置${tip}状态`);
        });
    }

    render() {
        let { recycler = {}, } = this.state;
        let { name, mobile, jobNumber, rest, verify = {} } = recycler
        let { jobProve } = verify;
        console.log(recycler)
        return <div className='profile-page'>
            <div className="top">
                <img src={jobProve} />
                <div className="name">{name}</div>
                <div className="number">ID：{jobNumber}</div>
            </div>
            <List>
                <Item
                    extra={<Switch checked={rest == 1 ? true : false} onChange={(checked) => {
                        this.work(recycler.id, rest)
                    }} />}>
                    <i className="work" />
                    工作状态：{rest == 1 ? '上班' : '下班'}
                </Item>
                <Item arrow="horizontal" onClick={() => App.go('/trades')}>
                    <i className="trade" />
                    我的订单
                </Item>
                <Item onClick={() => App.go('/message')}
                    extra={<Badge text={22} overflowCount={99} />}
                    arrow="horizontal">
                    <i className="msg" />
                    我的消息
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
