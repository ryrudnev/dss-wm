import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as Waste } from '../../entities/Waste';
import { Deferred } from '../../util/utils';
import NavLink from '../../components/NavLink';
import Progress from 'react-progress-2';
import { PageHeader, Row, Col, Panel, Label } from 'react-bootstrap';
import radio from 'backbone.radio';

const router = radio.channel('router');

export default class WasteShowRoute extends Route {
  breadcrumb({ params }) {
    const dfd = new Deferred;
    const waste = new Waste({ fid: params.wfid });
    waste.forSubjectParam(params.fid);
    waste.fetch({ success: m => dfd.resolve(`Отходы ${m.get('title')}`) });
    return dfd.promise;
  }

  fetch({ params }) {
    this.companyFid = params.fid;

    this.waste = new Waste({ fid: params.wfid });
    this.waste.forSubjectParam(params.fid).expandParam('subtype');
    return this.waste.fetch();
  }

  render() {
    const waste = this.waste.toJSON();

    return (
      <div>
        <Helmet title={waste.title} />
        <PageHeader>{waste.title}</PageHeader>
        <Row>
          <Col md={12}>
            <ul className="nav menu-nav-pills">
              <li>
                <NavLink
                  to={`/companies/${this.companyFid}/waste/${waste.fid}/edit`}
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
                        router.request('navigate', 'waste');
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
                {waste.title}
              </h4>
              <h4><Label>Тип отходов</Label>{' '}
                <NavLink to={`/waste-types/${waste.subtype.fid}`}>{waste.subtype.title}</NavLink>
              </h4>
              <h4><Label>Количество</Label>{' '}
                {waste.amount} т
              </h4>
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
