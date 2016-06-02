import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Col } from 'react-bootstrap';
import NavLink from '../../components/NavLink';

export default class NotauthorizedRoute extends Route {
  dashboard = false

  render() {
    return (
      <div>
        <Helmet title="Доступ запрещен" />
        <Col md={4} mdOffset={4}>
          <div className="text-center">
            <h1 className="login-brand-text">403</h1>
            <h3 className="text-muted">Доступ запрещен!</h3>
            <h4>Вернуться на <NavLink to="/">главную</NavLink></h4>
          </div>
        </Col>
      </div>
    );
  }
}
