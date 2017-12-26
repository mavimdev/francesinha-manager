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
      'updateName',
      'invalidName'
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

  AddEvent(event) {
    $.ajax({
      type: 'POST',
      url: '/api/events',
      data: { event: event}
    })
      .done((data) => {
        this.actions.AddEventSuccess(data);
      })
      .fail((jqXhr) => {
        this.actions.AddEventFail(jqXhr.responseJSON.message);
      });
  }

  removeEvent(event) {
    $.ajax({
      type: 'DELETE',
      url: '/api/events',
      data: { event: event}
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