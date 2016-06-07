import React, { Component, PropTypes } from 'react';
import { FormGroup, Col, Button, ButtonToolbar } from 'react-bootstrap';
import { Form, ValidatedInput } from 'react-bootstrap-validation';

export default class WasteTypeForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    values: PropTypes.object,
    create: PropTypes.bool,
  }

  static defaultProps = {
    values: { },
  }

  render() {
    const { title } = this.props.values;

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
