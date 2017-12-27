import alt from '../alt';
import AddAttenderActions from '../actions/AddAttenderActions';

class AddAttenderStore {
  constructor() {
    this.bindActions(AddAttenderActions);
    this.name = '';
    this.pinCode = '';
    this.eventId = 0;
    this.helpBlock = '';
    this.success = '';
    this.nameValidationState = '';
  }

  onAddAttenderSuccess(data) {
    this.nameValidationState = 'has-success';
    this.helpBlock = data.message;
    this.name = '';
    this.pinCode = '';
    this.success = 'hide';
    this.newAttender = data.attender;
  }

  onAddAttenderFail(errorMessage) {
    this.nameValidationState = 'has-error';
    this.helpBlock = errorMessage;
  }

  onUpdateName(event) {
    this.name = event.target.value;
    this.nameValidationState = '';
    this.helpBlock = '';
  }

  onInvalidName() {
    this.nameValidationState = 'has-error';
    this.helpBlock = 'Introduza o nome.';
  }

}

export default alt.createStore(AddAttenderStore);