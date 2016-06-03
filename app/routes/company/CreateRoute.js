import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as Company } from '../../entities/Company';
import { PageHeader, Row, Col, Panel } from 'react-bootstrap';
import CompanyForm from '../../components/CompanyForm';
import radio from 'backbone.radio';

const router = radio.channel('router');
const errors = radio.channel('errors');

export default class CompanyCreateRoute extends Route {
  breadcrumb = 'Создать предприятие'

  onCancel() {
    router.request('navigate', 'companies');
  }

  onSubmit(values) {
    (new Company(values)).save({}, {
      success: model => router.request('navigate', `companies/${model.id}`),
    });
  }

  onError(handler) {
    errors.on('error', handler);
  }

  render() {
    return (
      <div>
        <Helmet title="Создание предприятия" />
        <PageHeader>Создание предприятия</PageHeader>
        <Row>
          <Col md={8}>
            <Panel>
              <CompanyForm
                create
                onSubmit={this.onSubmit}
                onError={this.onError}
                onCancel={this.onCancel}
              />
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
