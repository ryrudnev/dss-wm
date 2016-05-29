import React from 'react';
import Helmet from 'react-helmet';
import { Route, NavLink } from '../../core/router';
import { Col } from 'react-bootstrap';


export default class NotfoundRoute extends Route {
  dashboard = false

  render() {
    return (
      <div>
        <Helmet title="Страница или ресурсы не найдены" />
        <Col md={4} mdOffset={4}>
          <div className="text-center">
            <h1 className="login-brand-text">404</h1>
            <h3 className="text-muted">Страница или ресурсы не найдены!</h3>
            <h4>Вернуться на <NavLink url="/" text="главную" /></h4>
          </div>
        </Col>
      </div>
    );
  }
}
