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
