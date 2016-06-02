import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { PageHeader } from 'react-bootstrap';
import { Collection as Companies } from '../../entities/Company';

export default class CompanyIndexRoute extends Route {
  breadcrumb = 'Предприятия'

  fetch() {
    this.companies = new Companies;
    return this.companies.fetch();
  }

  render() {
    console.log(this.companies);
    return (
      <div>
        <Helmet title="Предприятия" />
        <PageHeader> Предприятия </PageHeader>
      </div>
    );
  }
}
