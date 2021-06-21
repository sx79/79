import React from 'react';
import { Link } from 'react-router-dom';

let to = location.hash.split('#')[1];
addEventListener('hashchange', (e) => {
    to = location.hash.split('#')[1];
});

if (to === '/') {
    to = '/home';
}

const NavLink = (props) => <Link
    onClick={() => {
        if (!to || (to && to !== props.to)) {
            to = props.to;
        }
    }} {...props} className={to === props.to ? 'active' : props.className}
/>;

export default NavLink;
