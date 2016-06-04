import React, { PropTypes, Component } from 'react';
import Helmet from 'react-helmet';
import $ from 'jquery';
import { Navbar, Nav, NavDropdown, Row, Col, Grid, Alert } from 'react-bootstrap';
import NavMenuItem from './NavMenuItem';
import NavBreadcrumb from './NavBreadcrumb';
import NavSidebar from './NavSidebar';
import Progress from 'react-progress-2';

export default class AppContainer extends Component {
  static propTypes = {
    route: PropTypes.object,
    breadcrumb: PropTypes.object,
    user: PropTypes.object,
    onError: PropTypes.func.isRequired,
  }

  static childContextTypes = {
    user: PropTypes.object,
  }

  state = { height: '450px', error: null }

  getChildContext() {
    return {
      user: this.props.user,
    };
  }

  componentWillMount() {
    this.setState({ height: $(window).height() });
  }

  render() {
    const { route, breadcrumb, onError } = this.props;

    const Page = (props, context) => route.render(props, context);

    if (route.dashboard === false) {
      return (
        <div id="container">
          <Helmet titleTemplate="%s | DSS-WM" />
          <Page />
        </div>
      );
    }

    onError(error => {
      Progress.hide();
      this.setState({ error });
    });

    const errorAlert = this.state.error == null ? '' : (
      <Alert bsStyle="danger" onDismiss={() => this.setState({ error: null })}>
        <h4>Ошибка!</h4>
        <p>{this.state.error.message}</p>
      </Alert>
    );

    return (
      <div id="container">
        <Helmet titleTemplate="%s | DSS-WM" title="Панель управления" />
        <div id="wrapper" className="content">
          <Navbar fluid style={{ margin: 0 }}>
            <Navbar.Header>
              <Navbar.Brand>
                <a href="#"><i className="fa fa-recycle" aria-hidden="true" /> DSS-WM</a>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav pullRight className="navbar-top-links" style={{ margin: 0 }}>
                <NavDropdown
                  id="user-nav-dropdown" eventKey={1}
                  title={<i className="fa fa-user fa-fw" />}
                >
                  <NavMenuItem to="logout" eventKey={1.1}>
                    <i className="fa fa-sign-out fa-fw" /> Выйти
                  </NavMenuItem>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
            <NavSidebar style={{ marginLeft: '-20px', marginTop: '1px' }} />
          </Navbar>
          <div id="page-wrapper" className="page-wrapper" style={{ minHeight: this.state.height }}>
            <Grid fluid>
              <Row><Col md={12}><NavBreadcrumb collection={breadcrumb} /></Col></Row>
              <Row><Col md={12}>{errorAlert}</Col></Row>
              <Row><Col md={12}><Page /></Col></Row>
            </Grid>
          </div>
        </div>
      </div>
    );
  }
}
