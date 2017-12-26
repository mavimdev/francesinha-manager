import alt from '../alt';
import AttenderActions from '../actions/AttenderActions';

class AttenderStore {
  constructor() {
    this.bindActions(AttenderActions);
    this.event = {};
  }

  onGetAttendersSuccess(data) {
    this.event = data;
  }

  onGetAttendersFail(jqXhr) {
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

export default alt.createStore(AttenderStore);