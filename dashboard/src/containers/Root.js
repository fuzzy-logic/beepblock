import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom';
import { PropTypes } from 'prop-types'
import { Provider } from 'react-redux'
import App from './App'
import '../css/index.css'

const Root = ({ store }) => (
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired,
};

export default Root;
