import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as User } from '../../entities/User';
import { Collection as Companies } from '../../entities/Company';
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
    (new User({ id: params.id })).fetch({ success: m => dfd.resolve(m.get('username')) });
    return dfd.promise;
  }

  authorize() {
    return session.request('currentUser').get('role') === 'admin';
  }

  fetch({ params }) {
    this.user = new User({ id: params.id });
    this.companies = new Companies;
    return [this.user.fetch(), this.companies.fetch()];
  }

  render() {
    const user = this.user.toJSON();

    const companies = user.subjects.map(s => {
      const company = this.companies.findWhere({ fid: s });
      return company ? company.get('title') : s;
    });

    return (
      <div>
        <Helmet title={`Пользователь ${user.username}`} />
        <PageHeader>Пользователь {user.username}</PageHeader>
        <Row>
          <Col md={12}>
            <ul className="nav menu-nav-pills">
              <li>
                <NavLink to={`/users/${user.id}/edit`}>
                  <i className="fa fa-pencil-square-o" /> Редактировать
                </NavLink>
              </li>
              <li>
                <a
                  href="javascript:;"
                  onClick={() => {
                    Progress.show();
                    this.user.destroy({
                      success: () => {
                        Progress.hide();
                        router.request('navigate', 'users');
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
              <h4><Label>Логин</Label>{' '}
                {user.username}
              </h4>
              <h4><Label>Роль</Label>{' '}
                {user.role}
              </h4>
              <h4><Label>Предприятия</Label>{' '}
                {companies.length > 0 ? companies.join(', ') : 'Отсутствуют'}
              </h4>
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}
