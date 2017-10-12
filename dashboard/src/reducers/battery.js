
const getCharge = (charge) => {
  if (charge > 100) {
    return 100
  } else if (charge < 0) {
    return 0
  } else {
    return charge
  }
}

const battery = (state = 60, action) => {
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

export default battery

export const getBatteryLevel = (state) => state
