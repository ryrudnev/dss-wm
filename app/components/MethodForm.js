import React, { Component, PropTypes } from 'react';
import { FormGroup, Col, Button, ButtonToolbar } from 'react-bootstrap';
import { Form, ValidatedInput } from 'react-bootstrap-validation';

export default class WasteTypeForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    values: PropTypes.object,
    create: PropTypes.bool,
    methodTypes: PropTypes.array.isRequired,
  }

  static defaultProps = {
    values: { costOnWeight: 0, costOnDistance: 0, costByService: 0 },
  }

  render() {
    const { title, subtype, costOnWeight, costOnDistance, costByService } = this.props.values;

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
              id="formType" wrapperClassName="col-sm-10"
              label="Вид способа управления отходами" labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать' }} defaultValue={subtype}
              validate="required" type="select" name="type"
              placeholder="Укажите вид отходов"
            >
              {this.props.methodTypes.map(el => (
                <option key={el.fid} value={el.fid}>{el.title}</option>)
              )}
            </ValidatedInput>
          </FormGroup>

          <FormGroup>
            <ValidatedInput
              id="formCostByService" wrapperClassName="col-sm-10"
              label="Стоимость услуги" labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать', isDecimal: 'Возможно только число' }}
              defaultValue={costByService}
              validate="required,isDecimal" type="text" name="costByService"
              placeholder="Укажите стоимость услуги"
            />
          </FormGroup>

          <FormGroup>
            <ValidatedInput
              id="formCostOnWeight" wrapperClassName="col-sm-10"
              label="Стоимость на кг." labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать', isDecimal: 'Возможно только число' }}
              defaultValue={costOnWeight}
              validate="required,isDecimal" type="text" name="costOnWeight"
              placeholder="Укажите стоимость на кг."
            />
          </FormGroup>

          <FormGroup>
            <ValidatedInput
              id="formCostOnDistance" wrapperClassName="col-sm-10"
              label="Стоимость на км." labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать', isDecimal: 'Возможно только число' }}
              defaultValue={costOnDistance}
              validate="required,isDecimal" type="text" name="costOnDistance"
              placeholder="Укажите стоимость на км."
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
