import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as WastType } from '../../entities/WasteType';
import { Deferred } from '../../util/utils';
import NavLink from '../../components/NavLink';
import Progress from 'react-progress-2';
import { PageHeader, Row, Col, Panel, Label } from 'react-bootstrap';
import radio from 'backbone.radio';

const router = radio.channel('router');
const session = radio.channel('session');

export default class WasteTypeShowRoute extends Route {
  breadcrumb({ params }) {
    const dfd = new Deferred;
    (new WastType({ fid: params.fid })).fetch({ success: m => dfd.resolve(m.get('title')) });
    return dfd.promise;
  }

  fetch({ params }) {
    this.wastType = new WastType({ fid: params.fid });
    return this.wastType.expandParam('waste,methods').fetch();
  }

  render() {
    const isAdmin = session.request('currentUser').get('role') === 'admin';

    const wasteType = this.wastType.toJSON();

    return (
      <div>
        <Helmet title={`Вид отходов ${wasteType.title}`} />
        <PageHeader>{`Вид отходов ${wasteType.title}`}</PageHeader>
        <Row>
          <Col md={12}>
            <ul className="nav menu-nav-pills">
              {!isAdmin ? '' : (
                <li>
                  <NavLink to={`/waste-types/${wasteType.fid}/edit`}>
                    <i className="fa fa-pencil-square-o" /> Редактировать
                  </NavLink>
                </li>
              )}
              {!isAdmin ? '' : (
                <li>
                  <a
                    href="javascript:;"
                    onClick={() => {
                      Progress.show();
                      this.wastType.destroy({
                        success: () => {
                          Progress.hide();
                          router.request('navigate', 'waste-types');
                        },
                      });
                    }}
                  >
                    <i className="fa fa-ban" aria-hidden="true" /> Удалить
                  </a>
                </li>
              )}
            </ul>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Panel>
              <h4><Label>Название</Label>{' '}
                {wasteType.title}
              </h4>
              <h4><Label>Агрегатное состояние</Label>{' '}
                {wasteType.aggregateState.title}
              </h4>
              <h4><Label>Класс опасности</Label>{' '}
                {wasteType.hazardClass.title}
              </h4>
              <h4><Label>Происхождение</Label>{' '}
                {wasteType.origins.map(el => el.title).join(', ')}
              </h4>
              <h4><Label>Возможные способы управления</Label>{' '}
                {wasteType.methods.map(el => el.title).join(', ')}
              </h4>
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
