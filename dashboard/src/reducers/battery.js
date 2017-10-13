import { combineReducers } from 'redux'

const getCharge = (charge) => {
  if (charge > 100) {
    return 100
  } else if (charge < 0) {
    return 0
  } else {
    return charge
  }
}

const charge = (state = 60, action) => {
  switch (action.type) {
    case 'SET_BATTERY_CHARGE':
      return getCharge(action.chargeValue)
    case 'ADD_BATTERY_CHARGE':
      return getCharge(state + action.chargeValue)
    case 'DISCHARGE_BATTERY':
      return 0
    default:
      return state
  }
}

const direction = (state = 'down', action) => {
  switch (action.type) {
    case 'ADD_BATTERY_CHARGE':
      if (action.chargeValue > 0 ) {
        return 'up'
      } else if (action.chargeValue < 0) {
        return 'down'
      } else {
        return 'stable'
      }

    default:
      return state
  }
}

const battery = combineReducers({
  charge,
  direction
});

export default battery

export const getBatteryLevel = (state) => state.charge
export const getBatteryDirection = (state) => state.direction
