
import { combineReducers } from 'redux';

import {
  NEW_POSITION
} from '../actions';

const AppState = (state = [{div:'div0',x: 150,y: 50},
	{div:'div1',x:300,y:150},{div:'div2',x:150,y:400},
	{div:'div3',x:360,y:450}], action) => {
  switch (action.type) {
    case NEW_POSITION:
      return action.position;
    default:
      return state;
  }
};


const rootReducer = combineReducers({
  AppState
});

export default rootReducer;

