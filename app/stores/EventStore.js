import alt from '../alt';
import EventActions from '../actions/EventActions';

class EventStore {
  constructor() {
    this.bindActions(EventActions);
    this.event = {};
  }

  onGetEventSuccess(data) {
    this.event = data;
  }

  onGetEventFail(jqXhr) {
    toastr.error(jqXhr.responseJSON.message);
  }

  onRemoveAttenderSuccess(data) {
    toastr.success(data.message);
    this.event = data.event;
  }

  onRemoveAttenderFail(errorMessage) {
    toastr.error(jqXhr.responseJSON.message);
  }
}

export default alt.createStore(EventStore);