import { combineReducers } from 'redux'

import battery, * as batteryDetails from './battery'
import energyCreation, * as createDetails from './energyCreation'
import energyConsumption, * as consumeDetails from './energyConsumption'

const beepBlock = combineReducers({
  battery,
  energyCreation,
  energyConsumption
});

export default beepBlock

export const getCreationRate = (state) =>
  createDetails.getCreationRate(state.energyCreation);

export const getConsumptionRate = (state) =>
  consumeDetails.getConsumptionRate(state.energyConsumption);

export const getBatteryLevel = (state) =>
  batteryDetails.getBatteryLevel(state.battery);
