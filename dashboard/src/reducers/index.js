import { combineReducers } from 'redux'

import battery from './battery'
import energyCreation, * as createDetails from './energyCreation'

const beepBlock = combineReducers({
  battery,
  energyCreation
});

export default beepBlock

export const getCreationRate = (state) =>
  createDetails.getCreationRate(state.energyCreation);
