import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Collection as Companies } from '../../entities/Company';
import { PageHeader, Row, Col } from 'react-bootstrap';
import NavLink from '../../components/NavLink';
import GridContainer from '../../components/GridContainer';
import Progress from 'react-progress-2';

export default class CompanyIndexRoute extends Route {
  breadcrumb = 'Просмотр предприятий'

  fetch() {
    this.companies = new Companies;
    return this.companies.fetch();
  }

  render() {
    const actions = props => (
      <div>
        <NavLink to={`/companies/${props.rowData.fid}`} style={{ marginRight: '15px' }}>
          <i className="fa fa-eye" aria-hidden="true" />
        </NavLink>
        <NavLink to={`/companies/${props.rowData.fid}/edit`} style={{ marginRight: '15px' }}>
          <i className="fa fa-pencil" aria-hidden="true" />
        </NavLink>
        <a
          href="javascript:;"
          onClick={() => {
            Progress.show();
            const model = this.companies.findWhere({ fid: props.rowData.fid });
            model.destroy({ wait: true, success: () => Progress.hide() });
          }}
        >
          <i className="fa fa-ban" aria-hidden="true" />
        </a>
      </div>
    );

    const coordinates = props => (<span>[{props.rowData.coordinates.join(', ')}]</span>);

    return (
      <div>
        <Helmet title="Предприятия" />
        <PageHeader>Предприятия</PageHeader>
        <ul className="nav menu-nav-pills">
          <li>
            <NavLink to="/companies/new">
              <i className="fa fa-plus-square" aria-hidden="true" /> Добавить
            </NavLink>
          </li>
        </ul>
        <Row>
          <Col md={12}>
            <GridContainer
              collection={this.companies}
              columns={['fid', 'title', 'budget']}
              columnMetadata={[
                { columnName: 'title', order: 1, displayName: 'Название' },
                { columnName: 'budget', order: 2, displayName: 'Бюджет' },
                { columnName: 'type', order: 4, displayName: 'Тип', visible: false },
                {
                  order: 5,
                  displayName: 'Действия',
                  columnName: 'fid',
                  sortable: false,
                  customComponent: actions,
                },
                {
                  order: 3,
                  columnName: 'coordinates',
                  displayName: 'Координаты',
                  customComponent: coordinates,
                },
              ]}
            />
          </Col>
        </Row>
      </div>
    );
  }
}
