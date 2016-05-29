import $ from 'jquery';
import radio from 'backbone.radio';

const errors = radio.channel('errors');

class ErrorHandler {
  constructor() {
    $(document).ajaxError((e, xhr) => this.handle(e, xhr));
  }

  handle(e, xhr) {
    const { success, code, message } = JSON.parse(xhr.responseText) || {};
    if (success || (success === void 0 && xhr.code < 400)) { return; }
    const error = { code: code || xhr.code, name: xhr.statusText, message };

    errors.trigger(`error: ${error.code}`, error);
    errors.trigger('error', error);
  }
}

export default () => {
  if (ErrorHandler._created) { throw new Error('ErrorHandler has already been created'); }
  ErrorHandler._created = true;
  return new ErrorHandler();
};
