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

export default class CompanyEditRoute extends Route {
  breadcrumb = 'Редактировать'

  fetch({ params }) {
    this.wasteType = new WasteType({ fid: params.fid });
    this.methodTypes = new MethodTypes;
    this.aggregateStates = new AggregateStates;
    this.origins = new Origins;
    this.hazardClasses = new HazardClasses;
    return [
      this.wasteType.fetch(),
      this.methodTypes.fetch(),
      this.aggregateStates.fetch(),
      this.origins.fetch(),
      this.hazardClasses.fetch(),
    ];
  }

  onCancel() {
    router.request('navigate', `waste-types/${this.wasteType.id}`);
  }

  onSubmit(values) {
    Progress.show();
    this.wasteType.save(values, {
      success: model => {
        Progress.hide();
        router.request('navigate', `waste-types/${model.id}`);
      },
    });
  }

  render() {
    const values = {
      ...this.wasteType.toJSON(),
      aggregateState: this.wasteType.get('aggregateState').fid,
      hazardClass: this.wasteType.get('hazardClass').fid,
      origins: this.wasteType.get('origins').map(el => el.fid),
      methods: this.wasteType.get('methods').map(el => el.fid),
    };

    return (
      <div>
        <Helmet title={`Редактирование вида отходов ${this.wasteType.get('title')}`} />
        <PageHeader>{`Редактирование вида отходов ${this.wasteType.get('title')}`}</PageHeader>
        <Row>
          <Col md={8}>
            <Panel>
              <WasteTypeForm
                values={values}
                onSubmit={vals => this.onSubmit(vals)}
                onCancel={() => this.onCancel()}
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
