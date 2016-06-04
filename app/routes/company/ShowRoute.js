import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as Company } from '../../entities/Company';
import NavLink from '../../components/NavLink';
import { Deferred } from '../../util/utils';
import GridContainer from '../../components/GridContainer';
import {
  PageHeader, Row, Col, Button, ButtonToolbar, Tabs, Panel, Label, Tab,
} from 'react-bootstrap';
import Progress from 'react-progress-2';
import radio from 'backbone.radio';

const router = radio.channel('router');

export default class CompanyShowRoute extends Route {
  breadcrumb({ params }) {
    const dfd = new Deferred;
    (new Company({ fid: params.fid })).fetch({ success: model => dfd.resolve(model.get('title')) });
    return dfd.promise;
  }

  fetch({ params }) {
    this.company = new Company({ fid: params.fid });
    return this.company.expandParam('waste,methods').fetch();
  }

  search() {

  }

  delete() {
    Progress.show();
    this.company.destroy({
      success: () => {
        Progress.hide();
        router.request('navigate', 'companies');
      },
    });
  }

  render() {
    const { company } = this;

    const WasteGrid = () => (
      <GridContainer
        collection={company.get('waste')}
        columns={['amount', 'fid', 'title']}
        columnMetadata={[
          { columnName: 'title', order: 1, displayName: 'Название' },
          { columnName: 'amount', order: 2, displayName: 'Количество' },
          {
            order: 3,
            displayName: 'Действия',
            columnName: 'fid',
            sortable: false,
            customComponent: props => (
              <ButtonToolbar>
                <NavLink
                  to={`waste/${props.rowData.fid}`}
                  className="btn btn-sm btn-info" role="button"
                >
                  Просмотр
                </NavLink>
                <NavLink
                  to={`waste/${props.rowData.fid}/edit`}
                  className="btn btn-sm btn-success" role="button"
                >
                  Изменить
                </NavLink>
                <Button
                  bsStyle="danger" bsSize="small"
                  onClick={() => {
                    Progress.show();
                    const model = company.get('waste').findWhere({ fid: props.rowData.fid });
                    model.forSubjectParam(company.id);
                    model.destroy({ wait: true, success: () => Progress.hide() });
                  }}
                >
                  Удалить
                </Button>
              </ButtonToolbar>
            ),
          },
        ]}
      />
    );

    const MethodGrid = () => (
      <GridContainer
        collection={company.get('methods')}
        columns={['fid', 'title', 'costOnWeight', 'costOnDistance', 'costByService']}
        columnMetadata={[
          { columnName: 'title', order: 1, displayName: 'Название' },
          { columnName: 'costOnWeight', order: 2, displayName: 'Стоимость на 1 кг.' },
          { columnName: 'costOnDistance', order: 3, displayName: 'Стоимость на 1 км.' },
          { columnName: 'costByService', order: 4, displayName: 'Стоимость услуги' },
          {
            order: 5,
            displayName: 'Действия',
            columnName: 'fid',
            sortable: false,
            customComponent: props => (
              <ButtonToolbar>
                <NavLink
                  to={`methods/${props.rowData.fid}`}
                  className="btn btn-sm btn-info" role="button"
                >
                  Просмотр
                </NavLink>
                <NavLink
                  to={`methods/${props.rowData.fid}/edit`}
                  className="btn btn-sm btn-success" role="button"
                >
                  Изменить
                </NavLink>
                <Button
                  bsStyle="danger" bsSize="small"
                  onClick={() => {
                    Progress.show();
                    const model = company.get('methods').findWhere({ fid: props.rowData.fid });
                    model.forSubjectParam(company.id);
                    model.destroy({ wait: true, success: () => Progress.hide() });
                  }}
                >
                  Удалить
                </Button>
              </ButtonToolbar>
            ),
          },
        ]}
      />
    );

    return (
      <div>
        <Helmet title={`Предприятие ${company.get('title')}`} />
        <PageHeader>{`Просмотр предприятия ${company.get('title')}`}</PageHeader>
        <Row>
          <Col md={12}>
            <ButtonToolbar>
              <Button bsStyle="primary" onClick={() => this.search()}>
                Найти стратегию
              </Button>
              <NavLink
                to={`companies/${company.id}/edit`}
                className="btn btn-success" role="button"
              >
                Изменить
              </NavLink>
              <Button bsStyle="danger" onClick={() => this.delete()}>
                Удалить
              </Button>
            </ButtonToolbar>
          </Col>
        </Row>
        <Row style={{ marginTop: '20px' }}>
          <Col md={12}>
            <Panel>
              <h4><Label>Координаты</Label> [{company.get('coordinates').join(', ')}]</h4>
              <h4><Label>Бюджет</Label> {company.get('budget')}</h4>
            </Panel>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Tabs className="company-tabs">
              <Tab eventKey={1} title="Отходы">
                <Row style={{ marginTop: '20px' }}>
                  <Col md={12}>
                    <NavLink
                      to={`waste/new?forSubject=${company.id}`}
                      className="btn btn-primary" role="button"
                    >
                      Создать
                    </NavLink>
                  </Col>
                </Row>
                <Row style={{ marginTop: '20px' }}>
                  <Col md={12}>
                    <WasteGrid />
                  </Col>
                </Row>
              </Tab>
              <Tab eventKey={2} title="Методы">
                <Row style={{ marginTop: '20px' }}>
                  <Col md={12}>
                    <NavLink
                      to={`methods/new?forSubject=${company.id}`}
                      className="btn btn-primary" role="button"
                    >
                      Создать
                    </NavLink>
                  </Col>
                </Row>
                <Row style={{ marginTop: '20px' }}>
                  <Col md={12}>
                    <MethodGrid />
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </div>
    );
  }
}

