import React from 'react';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
//首页
import HomeWrap from './component/HomeWrap';
import Home from './component/Home';
import Products from './component/Products';
import Profile from './component/Profile';
import Signin from './component/signin/Signin';

const routes = (
    <HashRouter>
        <Switch>

            <Redirect exact from='/' to='/home' />

            <Route path='/signin' exact component={Signin} />

            <Route path='/' children={() => (
                <HomeWrap>
                    <Switch>
                        <Route path='/home' component={Home} />
                        <Route path='/products' component={Products} />
                        <Route path='/profile' component={Profile} />
                    </Switch>
                </HomeWrap>
            )}>
            </Route>
        </Switch>
    </HashRouter>
);

export default routes;
