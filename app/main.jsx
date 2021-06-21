import React from 'react';
import ReactDOM from 'react-dom';
import routers from './routes';
import { LocaleProvider } from 'antd-mobile';
import 'assets/css/common.scss';

if (module.hot)
    module.hot.accept();

ReactDOM.render(
    <LocaleProvider>{routers}</LocaleProvider>, document.getElementById('root'));
