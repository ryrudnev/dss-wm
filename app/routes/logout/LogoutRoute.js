import radio from 'backbone.radio';
import { Route } from '../../core/router';

const sessionChannel = radio.channel('session');

export default class LoginRoute extends Route{
  redirect() {
    sessionChannel.request('logout');
    return '';
  }
}
