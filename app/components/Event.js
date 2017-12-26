import React from 'react';
import EventStore from '../stores/EventStore'
import EventActions from '../actions/EventActions';
import AddEvent from '../components/AddEvent';

class Event extends React.Component {
  constructor(props) {
    super(props);
    this.state = EventStore.getState();
    this.onChange = this.onChange.bind(this);
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
            {event.desc}
          </td>
          <td>
            {event.EventName}
          </td>
          <td>
            {event.local}
          </td>
          <td>
            {event.date}
          </td>
          <td className='col-lg-1  col-xs-1 remove'>
            <a type='button' className='btn btn-default btn-xs' onClick={this.removeEvent.bind(this, event)}> Remover</a>
          </td>
        </tr>
      )
    });

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
                  <AddEvent eventId={this.props.params.eventId} onChangeParent={this.onChange} />
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