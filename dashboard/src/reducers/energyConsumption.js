
const getCharge = (charge) => {
  if (charge > 100) {
    return 100
  } else if (charge < 0) {
    return 0
  } else {
    return charge
  }
}

const energyConsumption = (state = 50, action) => {
  switch (action.type) {
    case 'CHANGE_CONSUMPTION_RATE':
      return getCharge(action.consumeRate)
    default:
      return state
  }
}

export default energyConsumption

export const getConsumptionRate = (state) => state
