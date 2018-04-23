import React, { Component } from 'react';
import { connect } from 'react-redux';

import SpinnerButton from '../components/SpinnerButton';
import * as actions from '../actions';
import Validator from '../modules/Validator';

class SignupLogin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      login: true,
      username: '',
      password: '',
      passwordCheck: ''
    };

    this._handleFormToggle = this._handleFormToggle.bind(this);
    this._handleUsernameChange = this._handleUsernameChange.bind(this);
    this._handlePasswordChange = this._handlePasswordChange.bind(this);
    this._handlePasswordCheckChange = this._handlePasswordCheckChange.bind(
      this
    );
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleErrorClose = this._handleErrorClose.bind(this);
  }

  _handleUsernameChange(event) {
    this.setState({ username: event.target.value });
  }

  _handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  _handlePasswordCheckChange(event) {
    this.setState({ passwordCheck: event.target.value });
  }

  _handleFormToggle() {
    this.setState({ login: !this.state.login });
    this.props.clearAuth();
  }

  _handleSubmit(event) {
    event.preventDefault();
    this.props.clearAuth();

    const username = encodeURIComponent(this.state.username);
    const password = encodeURIComponent(this.state.password);

    if (this.state.login) {
      const validRes = Validator.validateLogin(
        this.state.username,
        this.state.password
      );
      if (!validRes.valid) {
        this._throwError(validRes.error);
        return;
      }
      this.props.login(username, password);
    } else {
      const validUsername = Validator.validateUsername(this.state.username);
      if (!validUsername.valid) {
        this._throwError(validUsername.error);
        return;
      }
      const validPassword = Validator.validatePassword(this.state.password);
      if (!validPassword.valid) {
        this._throwError(validPassword.error);
        return;
      }
      if (this.state.password !== this.state.passwordCheck) {
        this._throwError('Passwords do not match.');
        return;
      }
      this.props.signup(username, password);
    }
  }

  _handleErrorClose(event) {
    event.preventDefault();

    this.props.clearAuth();
  }

  _throwError(message) {
    this.props.authError({
      status: 418,
      data: {
        success: false,
        message
      }
    });
  }

  _renderError() {
    if (
      this.props.auth &&
      this.props.auth.data &&
      this.props.auth.status !== 200
    ) {
      return (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <strong>Error:</strong> {this.props.auth.data.message}
          <button className="close" onClick={this._handleErrorClose}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      );
    }
  }

  _renderSubmit() {
    return (
      <SpinnerButton
        loading={this.props.auth && this.props.auth.isLoading}
        block
        blueOutline
        onClick={this._handleSubmit}
      >
        Submit
      </SpinnerButton>
    );
  }

  _renderInputs() {
    return (
      <div className="row" id="signup-form">
        <div className="col-sm-12">
          <form id="signup">
            <h2 className="text-center">
              {this.state.login ? 'Log in' : 'Sign up'}
            </h2>
            <br />
            <div className="form-group row">
              <label
                htmlFor="signup-username"
                className="col-sm-3 col-form-label"
              >
                Username:
              </label>
              <div className="col-sm-9">
                <input
                  type="text"
                  id="signup-username"
                  className="form-control"
                  placeholder="Enter a username"
                  value={this.state.username}
                  onChange={this._handleUsernameChange}
                />
              </div>
            </div>

            <div className="form-group row">
              <label
                htmlFor="signup-password"
                className="col-sm-3 col-form-label"
              >
                Password:
              </label>
              <div className="col-sm-9">
                <input
                  type="password"
                  id="signup-password"
                  className="form-control"
                  placeholder="Enter a password"
                  value={this.state.pass}
                  onChange={this._handlePasswordChange}
                />
              </div>
            </div>

            {this.state.login ? null : (
              <div className="form-group row">
                <label
                  htmlFor="signup-passwordCheck"
                  className="col-sm-3 col-form-label"
                >
                  Confirm:
                </label>
                <div className="col-sm-9">
                  <input
                    type="password"
                    id="signup-passwordCheck"
                    className="form-control"
                    placeholder="Confirm your password"
                    value={this.state.passwordCheck}
                    onChange={this._handlePasswordCheckChange}
                  />
                </div>
              </div>
            )}

            {this._renderSubmit()}

            {this._renderError()}
          </form>
        </div>
      </div>
    );
  }

  _renderForm() {
    return (
      <div className="row">
        <div className="col-md-6 offset-md-3">
          {this._renderInputs()}
          <button
            className="btn btn-block btn-light text-wrap"
            onClick={this._handleFormToggle}
          >
            {this.state.login
              ? "Don't have an account? Sign up!"
              : 'Already have an account? Log in!'}
          </button>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="App">
        <div className="container">{this._renderForm()}</div>
      </div>
    );
  }
}

function mapStateToProps({ auth, load }) {
  return { auth, load };
}

export default connect(mapStateToProps, actions)(SignupLogin);
