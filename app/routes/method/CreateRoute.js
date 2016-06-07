import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as Method } from '../../entities/Method';
import { Collection as MethodTypes } from '../../entities/MethodType';
import { PageHeader, Row, Col, Panel } from 'react-bootstrap';
import MethodForm from '../../components/MethodForm';
import Progress from 'react-progress-2';
import radio from 'backbone.radio';

const router = radio.channel('router');

export default class MethodCreateRoute extends Route {
  breadcrumb = 'Создать способ управления отходами'

  onCancel() {
    router.request('navigate', `companies/${this.companyFid}`);
  }

  fetch({ params }) {
    this.companyFid = params.fid;

    this.methodTypes = new MethodTypes;
    return this.methodTypes.fetch();
  }

  onSubmit(values) {
    Progress.show();
    const method = new Method(values);
    method.forSubjectParam(this.companyFid);
    method.save({}, {
      success: model => {
        Progress.hide();
        router.request('navigate', `companies/${this.companyFid}/methods/${model.id}`);
      },
    });
  }

  render() {
    return (
      <div>
        <Helmet title="Создание способа управления отходами" />
        <PageHeader>Создание способа управления отходами</PageHeader>
        <Row>
          <Col md={8}>
            <Panel>
              <MethodForm
                create
                onSubmit={(values) => this.onSubmit(values)}
                onCancel={() => this.onCancel()}
                methodTypes={this.methodTypes.toJSON()}
              />
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
