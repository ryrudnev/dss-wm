import Backbone from 'backbone';
import radio from 'backbone.radio';
import 'backbone-associations';

const sessionChannel = radio.channel('session');

export class Model extends Backbone.AssociatedModel {
  sync(method, model, options = {}) {
    const token = sessionChannel.request('token');
    Object.assign(options, { headers: { Authorization: token } });
    return super.sync(method, model, options);
  }
}

export class Collection extends Backbone.Collection {
  sync(method, collection, options = {}) {
    const token = sessionChannel.request('token');
    Object.assign(options, { headers: { Authorization: token } });
    return super.sync(method, collection, options);
  }
}
