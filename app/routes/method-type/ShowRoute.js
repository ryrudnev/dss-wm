import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as MethodType } from '../../entities/MethodType';
import { Deferred } from '../../util/utils';
import NavLink from '../../components/NavLink';
import Progress from 'react-progress-2';
import { PageHeader, Row, Col, Panel, Label } from 'react-bootstrap';
import radio from 'backbone.radio';

const router = radio.channel('router');
const session = radio.channel('session');

export default class MethodTypeShowRoute extends Route {
  breadcrumb({ params }) {
    const dfd = new Deferred;
    (new MethodType({ fid: params.fid })).fetch({ success: m => dfd.resolve(m.get('title')) });
    return dfd.promise;
  }

  fetch({ params }) {
    this.methodType = new MethodType({ fid: params.fid });
    return this.methodType.fetch();
  }

  render() {
    const isAdmin = session.request('currentUser').get('role') === 'admin';

    const methodType = this.methodType.toJSON();

    return (
      <div>
        <Helmet title={methodType.title} />
        <PageHeader>{methodType.title}</PageHeader>
        <Row>
          <Col md={12}>
            <ul className="nav menu-nav-pills">
              {!isAdmin ? '' : (
                <li>
                  <NavLink to={`/method-types/${methodType.fid}/edit`}>
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
                      this.methodType.destroy({
                        success: () => {
                          Progress.hide();
                          router.request('navigate', 'method-types');
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
                {methodType.title}
              </h4>
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
