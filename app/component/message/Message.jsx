import React, { Component } from 'react';
import '../../assets/css/message/message.scss';
import { U } from '../../common';

export default class Message extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        U.setWXTitle("消息");
    }

    render() {
        return <div className="message-page">

        </div>
    }
}