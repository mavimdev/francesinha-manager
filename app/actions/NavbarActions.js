import alt from '../alt';

class NavbarActions {
  constructor() {
    this.generateActions(
      'updateOnlineUsers',
      'updateAjaxAnimation',
      'getEventsSuccess',
      'getEventsFail',
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
}

export default alt.createActions(NavbarActions);