import React from 'react';
import { App } from '../../../common'
import { Avatar, Badge, List } from 'antd';
import { Loading, NoData } from "../../Comps";

export default class Chats extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    componentDidMount() {
        this.loadData();
    }

    loadData = () => {
        this.setState({ loading: true });
        App.api('usr/chat/chats').then((chats) => {
            this.setState({ chats, loading: false });
        }, () => {
            this.setState({
                loading: false
            });
        });
    }

    render() {

        let { chats = [], loading } = this.state;
        let length = chats.length;

        chats.sort((a, b) => b.unread - a.unread);

        return <div style={{ padding: '10px' }}>

            {loading && <Loading />}
            {!loading && length === 0 && <NoData loaded={true} />}
            {length > 0 && <List
                itemLayout="horizontal"
                dataSource={chats}
                renderItem={item => {
                    let { unread, chatUser = {}, latestIM = {} } = item;
                    let { id, name, avatar, online } = chatUser;
                    let { payload = {} } = latestIM;
                    return <List.Item
                        actions={[<a key="list-loadmore-edit" >聊天</a>]}
                        onClick={() => {
                            App.go('/chat/chat/' + encodeURIComponent(encodeURIComponent(JSON.stringify(chatUser))))
                        }}>
                        <List.Item.Meta
                            avatar={<Badge count={unread}>
                                <Avatar shape="square" src={avatar} size="large" style={online == 2 ? { filter: 'grayscale(100%)' } : {}} />
                            </Badge>}
                            title={name}
                            description={<span>{payload.text || '[图片]'}</span>}
                        />
                    </List.Item>
                }}
                locale={{ emptyText: '没有未读消息' }}
            />}
        </div>
    }
}
