import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { PageHeader } from 'react-bootstrap';

export default class CompanyIndexRoute extends Route {
  breadcrumb = 'Предприятия'

  render() {
    return (
      <div>
        <Helmet title="Предприятия" />
        <PageHeader> Предприятия </PageHeader>
      </div>
    );
  }
}
