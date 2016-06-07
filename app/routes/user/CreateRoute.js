import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as User } from '../../entities/User';
import { Collection as Companies } from '../../entities/Company';
import { PageHeader, Row, Col, Panel } from 'react-bootstrap';
import UserForm from '../../components/UserForm';
import Progress from 'react-progress-2';
import radio from 'backbone.radio';

const router = radio.channel('router');
const session = radio.channel('session');

export default class CompanyCreateRoute extends Route {
  breadcrumb = 'Создать'

  authorize() {
    return session.request('currentUser').get('role') === 'admin';
  }

  onCancel() {
    router.request('navigate', 'users');
  }

  fetch() {
    this.companies = new Companies;
    return this.companies.fetch();
  }

  onSubmit(values) {
    Progress.show();
    (new User(values)).save({}, {
      success: model => {
        Progress.hide();
        router.request('navigate', `users/${model.id}`);
      },
    });
  }

  render() {
    return (
      <div>
        <Helmet title="Регистрация нового пользователя" />
        <PageHeader>Регистрация нового пользователя</PageHeader>
        <Row>
          <Col md={8}>
            <Panel>
              <UserForm
                create
                onSubmit={this.onSubmit}
                onCancel={this.onCancel}
                companies={this.companies.toJSON()}
              />
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
