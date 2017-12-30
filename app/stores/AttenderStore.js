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

  onGetAttendersFail(errorMessage) {
    toastr.error(errorMessage);
  }

  onRemoveAttenderSuccess(data) {
    toastr.success(data.message);
    this.event = data.event;
  }

  onRemoveAttenderFail(errorMessage) {
    toastr.error(errorMessage);
  }
}

export default alt.createStore(AttenderStore);