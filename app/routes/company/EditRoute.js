import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as Company } from '../../entities/Company';
import { PageHeader, Row, Col, Panel } from 'react-bootstrap';
import CompanyForm from '../../components/CompanyForm';
import radio from 'backbone.radio';

const router = radio.channel('router');
const errors = radio.channel('errors');

export default class CompanyEditRoute extends Route {
  breadcrumb = 'Изменить'

  fetch({ params }) {
    this.company = new Company({ fid: params.fid });
    return this.company.fetch();
  }

  onCancel() {
    router.request('navigate', `companies/${this.company.id}`);
  }

  onSubmit(values) {
    this.company.save(values, {
      success: model => router.request('navigate', `companies/${model.id}`),
    });
  }

  onError(handler) {
    errors.on('error', handler);
  }

  render() {
    return (
      <div>
        <Helmet title={`Изменить предприятие ${this.company.get('title')}`} />
        <PageHeader>{`Изменить предприятие ${this.company.get('title')}`}</PageHeader>
        <Row>
          <Col md={8}>
            <Panel>
              <CompanyForm
                values={this.company.toJSON()}
                onSubmit={(values) => this.onSubmit(values)}
                onError={this.onError}
                onCancel={() => this.onCancel()}
              />
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
