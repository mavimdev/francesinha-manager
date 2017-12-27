import alt from '../alt';
import EventActions from '../actions/EventActions';

class EventStore {
  constructor() {
    this.bindActions(EventActions);
    this.events = [];
    this.organizerName = '';
    this.pinCode = '';
    this.helpBlock = '';
    this.success = '';
    this.organizerValidationState = '';
  }

  onGetEventsSuccess(data) {
    this.events = data;
  }

  onGetEventsFail(jqXhr) {
    toastr.error(jqXhr.responseJSON.message);
  }

  onAddEventSuccess(data) {
    this.organizerValidationState = 'has-success';
    this.helpBlock = data.message;
    this.organizerName = '';
    this.pinCode = '';
    this.success = 'hide';
  }

  onAddEventFail(errorMessage) {
    this.organizerValidationState = 'has-error';
    this.helpBlock = errorMessage;
  }

  onRemoveEventSuccess(data) {
    toastr.success(data.message);
    this.event = data.event;
  }

  onUpdateOrganizer(event) {
    this.organizerName = event.target.value;
    this.organizerValidationState = '';
    this.helpBlock = '';
  }

  onInvalidOrganizer() {
    this.organizerValidationState = 'has-error';
    this.helpBlock = 'Introduza o nome.';
  }

  onRemoveEventFail(errorMessage) {
    toastr.error(jqXhr.responseJSON.message);
  }
}

export default alt.createStore(EventStore);