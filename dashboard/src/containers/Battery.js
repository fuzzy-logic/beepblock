import React from 'react'
import { connect } from 'react-redux'
import { getBatteryLevel } from '../reducers'

const Battery = (props) => {
  const { chargeLevel } = props
  return (
    <div>
      <h3>Battery Charge Status</h3>
      <hr />
      <br />
      <h3>{chargeLevel} %</h3>
    </div>
  )
}


const mapStateToProps = (state, { params }) => {
  return {
    chargeLevel: getBatteryLevel(state),
  };
};

export default connect(
  mapStateToProps,
  null
)(Battery)
