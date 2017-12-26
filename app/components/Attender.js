import React from 'react';
import AttenderStore from '../stores/AttenderStore'
import AttenderActions from '../actions/AttenderActions';
import AddAttender from '../components/AddAttender';

class Attender extends React.Component {
  constructor(props) {
    super(props);
    this.state = AttenderStore.getState();
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    AttenderStore.listen(this.onChange);
    AttenderActions.getAttenders(this.props.params.eventId);
  }

  componentWillUnmount() {
    AttenderStore.unlisten(this.onChange);
  }

  componentDidUpdate(prevProps) {
    // Fetch new event data when URL path changes
    if (prevProps.params.eventId !== this.props.params.eventId) {
      AttenderActions.getAttenders(this.props.params.eventId);
    }
  }

  onChange(state) {
    if (state.newAttender && this.state.event.attenders) {
      this.state.event.attenders.push(state.newAttender);
    }
    this.setState(state);
  }

  removeAttender(attender, event) {
    event.preventDefault();
    AttenderActions.removeAttender(attender, this.props.params.eventId);
  }

  render() {
    let attenders = [];
    if (this.state.event.attenders) {
      attenders = this.state.event.attenders.map(attender => {
        return (
          <tr>
            <td>
              {attender.name}
            </td>
            {/* <td className='col-lg-1 edit' onClick={this.editAttender.bind(this, attender)}>
              Editar
            </td> */}
            <td className='col-lg-1  col-xs-1 remove'>
              <a type='button' className='btn btn-default btn-xs' onClick={this.removeAttender.bind(this, attender)}> Remover</a>
            </td>
          </tr>
        )
      });
    }

    return (
      <div className='container'>
        <div className='panel panel-default'>
          <table className='table table-striped'>
            <thead>
              <tr>
                <th colSpan='3'>Inscritos</th>
              </tr>
            </thead>
            <tbody>
              {attenders}
              <tr>
                <td colSpan='3'>
                  <strong> Total: {attenders.length} </strong>
                </td>
              </tr>
              <tr>
                <td colSpan='3'>
                  <AddAttender eventId={this.props.params.eventId} onChangeParent={this.onChange} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default Attender;