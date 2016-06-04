import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as Company } from '../../entities/Company';
import { PageHeader, Row, Col, Panel } from 'react-bootstrap';
import CompanyForm from '../../components/CompanyForm';
import radio from 'backbone.radio';

const router = radio.channel('router');

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
                onCancel={this.onCancel}
              />
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
