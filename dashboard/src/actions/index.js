export const changeCreationRate = (rate) => (dispatch, getState) => {
  dispatch({
    type: 'CHANGE_CREATION_RATE',
    creationRate: rate
  })
}

export const changeConsumptionRate = (rate) => (dispatch, getState) => {
  dispatch({
    type: 'CHANGE_CONSUMPTION_RATE',
    consumeRate: rate
  })
}

export const updateBattery = (amount) => (dispatch, getState) => {
  dispatch({
    type: 'ADD_BATTERY_CHARGE',
    chargeValue: amount
  })
}
