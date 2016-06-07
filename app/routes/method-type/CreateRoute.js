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

export default class MethodCreateRoute extends Route {
  breadcrumb = 'Создать'

  authorize() {
    return session.request('currentUser').get('role') === 'admin';
  }

  onCancel() {
    router.request('navigate', 'method-types');
  }

  onSubmit(values) {
    Progress.show();
    (new MethodType(values)).save({}, {
      success: model => {
        Progress.hide();
        router.request('navigate', `method-types/${model.id}`);
      },
    });
  }

  render() {
    return (
      <div>
        <Helmet title="Создание вида управления отходами" />
        <PageHeader>Создание вида управления отходами</PageHeader>
        <Row>
          <Col md={8}>
            <Panel>
              <MethodTypeForm
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
