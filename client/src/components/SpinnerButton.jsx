import React, { Component } from 'react';
import { PulseLoader } from 'react-spinners';
import { connect } from 'react-redux';
import classNames from 'classnames';

class SpinnerButton extends Component {
  render() {
    const classList = classNames({
      btn: true,
      'btn-block': this.props.block,
      'btn-primary': this.props.blue,
      'btn-success': this.props.green,
      'btn-outline-primary': this.props.blueOutline
    });

    if (this.props.loading) {
      return (
        <button className={classList} disabled>
          <PulseLoader size={8} color="#b5c8ff" />
        </button>
      );
    } else {
      return (
        <button className={classList} onClick={this.props.onClick}>
          {this.props.children}
        </button>
      );
    }
  }
}

function mapStateToProps({ load }) {
  return { load };
}

export default connect(mapStateToProps)(SpinnerButton);
