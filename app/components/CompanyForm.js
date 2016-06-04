import React, { Component, PropTypes } from 'react';
import { FormGroup, Col, Button, ButtonToolbar } from 'react-bootstrap';
import { Form, ValidatedInput } from 'react-bootstrap-validation';

export default class CompanyForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    values: PropTypes.object,
    create: PropTypes.bool,
  }

  static defaultProps = {
    values: { title: '', coordinates: [], budget: '' },
  }

  constructor(props) {
    super(props);

    const { title, coordinates, budget } = this.props.values;
    this.state = {
      error: null,
      title,
      lat: `${coordinates[0] || ''}`,
      long: `${coordinates[1] || ''}`,
      budget,
    };
  }

  onSubmit(values) {
    values.coordinates = [+values.lat, +values.long];
    delete values.lat;
    delete values.long;
    values.budget = +values.budget;
    this.props.onSubmit(values);
  }

  render() {
    const { title, lat, long, budget } = this.state;

    return (
      <div>
        <Form
          className="form-horizontal"
          onValidSubmit={(values) => this.onSubmit(values)}
        >

          <FormGroup>
            <ValidatedInput
              id="formTitle" wrapperClassName="col-sm-10"
              label="Название" labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать' }}
              value={title} onChange={e => this.setState({ title: e.target.value })}
              validate="required" type="text" name="title" placeholder="Укажите название"
            />
          </FormGroup>

          <FormGroup>
            <ValidatedInput
              id="formLat" wrapperClassName="col-sm-10"
              label="Координаты (широта)" labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать', isDecimal: 'Возможно только число' }}
              value={lat} onChange={e => this.setState({ lat: e.target.value })}
              validate="required,isDecimal" name="lat" type="text" placeholder="Укажите широту"
            />
          </FormGroup>

          <FormGroup>
            <ValidatedInput
              id="formLong" wrapperClassName="col-sm-10"
              label="Координаты (долгота)" labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать', isDecimal: 'Возможно только число' }}
              value={long} onChange={e => this.setState({ long: e.target.value })}
              validate="required,isDecimal" name="long" type="text" placeholder="Укажите долготу"
            />
          </FormGroup>

          <FormGroup>
            <ValidatedInput
              id="formBudget" wrapperClassName="col-sm-10"
              label="Бюджет" labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать', isDecimal: 'Возможно только число' }}
              value={budget} onChange={e => this.setState({ budget: e.target.value })}
              validate="required,isDecimal" name="budget" type="text" placeholder="Укажите бюджет"
            />
          </FormGroup>

          <FormGroup>
            <Col smOffset={2} sm={10}>
              <ButtonToolbar>
                <Button type="submit" bsStyle="primary">
                  {this.props.create ? 'Создать' : 'Изменить'}
                </Button>
                <Button type="reset">Очистить</Button>
                <Button onClick={() => this.props.onCancel()}>Отмена</Button>
              </ButtonToolbar>
            </Col>
          </FormGroup>
        </Form>
      </div>
    );
  }
}
