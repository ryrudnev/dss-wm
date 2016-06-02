import React, { PropTypes } from 'react';
import classNames from 'classnames';
import radio from 'backbone.radio';

const router = radio.channel('router');

const NavLink = (props) => (
  <a
    {...props}
    href={props.to}
    className={classNames(props.className, 'nav-link')}
    onClick={(e) => {
      e.preventDefault();
      router.request('navigate', props.to);
    }}
  >
    {props.children}
  </a>
);
NavLink.propTypes = {
  to: PropTypes.string.isRequired,
};

export default NavLink;
