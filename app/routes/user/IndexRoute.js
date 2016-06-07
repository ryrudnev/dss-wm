import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Collection as Users } from '../../entities/User';
import { PageHeader, Row, Col } from 'react-bootstrap';
import NavLink from '../../components/NavLink';
import GridContainer from '../../components/GridContainer';
import Progress from 'react-progress-2';
import radio from 'backbone.radio';

const session = radio.channel('session');

export default class MethodTypeIndexRoute extends Route {
  breadcrumb = 'Просмотр пользователей'

  authorize() {
    return session.request('currentUser').get('role') === 'admin';
  }

  fetch() {
    this.users = new Users;
    return this.users.fetch();
  }

  render() {
    const actions = props => (
      <div>
        <NavLink to={`/users/${props.rowData.id}`} style={{ marginRight: '15px' }}>
          <i className="fa fa-eye" aria-hidden="true" />
        </NavLink>
        <NavLink to={`/users/${props.rowData.id}/edit`} style={{ marginRight: '15px' }}>
          <i className="fa fa-pencil" aria-hidden="true" />
        </NavLink>
        <a
          href="javascript:;"
          onClick={() => {
            Progress.show();
            const model = this.users.findWhere({ id: props.rowData.id });
            model.destroy({ wait: true, success: () => Progress.hide() });
          }}
        >
          <i className="fa fa-ban" aria-hidden="true" />
        </a>
      </div>
    );

    return (
      <div>
        <Helmet title="Пользователи" />
        <PageHeader>Пользователи</PageHeader>
        <ul className="nav menu-nav-pills">
          <li>
            <NavLink to="/users/new">
              <i className="fa fa-plus-square" aria-hidden="true" /> Зарегистрировать
            </NavLink>
          </li>
        </ul>
        <Row>
          <Col md={12}>
            <GridContainer
              collection={this.users}
              columns={['id', 'username', 'role']}
              columnMetadata={[
                { columnName: 'username', order: 1, displayName: 'Логин' },
                { columnName: 'role', order: 2, displayName: 'Роль' },
                { columnName: 'subjects', order: 3, displayName: 'Компании', visible: false },
                {
                  order: 4,
                  displayName: 'Действия',
                  columnName: 'id',
                  sortable: false,
                  customComponent: actions,
                },
              ]}
            />
          </Col>
        </Row>
      </div>
    );
  }
}
