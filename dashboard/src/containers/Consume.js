import React, {Component} from 'react'
import { connect } from 'react-redux'
import { Knob } from '../components/Knob'
import { changeConsumptionRate } from '../actions'
import { getConsumptionRate } from '../reducers'

class Consume extends Component {

  render = () => {
    const { changeConsumptionRate, consumptionRate } = this.props
    return (
      <div>
        <h3>Energy Consumption Rate</h3>
        <hr />
        <br />
        <Knob
          value={consumptionRate}
          onChange={changeConsumptionRate}
          width={150}
          height={150}
        />
        <br />
        <h3>{consumptionRate} kw/h</h3>
      </div>
    )
  }
}


const mapStateToProps = (state, { params }) => {
  return {
    consumptionRate: getConsumptionRate(state),
  };
};


export default connect(
  mapStateToProps,
  {
    changeConsumptionRate
  }
)(Consume)
