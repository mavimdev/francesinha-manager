import alt from '../alt';

class EventActions {
  constructor() {
    this.generateActions(
      'getEventSuccess',
      'getEventFail',
      'removeAttenderSuccess',
      'removeAttenderFail'
    );
  }

  getEvent(eventId) {
    $.ajax({ url: '/api/event/' + eventId })
      .done((data) => {
        this.actions.getEventSuccess(data);
      })
      .fail((jqXhr) => {
        this.actions.getEventFail(jqXhr);
      });
  }

  removeAttender(attender, eventId) {
    $.ajax({
      type: 'DELETE',
      url: '/api/Attenders',
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

export default alt.createActions(EventActions);