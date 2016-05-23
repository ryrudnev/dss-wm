import React, { PropTypes } from 'react';

const App = props => (
  <div>
    <h2>Тест</h2>
    <div>{props.page}</div>
  </div>
);

App.propTypes = {
  page: PropTypes.element.isRequired,
};

export default App;
