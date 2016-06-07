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

export default class WasteCreateRoute extends Route {
  breadcrumb = 'Создать отходы'

  onCancel() {
    router.request('navigate', `companies/${this.companyFid}`);
  }

  fetch({ params }) {
    this.companyFid = params.fid;

    this.wasteTypes = new WasteTypes;
    this.wasteTypes.subtypesParam('SpecificWaste');
    return this.wasteTypes.fetch();
  }

  onSubmit(values) {
    Progress.show();
    const waste = new Waste(values);
    waste.forSubjectParam(this.companyFid);
    waste.save({}, {
      success: model => {
        Progress.hide();
        router.request('navigate', `companies/${this.companyFid}/waste/${model.id}`);
      },
    });
  }

  render() {
    return (
      <div>
        <Helmet title="Создание отходов" />
        <PageHeader>Создание отходов</PageHeader>
        <Row>
          <Col md={8}>
            <Panel>
              <WasteForm
                create
                onSubmit={(values) => this.onSubmit(values)}
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
