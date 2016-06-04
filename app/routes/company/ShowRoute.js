import React from 'react';
import Helmet from 'react-helmet';
import { Route } from '../../core/router';
import { Model as Company } from '../../entities/Company';
import { Deferred } from '../../util/utils';
import { PageHeader } from 'react-bootstrap';
import CompanyProfile from '../../components/CompanyProfile';
import radio from 'backbone.radio';

const router = radio.channel('router');

export default class CompanyShowRoute extends Route {
  breadcrumb({ params }) {
    const dfd = new Deferred;
    (new Company({ fid: params.fid })).fetch({ success: model => dfd.resolve(model.get('title')) });
    return dfd.promise;
  }

  fetch({ params }) {
    this.company = new Company({ fid: params.fid });
    return this.company.expandParam('waste,methods').fetch();
  }

  search(cb) {
    this.company.searchStrategy({
      success: resp => {
        cb(resp.data);
      },
    });
  }

  delete(cb) {
    this.company.destroy({
      success: () => {
        cb();
        router.request('navigate', 'companies');
      },
    });
  }

  render() {
    return (
      <div>
        <Helmet title={`Предприятие ${this.company.get('title')}`} />
        <PageHeader>{`Предприятие ${this.company.get('title')}`}</PageHeader>
        <CompanyProfile
          company={this.company}
          onSearch={cb => this.search(cb)}
          onDelete={cb => this.delete(cb)}
        />
      </div>
    );
  }
}

