import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faLink from '@fortawesome/fontawesome-free-solid/faLink';
import ReactTooltip from 'react-tooltip';
import copy from 'copy-to-clipboard';

import SpinnerButton from '../components/SpinnerButton';
import * as actions from '../actions';

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      roomName: '',
      copyToClipboard: false
    };

    this._handleLogout = this._handleLogout.bind(this);
    this._handleRoomNameChange = this._handleRoomNameChange.bind(this);
    this._handleCreateRoom = this._handleCreateRoom.bind(this);
    this._handleDeleteRoom = this._handleDeleteRoom.bind(this);
    this._handleGetLink = this._handleGetLink.bind(this);
    this._renderRoomList = this._renderRoomList.bind(this);
    this._renderCreateButton = this._renderCreateButton.bind(this);
    this._renderFriendsList = this._renderFriendsList.bind(this);
  }

  componentWillMount() {
    this.props.fetchUser();
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.copyToClipboard && nextProps.room && nextProps.room.link) {
      if (copy(nextProps.room.link)) {
        console.log(nextProps.room.link);
        this.setState({ copyToClipboard: false });
      }
    }
  }

  async _handleLogout(event) {
    await this.props.logout();

    this.props.history.replace('/');
  }

  _handleCreateRoom(event) {
    event.preventDefault();

    this.props.createRoom(this.state.roomName);
    this.setState({ roomName: '' });
  }

  _handleRoomNameChange(event) {
    this.setState({ roomName: event.target.value });
  }

  _handleDeleteRoom(event, room) {
    event.preventDefault();

    // add better confirmation
    if (
      window.confirm(`Are you sure you want to delete room '${room.name}'?`)
    ) {
      // delete room here
      this.props.deleteRoom(room.id);
    }
  }

  _handleGetLink(event, roomId) {
    event.preventDefault();

    this.props.getInviteLink(roomId);
    this.setState({ copyToClipboard: true });
  }

  _renderSampleText() {
    if (this.props.auth) {
      return (
        <h4 className="text-center">
          Logged in as {this.props.auth && this.props.auth.username}
        </h4>
      );
    } else {
      return <h4 className="text-center">Loading...</h4>;
    }
  }

  _renderRoomList() {
    if (this.props.auth && this.props.auth.roomsOwned) {
      if (this.props.auth.roomsOwned.length === 0) {
        return (
          <h5 className="text-center">
            No rooms made. Make a new room or join a friend's!
          </h5>
        );
      }

      return (
        <div>
          <h5>Rooms:</h5>
          <ul className="list-group">
            {this.props.auth.roomsOwned.map(room => {
              return (
                <Link
                  to={{
                    pathname: `/room/${room.name.replace(/ /g, '+')}`,
                    state: { room }
                  }}
                  className="list-group-item"
                  key={room.name}
                >
                  <li>
                    {room.name}
                    <button
                      className="close"
                      data-tip="Delete room"
                      onClick={event => this._handleDeleteRoom(event, room)}
                    >
                      &times;
                    </button>
                    <button
                      className="link-icon"
                      data-tip="Copy Invite Link"
                      onClick={event => this._handleGetLink(event, room.id)}
                    >
                      <FontAwesomeIcon icon={faLink} />
                    </button>
                    <ReactTooltip effect="solid" delayShow={400} />
                  </li>
                </Link>
              );
            })}
          </ul>
        </div>
      );
    }
  }

  _renderCreateButton() {
    return (
      <SpinnerButton
        loading={this.props.room && this.props.room.isLoading}
        spinnerColor="b5c8ff"
        block
        green
        onClick={this._handleCreateRoom}
      >
        Create Room
      </SpinnerButton>
    );
  }

  _renderFriendsList() {
    if (this.props.auth && this.props.auth.friends) {
      if (this.props.auth.friends.length === 0) {
        return <p className="text-center">No friends :(</p>;
      }

      console.log(this.props.auth.friends);
      return (
        <ul className="list-group">
          {this.props.auth.friends.map((friend, i) => {
            return (
              <li className="list-group-item" key={i}>
                {friend.name}
              </li>
            );
          })}
        </ul>
      );
    }
  }

  render() {
    if (this.props.auth) console.log('friends:', this.props.auth.friends);

    return (
      <div className="container" id="dashboard">
        <div className="row">
          <div className="col-sm-4 offset-sm-4">
            <h1 className="text-center">Dashboard</h1>
            {this._renderSampleText()}
            <SpinnerButton
              loading={this.props.auth && this.props.auth.isLoading}
              block
              blue
              spinnerColor="b5c8ff"
              onClick={this._handleLogout}
            >
              Log out
            </SpinnerButton>
          </div>
        </div>

        <br />
        <hr />
        <br />

        <div className="row">
          <div className="col-3 offset-1">
            <div className="row">
              <div className="col-12">
                <h2 className="text-center">Friends</h2>
              </div>
              <div className="col-12">
                <button className="btn btn-success btn-block">
                  Add Friend
                </button>
                <br />
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12">{this._renderFriendsList()}</div>
            </div>
          </div>

          <div className="col-9">
            <div className="row">
              <div className="col-sm-8 offset-sm-2">
                <form>
                  <h2 className="text-center">Chat Rooms</h2>
                  <br />
                  <div className="form-group">
                    <label htmlFor="room-name">Room Name:</label>
                    <input
                      type="text"
                      id="room-name"
                      className="form-control"
                      placeholder="Enter a name for your new room"
                      value={this.state.roomName}
                      onChange={this._handleRoomNameChange}
                    />
                  </div>
                  {this._renderCreateButton()}
                </form>
              </div>
            </div>
            <br />
            <div className="row">
              <div className="col-sm-8 offset-sm-2">
                {this._renderRoomList()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ auth, room, load }) {
  return { auth, room, load };
}

export default connect(mapStateToProps, actions)(Dashboard);
