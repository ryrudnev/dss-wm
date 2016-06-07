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

export default class WasteEditRoute extends Route {
  breadcrumb = 'Редактировать'

  fetch({ params }) {
    this.companyFid = params.fid;

    this.method = new Method({ fid: params.mfid });
    this.method.forSubjectParam(params.fid).expandParam('subtype');
    this.methodTypes = new MethodTypes;
    return [this.method.fetch(), this.methodTypes.fetch()];
  }

  onCancel() {
    router.request('navigate', `companies/${this.companyFid}`);
  }

  onSubmit(values) {
    Progress.show();
    this.method.save(values, {
      success: model => {
        Progress.hide();
        router.request('navigate', `companies/${this.companyFid}/methods/${model.id}`);
      },
    });
  }

  render() {
    const values = {
      ...this.method.toJSON(),
      subtype: this.method.get('subtype').fid,
    };

    return (
      <div>
        <Helmet title={`Редактирование способа управления отходами ${values.title}`} />
        <PageHeader>{`Редактирование способа управления отходами ${values.title}`}</PageHeader>
        <Row>
          <Col md={8}>
            <Panel>
              <MethodForm
                values={values}
                onSubmit={vals => this.onSubmit(vals)}
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
