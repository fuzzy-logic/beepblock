import { combineReducers } from 'redux'

import battery, * as batteryDetails from './battery'
import energyCreation, * as createDetails from './energyCreation'
import energyConsumption, * as consumeDetails from './energyConsumption'
import buysell, * as buysellDetails from './buysell'

const beepBlock = combineReducers({
  battery,
  energyCreation,
  energyConsumption,
  buysell
});

export default beepBlock

export const getCreationRate = (state) =>
  createDetails.getCreationRate(state.energyCreation);

export const getConsumptionRate = (state) =>
  consumeDetails.getConsumptionRate(state.energyConsumption);

export const getBatteryLevel = (state) =>
  batteryDetails.getBatteryLevel(state.battery);

export const getBatteryDirection = (state) =>
  batteryDetails.getBatteryDirection(state.battery);

export const getGridPrice = (state) =>
  buysellDetails.getGridPrice(state.buysell);

export const getZeroTo10Price = (state) =>
  buysellDetails.getZeroTo10Price(state.buysell);

export const getTenTo20Price = (state) =>
  buysellDetails.getTenTo20Price(state.buysell);

export const getTwentyTo30Price = (state) =>
  buysellDetails.getTwentyTo30Price(state.buysell);

export const getThirtyTo40Price = (state) =>
  buysellDetails.getThirtyTo40Price(state.buysell);

export const getFourtyTo50Price = (state) =>
  buysellDetails.getFourtyTo50Price(state.buysell);

export const getFiftyTo60Price = (state) =>
  buysellDetails.getFiftyTo60Price(state.buysell);

export const getSixtyTo70Price = (state) =>
    buysellDetails.getSixtyTo70Price(state.buysell);

export const getSeventyTo80Price = (state) =>
  buysellDetails.getSeventyTo80Price(state.buysell);

export const getEightyTo90Price = (state) =>
  buysellDetails.getEightyTo90Price(state.buysell);

export const getNinetyTo100Price = (state) =>
  buysellDetails.getNinetyTo100Price(state.buysell);
