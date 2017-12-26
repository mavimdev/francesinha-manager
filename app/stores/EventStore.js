import alt from '../alt';
import EventActions from '../actions/EventActions';

class EventStore {
  constructor() {
    this.bindActions(EventActions);
    this.events = [];
  }

  onGetEventsSuccess(data) {
    this.events = data;
  }

  onGetEventsFail(jqXhr) {
    toastr.error(jqXhr.responseJSON.message);
  }

  onRemoveEventSuccess(data) {
    toastr.success(data.message);
    this.event = data.event;
  }

  onRemoveEventFail(errorMessage) {
    toastr.error(jqXhr.responseJSON.message);
  }
}

export default alt.createStore(EventStore);