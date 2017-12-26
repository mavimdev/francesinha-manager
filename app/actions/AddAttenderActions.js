import alt from '../alt';

class AddAttenderActions {
  constructor() {
    this.generateActions(
      'addAttenderSuccess',
      'addAttenderFail',
      'updateName',
      'invalidName'
    );
  }

  addAttender(name, eventId, pinCode) {
    $.ajax({
      type: 'POST',
      url: '/api/attenders',
      data: { name: name, eventId: eventId, pinCode: pinCode}
    })
      .done((data) => {
        this.actions.addAttenderSuccess(data);
      })
      .fail((jqXhr) => {
        this.actions.addAttenderFail(jqXhr.responseJSON.message);
      });
  }
}

export default alt.createActions(AddAttenderActions);