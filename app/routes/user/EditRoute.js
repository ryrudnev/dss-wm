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

export default class CompanyEditRoute extends Route {
  breadcrumb = 'Редактировать'

  authorize() {
    return session.request('currentUser').get('role') === 'admin';
  }

  fetch({ params }) {
    this.user = new User({ id: params.id });
    this.companies = new Companies;
    return [this.user.fetch(), this.companies.fetch()];
  }

  onCancel() {
    router.request('navigate', `users/${this.user.id}`);
  }

  onSubmit(values) {
    Progress.show();
    this.user.save(values, {
      success: model => {
        Progress.hide();
        router.request('navigate', `users/${model.id}`);
      },
    });
  }

  render() {
    const values = { ...this.user.toJSON() };

    return (
      <div>
        <Helmet title={`Редактирование пользователя ${values.username}`} />
        <PageHeader>{`Редактирование пользователя ${values.username}`}</PageHeader>
        <Row>
          <Col md={8}>
            <Panel>
              <UserForm
                values={values}
                onSubmit={vals => this.onSubmit(vals)}
                onCancel={() => this.onCancel()}
                companies={this.companies.toJSON()}
              />
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
