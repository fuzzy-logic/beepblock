
const getCharge = (charge) => {
  if (charge > 100) {
    return 100
  } else if (charge < 0) {
    return 0
  } else {
    return charge
  }
}

const energyCreation = (state = 10, action) => {
  switch (action.type) {
    case 'CHANGE_CREATION_RATE':
      return getCharge(action.creationRate)
    default:
      return state
  }
}

export default energyCreation

export const getCreationRate = (state) => state
