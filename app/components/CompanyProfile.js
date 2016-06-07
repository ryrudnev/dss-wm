import React, { Component, PropTypes } from 'react';
import Progress from 'react-progress-2';
import GridContainer from './GridContainer';
import NavLink from './NavLink';
import {
  Row, Col, Button, Tabs,
  Panel, Label, Tab, Modal, ListGroup, ListGroupItem,
} from 'react-bootstrap';


export default class CompanyProfile extends Component {
  static propTypes = {
    onDelete: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    company: PropTypes.object,
  }

  state = { strategy: null }

  search() {
    Progress.show();
    this.props.onSearch(strategy => {
      Progress.hide();
      this.setState({ strategy });
    });
  }

  createWasteItem({ fid, title, amount }, i) {
    const { company } = this.props;
    return (
      <ListGroupItem key={i + 1}>
        <Label>Название</Label>{' '}
        <NavLink to={`/companies/${company.id}/waste/${fid}`}>{title}</NavLink><br />
        <Label>Количество</Label>{' '}{amount} т
      </ListGroupItem>
    );
  }

  createMethod({ fid, subject, title, costByService, costOnDistance, costOnWeight, distance }) {
    const { company } = this.props;
    return (
      <div>
        <Label>Название</Label>{' '}
        <NavLink to={`/companies/${company.id}/methods/${fid}`}>{title}</NavLink><br />
        {subject == null ? '' : (
          <span>
            <Label>Предприятие</Label>{' '}
            <NavLink to={`/companies/${subject.fid}`}>{subject.title}</NavLink>
            <br />
          </span>
        )}
        {distance == null ? '' : (<span><Label>Расстояние</Label>{' '}{distance} км<br /></span>)}
        {costByService == null ? '' : (
          <span><Label>Стоимость услуги</Label>{' '}{costByService} р<br /></span>
        )}
        {costOnDistance == null ? '' : (
          <span><Label>Стоимость на км.</Label>{' '}{costOnDistance} р/км<br /></span>
        )}
        {costOnWeight == null ? '' : (
          <span><Label>Стоимость на т.</Label>{' '}{costOnWeight} р/т</span>
        )}
      </div>
    );
  }

  createMethodItem(options, i) {
    return (
      <ListGroupItem key={i + 1}>
        {this.createMethod(options)}
      </ListGroupItem>
    );
  }

  createStrategy({ waste, totalAmount, strategy }, i) {
    const {
      ownTransportations = [],
      ownMethods = [],
      bestTransportation = {},
      bestMethod = {},
      bestCost,
    } = strategy;

    const owns = [...ownTransportations, ...ownMethods];
    const optimalExists = bestMethod != null || bestTransportation != null;

    return (
      <Row key={i}>
        <Col md={1}><h3>{i + 1}</h3></Col>
        <Col md={3}>
          <Panel header="Группа отходов">
            <ListGroup fill>
              {waste.map(this.createWasteItem.bind(this))}
              <ListGroupItem>
                <Label bsStyle="primary">Общее количество</Label> {totalAmount} т.
              </ListGroupItem>
            </ListGroup>
          </Panel>
        </Col>
        <Col md={3}>
          <Panel header="Собственные способы обращения">
            <ListGroup fill>
              {owns.map(this.createMethodItem.bind(this))}
              {!owns.length ? (<ListGroupItem>Отсутствуют</ListGroupItem>) : ''}
            </ListGroup>
          </Panel>
        </Col>
        <Col md={5}>
          <Panel header="Эффективные способы обращения">
            <ListGroup fill>
              {
                !optimalExists ? '' : (
                  <ListGroupItem>
                    <Row>
                      <Col md={6}>
                        {bestMethod == null ? '' : this.createMethod(bestMethod)}
                      </Col>
                      <Col md={6}>
                        {bestTransportation == null ? '' : this.createMethod(bestTransportation)}
                      </Col>
                    </Row>
                  </ListGroupItem>
                )
              }
              {bestCost == null ? '' :
                (<ListGroupItem>
                  <Label bsStyle="danger">Стоимость</Label>{' '}{bestCost} р.
                </ListGroupItem>
              )}
              {!optimalExists ? (<ListGroupItem>Не найдено</ListGroupItem>) : ''}
            </ListGroup>
          </Panel>
        </Col>
      </Row>
    );
  }

  displayStrategies(strategy) {
    if (strategy == null) return '';

    return (
      <div>
        {strategy.strategies.map(this.createStrategy.bind(this))}
        <hr />
        <Row>
          <Col mdOffset={1} md={3}>
            <h4><Label bsStyle="primary">Количество</Label> {strategy.totalWasteAmount} т</h4>
          </Col>
          <Col mdOffset={3} md={5}>
            <h4><Label bsStyle="danger">Стоимость</Label> {strategy.totalBestCost} р</h4>
          </Col>
        </Row>
      </div>
    );
  }

  delete() {
    Progress.show();
    this.props.onDelete(() => Progress.hide());
  }

  render() {
    const { company } = this.props;
    const { strategy } = this.state;

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
              <div>
                <NavLink
                  to={`/companies/${company.id}/waste/${props.rowData.fid}`}
                  style={{ marginRight: '15px' }}
                >
                  <i className="fa fa-eye" aria-hidden="true" />
                </NavLink>
                <NavLink
                  to={`/companies/${company.id}/waste/${props.rowData.fid}/edit`}
                  style={{ marginRight: '15px' }}
                >
                  <i className="fa fa-pencil" aria-hidden="true" />
                </NavLink>
                <a
                  href="javascript:;"
                  onClick={() => {
                    Progress.show();
                    const model = company.get('waste').findWhere({ fid: props.rowData.fid });
                    model.forSubjectParam(company.id);
                    model.destroy({ wait: true, success: () => Progress.hide() });
                  }}
                >
                  <i className="fa fa-ban" aria-hidden="true" />
                </a>
              </div>
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
              <div>
                <NavLink
                  to={`/companies/${company.id}/methods/${props.rowData.fid}`}
                  style={{ marginRight: '15px' }}
                >
                  <i className="fa fa-eye" aria-hidden="true" />
                </NavLink>
                <NavLink
                  to={`/companies/${company.id}/methods/${props.rowData.fid}/edit`}
                  style={{ marginRight: '15px' }}
                >
                  <i className="fa fa-pencil" aria-hidden="true" />
                </NavLink>
                <a
                  href="javascript:;"
                  onClick={() => {
                    Progress.show();
                    const model = company.get('methods').findWhere({ fid: props.rowData.fid });
                    model.forSubjectParam(company.id);
                    model.destroy({ wait: true, success: () => Progress.hide() });
                  }}
                >
                  <i className="fa fa-ban" aria-hidden="true" />
                </a>
              </div>
            ),
          },
        ]}
      />
    );

    return (
      <div>
        <Modal
          onHide={() => this.setState({ strategy: null })}
          dialogClassName="custom-modal" show={strategy != null}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">Найденная стратегия</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.displayStrategies(strategy)}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.setState({ strategy: null })}>Закрыть</Button>
          </Modal.Footer>
        </Modal>
        <Row>
          <Col md={12}>
            <ul className="nav menu-nav-pills">
              <li>
                <a href="javascript:;" onClick={() => this.search()}>
                  <i className="fa fa-search" aria-hidden="true" /> Найти стратегию
                </a>
              </li>
              <li><span className="h-seperate" /></li>
              <li>
                <NavLink to={`/companies/${company.id}/edit`}>
                  <i className="fa fa-pencil-square-o" /> Редактировать
                </NavLink>
              </li>
              <li>
                <a href="javascript:;" onClick={() => this.delete()}>
                  <i className="fa fa-ban" aria-hidden="true" /> Удалить
                </a>
              </li>
            </ul>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Panel>
              <h4><Label>Координаты</Label> [{company.get('coordinates').join(', ')}]</h4>
              <h4><Label>Бюджет</Label> {company.get('budget')} р.</h4>
            </Panel>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Tabs className="company-tabs">
              <Tab eventKey={1} title="Отходы">
                <ul className="nav menu-nav-pills">
                  <li>
                    <NavLink
                      to={`/companies/${company.id}/waste/new`}
                    >
                      <i className="fa fa-plus-square" aria-hidden="true" /> Добавить
                    </NavLink>
                  </li>
                </ul>
                <Row>
                  <Col md={12}>
                    <WasteGrid />
                  </Col>
                </Row>
              </Tab>
              <Tab eventKey={2} title="Способы управления">
                <ul className="nav menu-nav-pills">
                  <li>
                    <NavLink
                      to={`/companies/${company.id}/methods/new`}
                    >
                      <i className="fa fa-plus-square" aria-hidden="true" /> Добавить
                    </NavLink>
                  </li>
                </ul>
                <Row>
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
