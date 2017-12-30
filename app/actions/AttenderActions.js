import alt from '../alt';

class AttenderActions {
  constructor() {
    this.generateActions(
      'getAttendersSuccess',
      'getAttendersFail',
      'removeAttenderSuccess',
      'removeAttenderFail'
    );
  }

  getAttenders(eventId) {
    $.ajax({ url: '/api/event/' + eventId })
      .done((data) => {
        this.actions.getAttendersSuccess(data);
      })
      .fail((jqXhr) => {
        this.actions.getAttendersFail(jqXhr);
      });
  }

  removeAttender(attender, eventId) {
    $.ajax({
      type: 'DELETE',
      url: '/api/attenders',
      data: { name: attender.name, eventId: eventId, pinCode: attender.pinCode}
    })
      .done((data) => {
        this.actions.removeAttenderSuccess(data);
      })
      .fail((jqXhr) => {
        this.actions.removeAttenderFail(jqXhr.responseJSON.message);
      });
  }

}

export default alt.createActions(AttenderActions);