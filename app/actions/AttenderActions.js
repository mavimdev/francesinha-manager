import alt from '../alt';

class AttenderActions {
  constructor() {
    this.generateActions(
      'getAttendersSuccess',
      'getAttendersFail',
      'removeAttenderSuccess',
      'removeAttenderFail',
      'updateEventLocal',
      'updateEventSuccess',
      'updateEventFail'
    );
  }

  getAttenders(eventId) {
    $.ajax({ url: '/api/event/' + eventId })
      .done((data) => {
        this.actions.getAttendersSuccess(data);
      })
      .fail((jqXhr) => {
        this.actions.getAttendersFail(jqXhr.responseJSON.message);
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

  updateEvent(event, pinCode) {
    $.ajax({
      type: 'PUT',
      url: '/api/events',
      data: {eventId: event.eventId, local: event.local, organizerName: event.organizerName, pinCode: pinCode}
    })
      .done((data) => {
        this.actions.updateEventSuccess(data);
      })
      .fail((jqXhr) => {
        this.actions.updateEventFail(jqXhr.responseJSON.message);
      });
  }

}

export default alt.createActions(AttenderActions);