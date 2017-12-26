import alt from '../alt';

class FooterActions {
  constructor() {
    this.generateActions(
      'getTopCharactersSuccess',
      'getTopCharactersFail',
      'getThisMonthOrganizerSuccess',
      'getThisMonthOrganizerFail',
      'getNextMonthOrganizerSuccess',
      'getNextMonthOrganizerFail'
    );
  }

  getTopCharacters() {
    $.ajax({ url: '/api/characters/top' })
      .done((data) => {
        this.actions.getTopCharactersSuccess(data)
      })
      .fail((jqXhr) => {
        this.actions.getTopCharactersFail(jqXhr)
      });
  }

  getThisMonthOrganizer() {
    var now = new Date();
    $.ajax({ url: '/api/event/' + now.getFullYear() + now.getMonth()})
    .done((data) => {
      this.actions.getThisMonthOrganizerSuccess(data)
    })
    .fail((jqXhr) => {
      this.actions.getThisMonthOrganizerFail(jqXhr)
    });
  }

  getNextMonthOrganizer() {
    var now = new Date();
    var next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    $.ajax({ url: '/api/event/' + next.getFullYear() + next.getMonth()})
    .done((data) => {
      this.actions.getNextMonthOrganizerSuccess(data)
    })
    .fail((jqXhr) => {
      this.actions.getNextMonthOrganizerFail(jqXhr)
    });
  }

}

export default alt.createActions(FooterActions);