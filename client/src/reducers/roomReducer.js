import {
  ROOM,
  NEW_ROOM,
  DELETE_ROOM,
  GET_MESSAGES,
  GET_LINK,
  ACCEPT_INVITE,
  LOADING
} from '../actions/types';

export default function(state = {}, action) {
  let newState = Object.assign({}, state);

  switch (action.type) {
    case NEW_ROOM:
      return action.payload;
    case DELETE_ROOM:
      return action.payload;
    case GET_MESSAGES:
      // let newState = Object.assign({}, state);
      newState.messages = action.payload;
      return newState;
    case LOADING:
      if (action.payload.target === ROOM) {
        // let newLoadingState = Object.assign({}, state);
        newState.isLoading = action.payload.isLoading;
        return newState;
      }
      return state;
    case GET_LINK:
      // let newState = Object.assign({}, state);
      newState.link = action.payload;
      return newState;
    case ACCEPT_INVITE:
      if (action.payload.accepted) {
        newState.accepted = action.payload.accepted;
        return newState;
      } else {
        return state;
      }
    default:
      return state;
  }
}
