import React, { PropTypes } from 'react';

export const AppContainer = props => (
  <div>
    <h2>Тест</h2>
    <div>{props.page}</div>
  </div>
);

AppContainer.propTypes = {
  page: PropTypes.element.isRequired,
};

