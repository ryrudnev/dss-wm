import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Collection as WasteTypes } from '../../entities/WasteType';
import { PageHeader, Row, Col } from 'react-bootstrap';
import NavLink from '../../components/NavLink';
import GridContainer from '../../components/GridContainer';
import Progress from 'react-progress-2';
import radio from 'backbone.radio';

const session = radio.channel('session');

export default class WasteTypeIndexRoute extends Route {
  breadcrumb = 'Просмотр видов отходов'

  fetch() {
    this.wasteTypes = new WasteTypes;
    return this.wasteTypes.subtypesParam('SpecificWaste').fetch();
  }

  render() {
    const isAdmin = session.request('currentUser').get('role') === 'admin';

    const actions = props => (
      <div>
        <NavLink to={`/waste-types/${props.rowData.fid}`} style={{ marginRight: '15px' }}>
          <i className="fa fa-eye" aria-hidden="true" />
        </NavLink>
        {!isAdmin ? '' : (
          <NavLink to={`/waste-types/${props.rowData.fid}/edit`} style={{ marginRight: '15px' }}>
            <i className="fa fa-pencil" aria-hidden="true" />
          </NavLink>
        )}
        {!isAdmin ? '' : (
          <a
            href="javascript:;"
            onClick={() => {
              Progress.show();
              const model = this.wasteTypes.findWhere({ fid: props.rowData.fid });
              model.destroy({ wait: true, success: () => Progress.hide() });
            }}
          >
            <i className="fa fa-ban" aria-hidden="true" />
          </a>
        )}
      </div>
    );

    return (
      <div>
        <Helmet title="Виды отходов" />
        <PageHeader>Виды отходов</PageHeader>
        <ul className="nav menu-nav-pills">
          {!isAdmin ? '' : (
            <li>
              <NavLink to="/waste-types/new">
                <i className="fa fa-plus-square" aria-hidden="true" /> Добавить
              </NavLink>
            </li>
          )}
        </ul>
        <Row>
          <Col md={12}>
            <GridContainer
              collection={this.wasteTypes}
              columns={['fid', 'title']}
              columnMetadata={[
                { columnName: 'title', order: 1, displayName: 'Название' },
                {
                  order: 2,
                  displayName: 'Действия',
                  columnName: 'fid',
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
