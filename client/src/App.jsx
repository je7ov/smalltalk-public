import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, withRouter } from 'react-router-dom';

import * as actions from './actions';
import './App.css';
import Auth from './modules/Auth';

// route pages
import SignupLogin from './routes/SignupLogin';
import Dashboard from './routes/Dashboard';
import ChatRoom from './routes/ChatRoom';
import Invite from './routes/Invite';

class App extends Component {
  render() {
    return (
      <div className="App">
        {/* Root route will reroute to dashboard if user has authentication in cookies */}
        <Route
          exact
          path="/"
          render={props => {
            if (Auth.isUserAuthenticated()) {
              return <Redirect to="/dashboard" />;
            } else {
              return <SignupLogin {...props} />;
            }
          }}
        />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/room/:name" component={ChatRoom} />
        <Route path="/invite/:link" component={Invite} />
      </div>
    );
  }
}

function mapStateToProps({ auth }) {
  return { auth };
}

export default withRouter(connect(mapStateToProps, actions)(App));
