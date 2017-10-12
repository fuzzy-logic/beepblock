import { combineReducers } from 'redux'

const gridPrice = (state = {buy: 10, sell: 50}, action) => {
  switch (action.type) {
    case 'CHANGE_GRID_PRICE':
      return action.price
    default:
      return state
  }
}

const zeroTo10Price = (state = {buy: 10}, action) => {
  switch (action.type) {
    case 'CHANGE_ZERO_TO_10_PRICE':
      return action.price
    default:
      return state
  }
}


const tenTo20Price = (state = {buy: 10, sell: 50}, action) => {
  switch (action.type) {
    case 'CHANGE_TEN_TO_20_PRICE':
      return action.price
    default:
      return state
  }
}


const twentyTo30Price = (state = {buy: 10, sell: 50}, action) => {
  switch (action.type) {
    case 'CHANGE_TWENTY_TO_30_PRICE':
      return action.price
    default:
      return state
  }
}

const thirtyTo40Price = (state = {buy: 10, sell: 50}, action) => {
  switch (action.type) {
    case 'CHANGE_THIRTY_TO_40_PRICE':
      return action.price
    default:
      return state
  }
}

const fourtyTo50Price = (state = {buy: 10, sell: 50}, action) => {
  switch (action.type) {
    case 'CHANGE_FOURTY_TO_50_PRICE':
      return action.price
    default:
      return state
  }
}

const fiftyTo60Price = (state = {buy: 10, sell: 50}, action) => {
  switch (action.type) {
    case 'CHANGE_FIFTY_TO_60_PRICE':
      return action.price
    default:
      return state
  }
}

const sixtyTo70Price = (state = {buy: 10, sell: 50}, action) => {
  switch (action.type) {
    case 'CHANGE_SIXTY_TO_70_PRICE':
      return action.price
    default:
      return state
  }
}

const seventyTo80Price = (state = {buy: 10, sell: 50}, action) => {
  switch (action.type) {
    case 'CHANGE_SEVENTY_TO_80_PRICE':
      return action.price
    default:
      return state
  }
}

const eightyTo90Price = (state = {buy: 10, sell: 50}, action) => {
  switch (action.type) {
    case 'CHANGE_EIGHTY_TO_90_PRICE':
      return action.price
    default:
      return state
  }
}

const ninetyTo100Price = (state = {sell: 50}, action) => {
  switch (action.type) {
    case 'CHANGE_NINETY_TO_100_PRICE':
      return action.price
    default:
      return state
  }
}

const buysell = combineReducers({
  gridPrice,
  zeroTo10Price,
  tenTo20Price,
  twentyTo30Price,
  thirtyTo40Price,
  fourtyTo50Price,
  fiftyTo60Price,
  sixtyTo70Price,
  seventyTo80Price,
  eightyTo90Price,
  ninetyTo100Price
});

export default buysell

export const getGridPrice = (state) => state.gridPrice
export const getZeroTo10Price = (state) => state.zeroTo10Price
export const getTenTo20Price = (state) => state.tenTo20Price
export const getTwentyTo30Price = (state) => state.twentyTo30Price
export const getThirtyTo40Price = (state) => state.thirtyTo40Price
export const getFourtyTo50Price = (state) => state.fourtyTo50Price
export const getFiftyTo60Price = (state) => state.fiftyTo60Price
export const getSixtyTo70Price = (state) => state.sixtyTo70Price
export const getSeventyTo80Price = (state) => state.seventyTo80Price
export const getEightyTo90Price = (state) => state.eightyTo90Price
export const getNinetyTo100Price = (state) => state.ninetyTo100Price
