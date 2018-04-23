import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import { ClipLoader } from 'react-spinners';
import * as actions from '../actions';
import Message from '../components/Message';

class ChatRoom extends Component {
  constructor(props) {
    super(props);

    const { room } = this.props.location.state;

    this.props.getMessages(room.id);
    this.state = {
      auth: null,
      room,
      input: '',
      socket: null,
      messages: [],
      stickyScroll: false,
      firstLoad: true
    };

    this.messageListRef = React.createRef();

    this._handleBack = this._handleBack.bind(this);
    this._handleInputChange = this._handleInputChange.bind(this);
    this._handleSendMessage = this._handleSendMessage.bind(this);
    this._renderMessages = this._renderMessages.bind(this);
  }

  componentWillMount() {
    this.props.fetchUser();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.socket && nextProps.auth && nextProps.auth.id) {
      const socket = io(window.location.origin);
      // const socket = io('http://localhost:5000');

      /////////////////////
      // SOCKET.IO SETUP //
      /////////////////////
      socket.on('connect', () => {
        socket.emit(
          'join',
          nextProps.auth.username,
          this.state.room.name,
          err => {
            if (err) {
              alert(err);
              //redirect if needed
            }
          }
        );
      });

      socket.on('newMessage', message => {
        const messages = this.state.messages.slice();
        messages.push(message);
        this.setState({ messages });
      });

      this.setState({ socket });
    }

    if (nextProps.room && nextProps.room.messages) {
      this.setState({ messages: nextProps.room.messages, firstLoad: true });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.stickyScroll && !nextState.stickyScroll) {
      return false;
    }

    return true;
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.messages.length !== this.state.messages.length) {
      const node = this.messageListRef.current;

      if (node.clientHeight + node.scrollTop === node.scrollHeight) {
        this.setState({ stickyScroll: true });
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.stickyScroll || this.state.firstLoad) {
      const node = this.messageListRef.current;

      node.scrollTop = node.scrollHeight - node.clientHeight;
      if (this.state.firstLoad) {
        this.setState({ stickyScroll: false, firstLoad: false });
      } else {
        this.setState({ stickyScroll: false });
      }
    }
  }

  componentWillUnmount() {
    this.state.socket.disconnect();
  }

  _handleBack(event) {
    this.props.history.goBack();
  }

  _handleInputChange(event) {
    this.setState({ input: event.target.value });
  }

  _handleSendMessage(event) {
    event.preventDefault();

    this.state.socket.emit(
      'createMessage',
      this.state.input,
      this.state.room.id,
      () => {
        this.setState({ input: '' });
      }
    );
  }

  _renderMessages() {
    if (this.props.room && !this.props.room.isLoading) {
      if (this.state.messages.length !== 0) {
        return (
          <ul className="list-group">
            {this.state.messages.map((message, i) => {
              message.timestamp = new Date(message.timestamp);
              return (
                <div className="message" key={i}>
                  {i > 0 ? <hr /> : null}
                  <Message message={message} />
                </div>
              );
            })}
          </ul>
        );
      } else {
        return (
          <div className="centered">
            <h3 className="text-muted">
              The chat is empty! Start the small talk!
            </h3>
          </div>
        );
      }
    } else {
      return (
        <div className="centered">
          <ClipLoader />
        </div>
      );
    }
  }

  _renderNew() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12">New render</div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="container">
        <div className="chat-page">
          <div className="row chat-top">
            <div className="col-1">
              <button
                className="btn btn-primary d-none d-md-block"
                onClick={this._handleBack}
              >
                &lt; Back
              </button>
              <button
                className="btn btn-primary d-block d-sm-none"
                onClick={this._handleBack}
              >
                &lt;
              </button>
            </div>
            <div className="col-11">
              <h1 className="text-center">{this.state.room.name}</h1>
            </div>
          </div>
          <div className="chat-messages" ref={this.messageListRef}>
            {this._renderMessages()}
          </div>
          <div className="chat-input-form">
            <form>
              <div className="form-group row" id="message-input">
                <div className="col-lg-10 col-md-9 col-8">
                  <input
                    type="text"
                    className="form-control"
                    value={this.state.input}
                    onChange={this._handleInputChange}
                  />
                </div>
                <div className="col-lg-2 col-md-3 col-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    onClick={this._handleSendMessage}
                  >
                    SEND
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ auth, room }) {
  return { auth, room };
}

export default connect(mapStateToProps, actions)(ChatRoom);
