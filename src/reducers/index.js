import {combineReducers} from 'redux';
import {SET_USER, CLEAR_USER, SET_CURRENT_CHANNEL, SET_PRIVATE_CHANNEL, SET_USER_POSTS, SET_COLORS} from '../actions/types';

const initialUserState = {
  currentUser: null,
  isLoading: true,
  userPosts: null
};

const user_reducer = (state = initialUserState, action) => {
  switch(action.type){
    case SET_USER:
      return{
        currentUser: action.payload.currentUser,
        isLoading: false
      };
    case CLEAR_USER:
      return{
        ...state,
        isLoading: false
      };
    case SET_USER_POSTS:
      return{
        ...state,
        userPosts: action.payload.userPosts
      };
    default:
      return state;
  }
};

const initialChannelState = {
  currentChannel: null,
  isPrivateChannel: false
};

const channel_reducer = (state = initialChannelState, action) => {
  switch(action.type){
    case SET_CURRENT_CHANNEL:
      return{
        ...state,
        currentChannel: action.payload.currentChannel
      };
    case SET_PRIVATE_CHANNEL:
      return{
        ...state,
        isPrivateChannel: action.payload.isPrivateChannel
      };
    default:
      return state;
  }
};

const initialColorState = {
  primaryColor: '#4c3c4c',
  secondaryColor: '#eee'
};

const colors_reducer = (state = initialColorState, action) => {
  switch(action.type){
    case SET_COLORS:
      return{
        primaryColor: action.payload.primaryColor,
        secondaryColor: action.payload.secondaryColor,
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  user: user_reducer,
  channel: channel_reducer,
  colors: colors_reducer
});

export default rootReducer;