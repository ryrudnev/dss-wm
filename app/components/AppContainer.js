import React, { PropTypes, Component } from 'react';
import Helmet from 'react-helmet';
import $ from 'jquery';
import { Navbar, Nav, NavDropdown, Row, Col } from 'react-bootstrap';
import NavMenuItem from './NavMenuItem';
import NavBreadcrumb from './NavBreadcrumb';
import NavSidebar from './NavSidebar';

export default class AppContainer extends Component {
  static propTypes = {
    route: PropTypes.object,
    breadcrumb: PropTypes.object,
    user: PropTypes.object,
  }

  static childContextTypes = {
    user: PropTypes.object,
  }

  getChildContext() {
    return {
      user: this.props.user,
    };
  }

  componentWillMount() {
    this.setState({ height: $(window).height() });
  }

  render() {
    const { route, breadcrumb } = this.props;

    const Page = (props, context) => route.render(props, context);

    if (route.dashboard === false) {
      return (
        <div id="container">
          <Helmet titleTemplate="%s | DSS-WM" />
          <Page />
        </div>
      );
    }

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
            <div className="container-fluid">
              <Row>
                <Col lg={12}><NavBreadcrumb collection={breadcrumb} /></Col>
              </Row>
              <Row>
                <Col lg={12}><Page /></Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
