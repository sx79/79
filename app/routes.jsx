import React from 'react';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
//首页
import HomeWrap from './component/HomeWrap';
import Home from './component/Home';
import Grab from './component/Grab';
import Profile from './component/Profile';
import Signin from './component/signin/Signin';

import Trades from './component/trade/Trades';
import Trade from './component/trade/Trade';

const routes = (
    <HashRouter>
        <Switch>

            <Redirect exact from='/' to='/home' />

            <Route path='/signin' exact component={Signin} />

            <Route path='/grab' component={Grab} />

            <Route path='/trades' component={Trades} />

            <Route path='/trade/:tradeId' component={Trade} />

            <Route path='/' children={() => (
                <HomeWrap>
                    <Switch>
                        <Route path='/home' component={Home} />
                        <Route path='/profile' component={Profile} />
                    </Switch>
                </HomeWrap>
            )}>
            </Route>
        </Switch>
    </HashRouter>
);

export default routes;
