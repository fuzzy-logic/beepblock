import React from 'react'
import { connect } from 'react-redux'
import { getBatteryLevel, getBatteryDirection } from '../reducers'
import BatteryDisplay from '../components/BatteryDisplay'

const Battery = (props) => {
  const { chargeLevel, batteryDirection } = props
  return (
    <div style={{textAlign: '-webkit-center'}}>
      <h3>Battery Charge Status</h3>
      <hr />
      <br />
      <BatteryDisplay charge={chargeLevel} direction={batteryDirection}/>
      <h3>{chargeLevel} %</h3>
    </div>
  )
}


const mapStateToProps = (state, { params }) => {
  return {
    chargeLevel: parseFloat(getBatteryLevel(state)).toFixed(2),
    batteryDirection: getBatteryDirection(state)
  };
};

export default connect(
  mapStateToProps,
  null
)(Battery)
