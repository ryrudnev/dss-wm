import React, { Component, PropTypes } from 'react';
import { FormGroup, Col, Button, ButtonToolbar } from 'react-bootstrap';
import { Form, ValidatedInput } from 'react-bootstrap-validation';

export default class WasteTypeForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    values: PropTypes.object,
    create: PropTypes.bool,
    companies: PropTypes.array.isRequired,
  }

  static defaultProps = {
    values: { password: '' },
  }

  render() {
    const { username, password, role, subjects } = this.props.values;

    return (
      <div>
        <Form
          className="form-horizontal"
          onValidSubmit={(values) => this.props.onSubmit(values)}
        >
          <FormGroup>
            <ValidatedInput
              id="formUsername" wrapperClassName="col-sm-10"
              label="Логин" labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать' }} defaultValue={username}
              validate="required" type="text" name="username" placeholder="Укажите логин"
            />
          </FormGroup>

          <FormGroup>
            {
              this.props.create ? (
                <ValidatedInput
                  id="formPassword" wrapperClassName="col-sm-10"
                  label="Пароль" labelClassName="col-sm-2"
                  errorHelp={{ required: 'Необходимо указать' }} defaultValue={password}
                  validate="required" type="password"
                  name="password" placeholder="Укажите пароль"
                />
              ) : (
                <ValidatedInput
                  id="formPassword" wrapperClassName="col-sm-10"
                  label="Пароль" labelClassName="col-sm-2"
                  defaultValue={password} type="password"
                  name="password" placeholder="Укажите пароль"
                />
              )
            }
          </FormGroup>

          <FormGroup>
            <ValidatedInput
              id="formRole" wrapperClassName="col-sm-10"
              label="Роль" labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать' }} defaultValue={role}
              validate="required" type="select" name="role"
              placeholder="Укажите роль пользователя в системе"
            >
              <option key={1} value="user">user</option>
              <option key={2} value="admin">admin</option>
            </ValidatedInput>
          </FormGroup>

          <FormGroup>
            <ValidatedInput
              id="formSubjects" wrapperClassName="col-sm-10"
              label="Доступные предприятия" labelClassName="col-sm-2"
              errorHelp={{ required: 'Необходимо указать' }} defaultValue={subjects}
              validate="required" type="select" multiple name="subjects"
              placeholder="Укажите доступные предприятия пользователя"
            >
              {this.props.companies.map(el => (
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
