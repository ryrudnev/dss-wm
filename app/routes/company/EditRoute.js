import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as Company } from '../../entities/Company';
import { PageHeader, Row, Col, Panel } from 'react-bootstrap';
import CompanyForm from '../../components/CompanyForm';
import Progress from 'react-progress-2';
import radio from 'backbone.radio';

const router = radio.channel('router');

export default class CompanyEditRoute extends Route {
  breadcrumb = 'Редактировать'

  fetch({ params }) {
    this.company = new Company({ fid: params.fid });
    return this.company.fetch();
  }

  onCancel() {
    router.request('navigate', `companies/${this.company.id}`);
  }

  onSubmit(values) {
    Progress.show();
    this.company.save(values, {
      success: model => {
        Progress.hide();
        router.request('navigate', `companies/${model.id}`);
      },
    });
  }

  render() {
    return (
      <div>
        <Helmet title={`Редактирование предприятия ${this.company.get('title')}`} />
        <PageHeader>{`Редактирование предприятия ${this.company.get('title')}`}</PageHeader>
        <Row>
          <Col md={8}>
            <Panel>
              <CompanyForm
                values={this.company.toJSON()}
                onSubmit={(values) => this.onSubmit(values)}
                onCancel={() => this.onCancel()}
              />
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
