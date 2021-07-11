import React from 'react';
import '../assets/css/home-wrap.scss';
import { App, Utils } from "../common";
import NavLink from "../common/NavLink";

export default class HomeWrap extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        window.addEventListener('hashchange', () => {
            setTimeout(() => {
                Utils.common.scrollTop();
            }, 500);
        });
        if (window.location.hash.indexOf('signin') < 0) {
            let recycler = App.getRecyclerProfile();
            if (!recycler.id) {
                App.logout();
                App.go('/signin');
            } else {
                App.go('/home');
            }
        }
    }

    render() {
        return <div className='home-wrap'>
            <div className='inner-page'>
                {this.props.children}
            </div>

            <ul className='btm-menu'>
                <li><NavLink to='/home'><i className='home' /><p>首页</p></NavLink></li>
                <li className="grab"><NavLink to='/grab'><i className='grab' /></NavLink></li>
                <li><NavLink to='/profile'><i className='profile' /><p>个人中心</p></NavLink></li>
            </ul>
        </div>;
    }
}
