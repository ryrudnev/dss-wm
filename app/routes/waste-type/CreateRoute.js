import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as WasteType } from '../../entities/WasteType';
import { Collection as MethodTypes } from '../../entities/MethodType';
import { Collection as AggregateStates } from '../../entities/AggregateState';
import { Collection as Origins } from '../../entities/Origin';
import { Collection as HazardClasses } from '../../entities/HazardClass';
import { PageHeader, Row, Col, Panel } from 'react-bootstrap';
import WasteTypeForm from '../../components/WasteTypeForm';
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
    router.request('navigate', 'waste-types');
  }

  fetch() {
    this.methodTypes = new MethodTypes;
    this.aggregateStates = new AggregateStates;
    this.origins = new Origins;
    this.hazardClasses = new HazardClasses;
    return [
      this.methodTypes.fetch(),
      this.aggregateStates.fetch(),
      this.origins.fetch(),
      this.hazardClasses.fetch(),
    ];
  }

  onSubmit(values) {
    Progress.show();
    (new WasteType(values)).save({}, {
      success: model => {
        Progress.hide();
        router.request('navigate', `waste-types/${model.id}`);
      },
    });
  }

  render() {
    return (
      <div>
        <Helmet title="Создание вида отходов" />
        <PageHeader>Создание вида отходов</PageHeader>
        <Row>
          <Col md={8}>
            <Panel>
              <WasteTypeForm
                create
                onSubmit={this.onSubmit}
                onCancel={this.onCancel}
                origins={this.origins.toJSON()}
                hazardClasses={this.hazardClasses.toJSON()}
                aggregateStates={this.aggregateStates.toJSON()}
                methodTypes={this.methodTypes.toJSON()}
              />
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
