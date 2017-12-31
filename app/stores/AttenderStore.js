import alt from '../alt';
import AttenderActions from '../actions/AttenderActions';

class AttenderStore {
  constructor() {
    this.bindActions(AttenderActions);
    this.event = {};
    this.pinCode = 0;
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

  onUpdateEventSuccess(data) {
    toastr.success(data.message);
  }

  onUpdateEventFail(errorMessage) {
    this.localValidationState = 'has-error';
    this.helpBlock = errorMessage;
  }

  onUpdateEventLocal(event) {
    this.event.local = event.target.value;
    this.localValidationState = '';
    this.helpBlock = '';
  }

}

export default alt.createStore(AttenderStore);