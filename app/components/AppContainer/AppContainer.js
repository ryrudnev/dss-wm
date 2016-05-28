import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { Navbar } from 'react-bootstrap';

export default class AppContainer extends Component {
  static propTypes = {
    route: PropTypes.object,
    error: PropTypes.object,
    user: PropTypes.object,
    breadcrumb: PropTypes.object,
  }

  static childContextTypes = {
    error: PropTypes.object,
    user: PropTypes.object,
  }

  getChildContext() {
    return {
      error: this.props.error,
      user: this.props.user,
    };
  }

  render() {
    const { route } = this.props;

    const Page = (props, context) => route.render(props, context);

    if (route.dashboard === false) {
      return (
        <div id="container">
          <Helmet titleTemplate="DSS-WM | %s" />
          <Page />
        </div>
      );
    }

    return (
      <div id="container">
        <Helmet titleTemplate="DSS-WM | %s" title="Панель управления" />
        <div id="wrapper" className="content">
          <Navbar />

          <div
            id="page-wrapper"
            className="page-wrapper"
            ref="pageWrapper"
          >
            <Page />
          </div>

        </div>
      </div>
    );
  }
}
