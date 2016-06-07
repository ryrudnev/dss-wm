import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import NavLink from './NavLink';

export default class NavSidebar extends Component {
  static contextTypes = {
    user: PropTypes.object,
  }

  state = {
    createMenuCollapsed: true,
  }

  onClickCreateMenu() {
    this.setState({ createMenuCollapsed: !this.state.createMenuCollapsed });
    return false;
  }

  render() {
    const isAdmin = this.context.user.get('role') === 'admin';

    return (
      <div {...this.props} className="navbar-default sidebar" role="navigation">
        <div className="sidebar-nav navbar-collapse">
          <ul className="nav in" id="side-menu">
            <li><NavLink to="/"> На главную</NavLink></li>
            <li>
              <a href="javascript:;" onClick={() => this.onClickCreateMenu()}>
                Создать <span className="fa arrow" />
              </a>
              <ul
                className={classNames({ 'nav nav-second-level': true,
                          collapse: this.state.createMenuCollapsed })}
              >
                <li><NavLink to="/companies/new">Предприятие</NavLink></li>
                {isAdmin ? <li>
                  <NavLink to="/waste-types/new">Вид отходов</NavLink></li> : ''}
                {isAdmin ? <li>
                  <NavLink to="/method-types/new">Вид управления отходами</NavLink></li> : ''}
                {isAdmin ? <li>
                  <NavLink to="/users/new">Пользователя</NavLink></li> : ''}
              </ul>
            </li>
            <li><NavLink to="/method-types">Виды управления отходами</NavLink></li>
            <li><NavLink to="/waste-types">Виды отходов</NavLink></li>
            <li><NavLink to="/companies">Предприятия</NavLink></li>
            {isAdmin ? <li><NavLink to="/users">Пользователи</NavLink></li> : ''}
          </ul>
        </div>
      </div>
    );
  }
}
