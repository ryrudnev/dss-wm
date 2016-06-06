import React, { Component, PropTypes } from 'react';
import { FormGroup, Col, Button, ButtonToolbar } from 'react-bootstrap';
import { Form, ValidatedInput } from 'react-bootstrap-validation';

export default class WasteTypeForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    values: PropTypes.object,
    create: PropTypes.bool,
    origins: PropTypes.array.isRequired,
    methodTypes: PropTypes.array.isRequired,
    aggregateStates: PropTypes.array.isRequired,
    hazardClasses: PropTypes.array.isRequired,
  }

  static defaultProps = {
    values: { },
  }

  render() {
    const { title, hazardClass, aggregateState, origins, methods } = this.props.values;

    return (
      <div>
        <Form
          className="form-horizontal"
          onValidSubmit={(values) => this.props.onSubmit(values)}
        >
          <FormGroup>
            <ValidatedInput
              id="formTitle" wrapperClassName="col-sm-10"
              label="Название" labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать' }} defaultValue={title}
              validate="required" type="text" name="title" placeholder="Укажите название"
            />
          </FormGroup>

          <FormGroup>
            <ValidatedInput
              id="formHazardClass" wrapperClassName="col-sm-10"
              label="Класс опасности" labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать' }} defaultValue={hazardClass}
              validate="required" type="select" name="hazardClass"
              placeholder="Укажите класс опасности"
            >
              {this.props.hazardClasses.map(el => (
                <option key={el.fid} value={el.fid}>{el.title}</option>)
              )}
            </ValidatedInput>
          </FormGroup>

          <FormGroup>
            <ValidatedInput
              id="formAggregateState" wrapperClassName="col-sm-10"
              label="Агрегатное состояние" labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать' }} defaultValue={aggregateState}
              validate="required" type="select" name="aggregateState"
              placeholder="Укажите агрегатное состояние"
            >
              {this.props.aggregateStates.map(el => (
                <option key={el.fid} value={el.fid}>{el.title}</option>
              ))}
            </ValidatedInput>
          </FormGroup>

          <FormGroup>
            <ValidatedInput
              id="formOrigins" wrapperClassName="col-sm-10"
              label="Происхождение" labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать' }} defaultValue={origins}
              validate="required" type="select" multiple name="origins"
              placeholder="Укажите происхождение"
            >
              {this.props.origins.map(el => (
                <option key={el.fid} value={el.fid}>{el.title}</option>
              ))}
            </ValidatedInput>
          </FormGroup>

          <FormGroup>
            <ValidatedInput
              id="formMethods" wrapperClassName="col-sm-10"
              label="Возможные способы управления" labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать' }} defaultValue={methods}
              validate="required" type="select" multiple name="methods"
              placeholder="Укажите возможные способы управления"
            >
              {this.props.methodTypes.map(el => (
                <option key={el.fid} value={el.fid}>{el.title}</option>
              ))}
            </ValidatedInput>
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
