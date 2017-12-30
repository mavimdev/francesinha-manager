import alt from '../alt';

class HomeActions {
  constructor() {
    this.generateActions(
      'getCurrentEventSuccess',
      'getCurrentEventFail'
    );
  }

  getCurrentEvent() {
    let now = new Date();
    let eventId = now.getFullYear().toString().concat(now.getMonth());
    
    $.ajax({ url: '/api/event/' + eventId })
      .done((data) => {
        this.actions.getCurrentEventSuccess(data);
      })
      .fail((jqXhr) => {
        this.actions.getCurrentEventFail(jqXhr);
      });
  }

  
}

export default alt.createActions(HomeActions);  