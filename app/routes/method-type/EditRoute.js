import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as MethodType } from '../../entities/MethodType';
import { PageHeader, Row, Col, Panel } from 'react-bootstrap';
import MethodTypeForm from '../../components/MethodTypeForm';
import Progress from 'react-progress-2';
import radio from 'backbone.radio';

const router = radio.channel('router');
const session = radio.channel('session');

export default class MethodEditRoute extends Route {
  breadcrumb = 'Редактировать'

  authorize() {
    return session.request('currentUser').get('role') === 'admin';
  }

  fetch({ params }) {
    this.methodType = new MethodType({ fid: params.fid });
    return this.methodType.fetch();
  }

  onCancel() {
    router.request('navigate', `method-types/${this.methodType.id}`);
  }

  onSubmit(values) {
    Progress.show();
    this.methodType.save(values, {
      success: model => {
        Progress.hide();
        router.request('navigate', `method-types/${model.id}`);
      },
    });
  }

  render() {
    const values = { ...this.methodType.toJSON() };

    return (
      <div>
        <Helmet title={`Редактирование вида управления отходами ${values.title}`} />
        <PageHeader>{`Редактирование вида управления отходами ${values.title}`}</PageHeader>
        <Row>
          <Col md={8}>
            <Panel>
              <MethodTypeForm
                values={values}
                onSubmit={vals => this.onSubmit(vals)}
                onCancel={() => this.onCancel()}
              />
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
