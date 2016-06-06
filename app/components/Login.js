import React, { PropTypes, Component } from 'react';
import {
  Col,
  Panel,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Alert,
} from 'react-bootstrap';

export default class Login extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
  }

  state = { username: '', password: '', error: null }

  onSubmit(e) {
    e.preventDefault();

    this.props.onSubmit(this.state.username, this.state.password);
  }

  render() {
    this.props.onError(error => this.setState({ error }));

    const errorAlert = this.state.error == null ? '' : (
      <Alert bsStyle="danger" onDismiss={() => this.setState({ error: null })}>
        <h4>Ошибка!</h4>
        <p>{this.state.error.message}</p>
      </Alert>
    );

    return (
      <Col md={4} mdOffset={4}>
        <div className="text-center">
          <h1 className="login-brand-text">DSS-WM</h1>
          <h3 className="text-muted">СППР по управлению отходами</h3>
        </div>
        <Panel header={<h3>Вход в систему</h3>} className="login-panel">
          {errorAlert}
          <form role="form" onSubmit={(e) => this.onSubmit(e)}>
            <fieldset>
              <FormGroup controlId="username">
                <ControlLabel>Логин</ControlLabel>
                <FormControl
                  type="text" placeholder="Укажите логин" value={this.state.username}
                  onChange={e => this.setState({ username: e.target.value })}
                />
                <ControlLabel>Пароль</ControlLabel>
                <FormControl
                  type="password" placeholder="Укажите пароль" value={this.state.password}
                  onChange={e => this.setState({ password: e.target.value })}
                />
              </FormGroup>
              <Button type="submit" bsSize="large" bsStyle="success" block>Войти</Button>
            </fieldset>
          </form>
        </Panel>
      </Col>
    );
  }
}
