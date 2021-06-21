import React from 'react';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
//首页
import HomeWrap from './component/HomeWrap';
import Home from './component/Home';
import Store from './component/Store';
import Cates from './component/Cates';
import Products from './component/Products';
import Product from './component/Product';
import Profile from './component/Profile';

const routes = (
    <HashRouter>
        <Switch>

            <Redirect exact from='/' to='/home' />

            <Route path='/cates' component={Cates} />
            <Route path='/product/:id' component={Product} />

            <Route path='/' children={() => (
                <HomeWrap>
                    <Switch>
                        <Route path='/home' component={Home} />
                        <Route path='/store' component={Store} />
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
