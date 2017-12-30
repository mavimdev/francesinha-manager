import React from 'react';
import EventStore from '../stores/EventStore'
import EventActions from '../actions/EventActions';
import moment from 'moment';

const EVENTS_LIMIT = 12;

class Event extends React.Component {
  constructor(props) {
    super(props);
    this.state = EventStore.getState();
    this.onChange = this.onChange.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    var organizerName = this.state.organizerName.trim();
    var pinCode = this.state.pinCode;

    if (!organizerName) {
      EventActions.invalidName();
      this.refs.nameTextField.getDOMNode().focus();
    }

    if (organizerName) {
      EventActions.addEvent(organizerName, pinCode);
    }
  }

  componentDidMount() {
    EventStore.listen(this.onChange);
    EventActions.getEvents();
  }

  componentWillUnmount() {
    EventStore.unlisten(this.onChange);
  }

  onChange(state) {
    this.setState(state);
  }

  removeEvent(event, e) {
    e.preventDefault();
    EventActions.removeEvent(event);
  }

  render() {
    let events = this.state.events.map(event => {
      return (
        <tr>
          <td>
            {event.monthVisible ? event.desc : "<Por atribuir>"}
          </td>
          <td>
            {event.organizerName}
          </td>
          <td>
            {event.local}
          </td>
          <td>
            {moment(event.date).format('DD-MM-YYYY')}
          </td>
          <td className='col-lg-1  col-xs-1 remove'>
            <a type='button' className='btn btn-default btn-xs' onClick={this.removeEvent.bind(this, event)}> Remover</a>
          </td>
        </tr>
      )
    });

    var addEvent = null;
    if (events.length < EVENTS_LIMIT) {
      addEvent = (
        <form className='form' onSubmit={this.handleSubmit.bind(this)}>
          <div className={'form-group ' + this.state.organizerValidationState}>
            <input type='text' className={'form-control ' + this.state.success} ref='nameTextField' value={this.state.organizerName}
              placeholder="Nome" onChange={EventActions.updateOrganizer} autoFocus />
            <span className='help-block'>{this.state.helpBlock}</span>
          </div>
          <button inline type='submit' className={'btn btn-primary ' + this.state.success}>Inscrever</button>
          <div style={{'textAlign': 'center', 'color': '#FF9F00 '}}>Os meses serão atribuídos aleatóriamente quando houver 12 inscrições.</div>
        </form>
      );
    } else {
      addEvent = (
      <div>
        <strong>Inscrições fechadas. Todos os meses já se encontram atribuídos. </strong>
      </div>
      );
    }

    return (
      <div className='container'>
        <div className='panel panel-default'>
          <table className='table table-striped'>
            <thead>
              <tr>
                <th>Mês</th>
                <th>Nome</th>
                <th>Local escolhido</th>
                <th colSpan='2'>Data de realização</th>
              </tr>
            </thead>
            <tbody>
              {events}
              <tr>
                <td colSpan='5'>
                  <strong> Total: {events.length} </strong>
                </td>
              </tr>
              <tr>
                <td colSpan='5'>
                  {addEvent}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default Event;