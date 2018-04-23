import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../actions';

class Invite extends Component {
  constructor(props) {
    super(props);

    this.state = {
      link: props.match.params.link
    };

    this._handleAccept = this._handleAccept.bind(this);
  }

  componentWillMount() {
    this.props.getRoomFromInvite(this.state.link);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.room &&
      (nextProps.room.accepted || nextProps.room.alreadyIn)
    ) {
      setTimeout(
        function() {
          this.props.history.push(
            `/room/${nextProps.room.name.replace(/ /g, '+')}`,
            {
              room: {
                name: nextProps.room.name,
                id: nextProps.room.id
              }
            }
          );
        }.bind(this),
        3000
      );
    }
  }

  _handleAccept(event) {
    event.preventDefault();

    this.props.acceptInvite(this.state.link);
  }

  _renderAlreadyIn() {
    return (
      <div className="container">
        <h1 className="text-centered">
          You're already in {this.props.room.name}
        </h1>
        <h2>Redirecting to room in 3 seconds...</h2>
      </div>
    );
  }

  _renderContent() {
    return (
      <div className="container">
        <h1 className="text-center">Invite Page</h1>
        <br />
        <br />

        <form>
          <h3 className="text-center">
            You've been invited to {this.props.room.name}
          </h3>
          <br />
          <div className="row">
            <button
              className="col-3 offset-2 btn btn-success"
              onClick={this._handleAccept}
            >
              Go in!
            </button>
            <Link to="/dashboard" className="col-3 offset-2 btn btn-danger">
              Nah
            </Link>
          </div>
        </form>
      </div>
    );
  }

  _renderLoading() {
    return (
      <div>
        <h3 className="text-center">Loading...</h3>
      </div>
    );
  }

  render() {
    if (this.props.room && this.props.room.name) {
      if (this.props.room.alreadyIn) return this._renderAlreadyIn();
      else return this._renderContent();
    } else {
      return this._renderLoading();
    }
  }
}

function mapStateToProps({ room }) {
  return { room };
}

export default withRouter(connect(mapStateToProps, actions)(Invite));
