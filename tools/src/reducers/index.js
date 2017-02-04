
import { combineReducers } from 'redux';

import {
  NEW_POSITION
} from '../actions';

const AppState = (state = [], action) => {
  switch (action.type) {
    case NEW_POSITION:
      return [...state, action.message ];
    default:
      return state;
  }
};


const rootReducer = combineReducers({
  AppState
});

export default rootReducer;

