import { combineReducers } from 'redux'

import battery from './battery'

const beepBlock = combineReducers({
  battery
});

export default beepBlock
