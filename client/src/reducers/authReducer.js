import { LOADING, AUTH, FETCH_USER, LOG_IN, LOG_OUT } from '../actions/types';

export default function(state = {}, action) {
  switch (action.type) {
    case FETCH_USER:
      return action.payload;
    case LOG_IN:
      return action.payload;
    case LOG_OUT:
      return action.payload;
    case LOADING:
      if (state && action.payload.target === AUTH) {
        state.isLoading = action.payload.isLoading;
      }
      return state;
    default:
      return state;
  }
}
