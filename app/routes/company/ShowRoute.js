import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as Company } from '../../entities/Company';
import { PageHeader } from 'react-bootstrap';
import { Deferred } from '../../util/utils';

export default class CompanyShowRoute extends Route {
  breadcrumb({ params }) {
    const dfd = new Deferred;
    (new Company({ fid: params.fid })).fetch({ success: model => dfd.resolve(model.get('title')) });
    return dfd.promise;
  }

  fetch({ params }) {
    this.company = new Company({ fid: params.fid });
    return this.company.fetch();
  }

  render() {
    return (
      <div>
        <Helmet title={`Предприятие ${this.company.get('title')}`} />
        <PageHeader>{`Просмотр предприятия ${this.company.get('title')}`}</PageHeader>
      </div>
    );
  }
}

