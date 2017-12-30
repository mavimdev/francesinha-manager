import alt from '../alt';
import HomeActions from '../actions/HomeActions';

class HomeStore {
  constructor() {
    this.bindActions(HomeActions);
    this.event = {};
  }

  onGetCurrentEventSuccess(data) {
    this.event = data;
  }

  onGetCurrentEventFail(errorMessage) {
    //do nothing. doesn't return data
  }

}

export default alt.createStore(HomeStore);