import React, { PropTypes } from 'react';
import {
  Col,
  Panel,
  Input,
  Button,
  Alert,
} from 'react-bootstrap';

const Login = (props, context) => {
  const onSubmit = () => {
    props.onSubmit({});
  };

  const alert = !context.error ? '' : (
    <Alert bsStyle="danger">
      <h4>Ошибка!</h4>
      <p>{context.error.message}</p>
    </Alert>
  );
  return (
    <Col md={4} mdOffset={4}>
      <div className="text-center">
        <h1 className="login-brand-text">DSS-WM</h1>
        <h3 className="text-muted">Система поддеркжи принятия решений по управлению отходами</h3>
      </div>

      <Panel header={<h3>Вход в систему</h3>} className="login-panel">
        {alert}
        <form role="form" onSubmit={onSubmit}>
          <fieldset>
            <div className="form-group">
              <Input
                className="form-control" placeholder="Укажите логин" ref="login" type="text"
              />
            </div>
            <div className="form-group">
              <Input
                className="form-control" placeholder="Укажите пароль" ref="password" type="password"
              />
            </div>
            <Button type="submit" bsSize="large" bsStyle="success" block>Войти</Button>
          </fieldset>
        </form>
      </Panel>
    </Col>
  );
};
Login.contextTypes = { error: PropTypes.object };
Login.propTypes = { onSubmit: PropTypes.func.isRequired };

export default Login;
