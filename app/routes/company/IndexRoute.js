import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Collection as Companies } from '../../entities/Company';
import { PageHeader, Row, Col, ButtonToolbar, Button } from 'react-bootstrap';
import NavLink from '../../components/NavLink';
import GridContainer from '../../components/GridContainer';
import Progress from 'react-progress-2';

export default class CompanyIndexRoute extends Route {
  breadcrumb = 'Предприятия'

  fetch() {
    this.companies = new Companies;
    return this.companies.fetch();
  }

  render() {
    const actions = props => (
      <ButtonToolbar>
        <NavLink
          to={`companies/${props.rowData.fid}`}
          className="btn btn-sm btn-info" role="button"
        >
          Просмотр
        </NavLink>
        <NavLink
          to={`companies/${props.rowData.fid}/edit`}
          className="btn btn-sm btn-primary" role="button"
        >
          Изменить
        </NavLink>
        <Button
          bsStyle="danger" bsSize="small"
          onClick={() => {
            Progress.show();
            const model = this.companies.findWhere({ fid: props.rowData.fid });
            model.destroy({ wait: true, success: () => Progress.hide() });
          }}
        >
          Удалить
        </Button>
      </ButtonToolbar>
    );

    const coordinates = props => (<span>[{props.rowData.coordinates.join(', ')}]</span>);

    return (
      <div>
        <Helmet title="Предприятия" />
        <PageHeader>Предприятия</PageHeader>
        <Row>
          <Col md={12}>
            <NavLink to="companies/new" className="btn btn-primary" role="button">
              Создать
            </NavLink>
          </Col>
        </Row>
        <Row style={{ marginTop: '20px' }}>
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
