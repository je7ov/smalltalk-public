import React, { Component } from 'react';

// componenet rendering a single message in a chat room
class Message extends Component {
  render() {
    const { message } = this.props;

    return (
      <li>
        <p className="message-from">
          <strong>{message.from}</strong>
          <small className="text-muted message-time">
            {message.timestamp.toLocaleString()}
          </small>
        </p>
        <p className="message-text">{message.text}</p>
      </li>
    );
  }
}

export default Message;
