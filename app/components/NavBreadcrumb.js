import React, { PropTypes } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import radio from 'backbone.radio';

const router = radio.channel('router');

const NavBreadcrumb = (props) => (
  !props.collection.length ? '' :
    (<Breadcrumb>
      <li><span>ВЫ ЗДЕСЬ</span></li>{props.collection.map((b, i) => (
      i !== props.collection.length - 1 ?
        <Breadcrumb.Item
          key={b.cid} href={b.get('url')} className="nav-link"
          onClick={(e) => {
            e.preventDefault();
            router.request('navigate', b.get('url'));
          }}
        >
          {b.get('text')}
        </Breadcrumb.Item> :
        <Breadcrumb.Item key={b.cid} active>{b.get('text')}</Breadcrumb.Item>
    ))}
    </Breadcrumb>)
);
NavBreadcrumb.propTypes = {
  collection: PropTypes.object.isRequired,
};

export default NavBreadcrumb;
