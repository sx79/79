import React from 'react';
import '../../assets/css/signin/signin.scss';
import { App, U, CTYPE } from '../../common';
import { Input } from 'antd';
import { Button, Toast } from 'antd-mobile';
import { span } from 'prelude-ls';

export default class Signin extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            valCode: {
                userType: CTYPE.userType.user,
                accountType: CTYPE.accountType.mobile
            },
            count: 60,
            disabled: false
        };
    }

    componentDidMount() {
        U.setWXTitle("登陆");
    }

    sendValCode = () => {
        let { valCode = {} } = this.state;
        valCode.key = new Date().getTime();
        App.api('/common/gen_valCode', {
            valCode: JSON.stringify({ ...valCode })
        }).then(() => {
            this.startTimer();
            this.setState({
                disabled: true
            });
            Toast.success(<span>验证码发送成功请注意查收</span>);
        });
    }

    startTimer = () => {
        this.timerId = setInterval(() => {
            let { count } = this.state;
            if (count - 1 <= 0) {
                this.setState({
                    count: 60,
                    disabled: false
                });
                clearInterval(this.timerId);
            } else {
                this.setState({
                    count: count - 1,
                    disabled: true
                });
            }
        }, 1000);
    }

    modValCode = (field, val) => {
        let { valCode = {} } = this.state;
        valCode[field] = val;
        this.setState({ valCode });
    }

    signin = () => {
        let { recycler = {}, valCode = {} } = this.state;
        let { code, account } = valCode;
        if (U.str.isEmpty(account)) {
            Toast.fail(<span>请输入手机号</span>);
            return;
        }
        if (U.str.isEmpty(code)) {
            Toast.fail(<span>请输入验证码</span>);
            return;
        }
        App.api('recy/recycler/signin', {
            recycler: JSON.stringify(recycler),
            valCode: JSON.stringify(valCode)
        }).then(res => {
            let { recycler = {}, session = {} } = res;
            App.saveCookie('recycler-profile', JSON.stringify(recycler));
            App.saveCookie('recycler-token', session.token);
            App.go('');
        })
    };

    render() {
        let { valCode = {}, recycler = {}, disabled, count } = this.state;
        let { account = '', code = '' } = valCode;
        let isMobile = U.str.isChinaMobile(account);
        return <div className='signin-page'>
            <div className="signin-form">
                <img src={require('../../assets/image/common/logo.png')} />
                <p>易货回收员端</p>
                <div className="signin-content">
                    <div className="line">
                        <label>账&#12288;户</label>
                        <input type="text" placeholder="请输入账户或手机号" onChange={e => {
                            this.modValCode('account', e.target.value);
                        }} />
                    </div>
                    <div className="line" >
                        <label>验证码</label>
                        <input type="text" className="input-valcode" placeholder="请输入验证码" onChange={(e) => this.modValCode('code', e.target.value)} />
                        <div className="btn-valcode"><span onClick={() => {
                            if (!isMobile) {
                                Toast.fail(<span>请输入正确的手机号</span>);
                            }
                            return isMobile && !disabled && this.sendValCode();
                        }}>{disabled ? `${count}秒后获取` : '获取验证码'}</span></div>
                    </div>
                    <button className="btn-sign" onClick={() => {
                        this.signin()
                    }}>登陆</button>
                </div>
            </div>
        </div>;
    }
}
