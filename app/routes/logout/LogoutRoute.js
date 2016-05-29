import radio from 'backbone.radio';
import { Route } from '../../core/router';

const session = radio.channel('session');

export default class LoginRoute extends Route{
  redirect() {
    session.request('logout');
    return '';
  }
}
