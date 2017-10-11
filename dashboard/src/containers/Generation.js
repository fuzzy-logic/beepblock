import React, {Component} from 'react'
import { connect } from 'react-redux'
import { Knob } from '../components/Knob'
import { changeCreationRate } from '../actions'
import { getCreationRate } from '../reducers'

class Generation extends Component {

  render = () => {
    const { changeCreationRate, creationRate } = this.props
    return (
      <div>
        <h3>Energy Creation Rate</h3>
        <hr />
        <Knob
          value={creationRate}
          onChange={changeCreationRate}
          width={150}
          height={150}
        />
        <br />
        <h3>{creationRate} kw/h</h3>
      </div>
    )
  }
}


const mapStateToProps = (state, { params }) => {
  return {
    creationRate: getCreationRate(state),
  };
};


export default connect(
  mapStateToProps,
  {
    changeCreationRate
  }
)(Generation)
