import React from 'react';
import { Link } from 'react-router';
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

  removeEvent(eventId, e) {
    e.preventDefault();
    EventActions.removeEvent(eventId, this.state.pinCode);
  }

  render() {
    let events = this.state.events
      .sort((a, b) => { return a.month - b.month; })
      .map(event => {
        return (
          <tr key={event.eventId}>
            <td style={event.monthVisible ? {} : { 'color': '#ccc' }}>
              {event.monthVisible ?
                (<Link to={'/event/' + event.eventId}>
                  {event.desc}
                </Link>
                ) : "<Por atribuir>"
              }
            </td>
            <td>
              {event.organizerName}
            </td>
            <td style={event.local ? {} : { 'color': '#ccc' }}>
              {event.local ? event.local : "<Por definir>"}
            </td>
            <td style={event.monthVisible ? {} : { 'color': '#ccc' }}>
              {event.monthVisible ? moment(event.date).format('DD-MM-YYYY') : "<Por atribuir>"}
            </td>
            <td className='col-lg-1  col-xs-1 remove'>
              <a type='button' className='btn btn-default btn-xs' onClick={this.removeEvent.bind(this, event.eventId)}> Remover</a>
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
          <div style={{ 'textAlign': 'center', 'color': '#3b3f51 ' }}>Os meses serão atribuídos aleatóriamente quando houver 12 inscrições.</div>
        </form>
      );
    } else {
      addEvent = (
        <div>
          <strong style={{ 'color': '#3b3f51 ' }}>Inscrições fechadas. Todos os meses já estão atribuídos. </strong>
        </div>
      );
    }

    return (
      <div className='container'>
      <h4 className='text-center'>Inscrições para a escolha de francesinhas</h4>
      <br/>
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