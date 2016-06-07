import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as Method } from '../../entities/Method';
import { Deferred } from '../../util/utils';
import NavLink from '../../components/NavLink';
import Progress from 'react-progress-2';
import { PageHeader, Row, Col, Panel, Label } from 'react-bootstrap';
import radio from 'backbone.radio';

const router = radio.channel('router');

export default class MethodShowRoute extends Route {
  breadcrumb({ params }) {
    const dfd = new Deferred;
    const method = new Method({ fid: params.mfid });
    method.forSubjectParam(params.fid);
    method.fetch({ success: m => dfd.resolve(m.get('title')) });
    return dfd.promise;
  }

  fetch({ params }) {
    this.companyFid = params.fid;

    this.method = new Method({ fid: params.mfid });
    this.method.forSubjectParam(params.fid).expandParam('subtype');
    return this.method.fetch();
  }

  render() {
    const method = this.method.toJSON();

    return (
      <div>
        <Helmet title={method.title} />
        <PageHeader>{method.title}</PageHeader>
        <Row>
          <Col md={12}>
            <ul className="nav menu-nav-pills">
              <li>
                <NavLink
                  to={`/companies/${this.companyFid}/methods/${method.fid}/edit`}
                >
                  <i className="fa fa-pencil-square-o" /> Редактировать
                </NavLink>
              </li>
              <li>
                <a
                  href="javascript:;"
                  onClick={() => {
                    Progress.show();
                    this.waste.destroy({
                      success: () => {
                        Progress.hide();
                        router.request('navigate', `companies/${this.companyFid}`);
                      },
                    });
                  }}
                >
                  <i className="fa fa-ban" aria-hidden="true" /> Удалить
                </a>
              </li>
            </ul>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Panel>
              <h4><Label>Название</Label>{' '}
                {method.title}
              </h4>
              <h4><Label>Вид управления отходами</Label>{' '}
                <NavLink to={`/method-types/${method.subtype.fid}`}>{method.subtype.title}</NavLink>
              </h4>
              <h4><Label>Стоимость</Label>{' '}
                {method.costByService} р
              </h4>
              <h4><Label>Стоимость на кг.</Label>{' '}
                {method.costOnWeight} р
              </h4>
              <h4><Label>Стоимость на км.</Label>{' '}
                {method.costOnDistance} р
              </h4>
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
