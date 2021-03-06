import alt from '../alt';

class EventActions {
  constructor() {
    this.generateActions(
      'getEventsSuccess',
      'getEventsFail',
      'addEventSuccess',
      'addEventFail',
      'removeEventSuccess',
      'removeEventFail',
      'updateOrganizer',
      'invalidOrganizer'
    );
  }

  getEvents() {
    $.ajax({ url: '/api/events/' + new Date().getFullYear() })
      .done((data) => {
        this.actions.getEventsSuccess(data)
      })
      .fail((jqXhr) => {
        this.actions.getEventsFail(jqXhr)
      });
  }

  addEvent(organizerName, pinCode) {
    $.ajax({
      type: 'POST',
      url: '/api/events',
      data: { 
        organizerName: organizerName, 
        pinCode: pinCode
      }
    })
      .done((data) => {
        this.actions.addEventSuccess(data);
      })
      .fail((jqXhr) => {
        this.actions.addEventFail(jqXhr.responseJSON.message);
      });
  }

  removeEvent(eventId, pinCode) {
    $.ajax({
      type: 'DELETE',
      url: '/api/events',
      data: { eventId: eventId, pinCode: pinCode}
    })
      .done((data) => {
        this.actions.removeEventSuccess(data);
      })
      .fail((jqXhr) => {
        this.actions.removeEventFail(jqXhr.responseJSON.message);
      });
  }

}

export default alt.createActions(EventActions);