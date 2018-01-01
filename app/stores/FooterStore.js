import alt from '../alt';
import FooterActions from '../actions/FooterActions';

class FooterStore {
  constructor() {
    this.bindActions(FooterActions);
    this.characters = [];
    this.thisMonthOrganizer = "";
    this.nextMonthOrganizer = "";
  }

  onGetTopCharactersSuccess(data) {
    this.characters = data.slice(0, 5);
  }

  onGetTopCharactersFail(jqXhr) {
    // Handle multiple response formats, fallback to HTTP status code number.
    toastr.error(jqXhr.responseJSON && jqXhr.responseJSON.message || jqXhr.responseText || jqXhr.statusText);
  }

  onGetThisMonthOrganizerSuccess(data) {
    if (data.monthVisible) {
      this.thisMonthOrganizer = data.organizerName;
    }
  }

  onGetThisMonthOrganizerFail(jqXhr) {
    // let data be empty
  }

  onGetNextMonthOrganizerSuccess(data) {
    if (data.monthVisible) {
      this.nextMonthOrganizer = data.organizerName;
    }
  }

  onGetNextMonthOrganizerFail(jqXhr) {
    // let data be empty
  }

}

export default alt.createStore(FooterStore);
