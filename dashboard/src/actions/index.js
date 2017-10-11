export const changeCreationRate = (rate) => (dispatch, getState) => {
  dispatch({
    type: 'CHANGE_CREATION_RATE',
    creationRate: rate
  })
}
