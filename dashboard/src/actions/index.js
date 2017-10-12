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

export const changeNinetyTo100Price = (val) => (dispatch, getState) => {
  const value = {sell: val}
  dispatch({
    type: 'CHANGE_NINETY_TO_100_PRICE',
    price: value
  })
}

export const changeEightyTo90Price = (val) => (dispatch, getState) => {
  const value = {buy: val[0], sell: val[1]}
  dispatch({
    type: 'CHANGE_EIGHTY_TO_90_PRICE',
    price: value
  })
}

export const changeSeventyTo80Price = (val) => (dispatch, getState) => {
  const value = {buy: val[0], sell: val[1]}
  dispatch({
    type: 'CHANGE_SEVENTY_TO_80_PRICE',
    price: value
  })
}

export const changeSixtyTo70Price = (val) => (dispatch, getState) => {
  const value = {buy: val[0], sell: val[1]}
  dispatch({
    type: 'CHANGE_SIXTY_TO_70_PRICE',
    price: value
  })
}

export const changeFiftyTo60Price = (val) => (dispatch, getState) => {
  const value = {buy: val[0], sell: val[1]}
  dispatch({
    type: 'CHANGE_FIFTY_TO_60_PRICE',
    price: value
  })
}

export const changeFortyTo50Price = (val) => (dispatch, getState) => {
  const value = {buy: val[0], sell: val[1]}
  dispatch({
    type: 'CHANGE_FOURTY_TO_50_PRICE',
    price: value
  })
}

export const changeThirtyTo40Price = (val) => (dispatch, getState) => {
  const value = {buy: val[0], sell: val[1]}
  dispatch({
    type: 'CHANGE_THIRTY_TO_40_PRICE',
    price: value
  })
}

export const changeTwentyTo30Price = (val) => (dispatch, getState) => {
  const value = {buy: val[0], sell: val[1]}
  dispatch({
    type: 'CHANGE_TWENTY_TO_30_PRICE',
    price: value
  })
}

export const changeTenTo20Price = (val) => (dispatch, getState) => {
  const value = {buy: val[0], sell: val[1]}
  dispatch({
    type: 'CHANGE_TEN_TO_20_PRICE',
    price: value
  })
}

export const changeZeroTo10Price = (val) => (dispatch, getState) => {
  const value = {buy: val}
  dispatch({
    type: 'CHANGE_ZERO_TO_10_PRICE',
    price: value
  })
}
