import { combineReducers } from 'redux';
import { animation } from './animation.reducer';


const rootReducer = combineReducers({
    animation,
});

export default rootReducer;