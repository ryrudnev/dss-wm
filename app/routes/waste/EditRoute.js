import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as Waste } from '../../entities/Waste';
import { Collection as WasteTypes } from '../../entities/WasteType';
import { PageHeader, Row, Col, Panel } from 'react-bootstrap';
import WasteForm from '../../components/WasteForm';
import Progress from 'react-progress-2';
import radio from 'backbone.radio';

const router = radio.channel('router');

export default class WasteEditRoute extends Route {
  breadcrumb = 'Редактировать'

  fetch({ params }) {
    this.companyFid = params.fid;

    this.waste = new Waste({ fid: params.wfid });
    this.waste.forSubjectParam(params.fid).expandParam('subtype');
    this.wasteTypes = new WasteTypes;
    this.wasteTypes.subtypesParam('SpecificWaste');
    return [this.waste.fetch(), this.wasteTypes.fetch()];
  }

  onCancel() {
    router.request('navigate', `companies/${this.companyFid}`);
  }

  onSubmit(values) {
    Progress.show();
    this.waste.save(values, {
      success: model => {
        Progress.hide();
        router.request('navigate', `companies/${this.companyFid}/waste/${model.id}`);
      },
    });
  }

  render() {
    const values = {
      ...this.waste.toJSON(),
      subtype: this.waste.get('subtype').fid,
    };

    return (
      <div>
        <Helmet title={`Редактирование отходов ${this.waste.get('title')}`} />
        <PageHeader>{`Редактирование отходов ${this.waste.get('title')}`}</PageHeader>
        <Row>
          <Col md={8}>
            <Panel>
              <WasteForm
                values={values}
                onSubmit={vals => this.onSubmit(vals)}
                onCancel={() => this.onCancel()}
                wasteTypes={this.wasteTypes.toJSON()}
              />
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
