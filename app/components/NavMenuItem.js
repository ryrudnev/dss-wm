import React, { PropTypes } from 'react';
import classNames from 'classnames';
import radio from 'backbone.radio';
import { MenuItem } from 'react-bootstrap';

const router = radio.channel('router');

const NavMenuItem = (props) => (
  <MenuItem
    {...props}
    href={props.to}
    className={classNames(props.className, 'nav-link')}
    onClick={(e) => {
      e.preventDefault();
      router.request('navigate', props.to);
    }}
  >
    {props.children}
  </MenuItem>
);
NavMenuItem.propTypes = {
  to: PropTypes.string.isRequired,
};

export default NavMenuItem;
