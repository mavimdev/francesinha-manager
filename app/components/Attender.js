import React from 'react';
import AttenderStore from '../stores/AttenderStore'
import AttenderActions from '../actions/AttenderActions';
import AddAttender from '../components/AddAttender';
import moment from 'moment';

class Attender extends React.Component {
  constructor(props) {
    super(props);
    this.state = AttenderStore.getState();
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    AttenderStore.listen(this.onChange);
    AttenderActions.getAttenders(this.props.eventId || this.props.params.eventId);
  }

  componentWillUnmount() {
    AttenderStore.unlisten(this.onChange);
  }

  componentDidUpdate(prevProps) {
    // Fetch new event data when URL path changes
    if (prevProps.params && prevProps.params.eventId !== this.props.params.eventId) {
      AttenderActions.getAttenders(this.props.params.eventId);
    }
  }

  onChange(state) {
    if (state.newAttender && this.state.event.attenders) {
      this.state.event.attenders.push(state.newAttender);
    }
    this.setState(state);
  }

  editEvent(event) {
    event.preventDefault();
    AttenderActions.updateEvent(this.state.event, this.state.pinCode);
  }

  removeAttender(attender, event) {
    event.preventDefault();
    AttenderActions.removeAttender(attender, this.props.eventId || this.props.params.eventId);
  }

  render() {
    if (!this.state.event.monthVisible) {
      return (<div/>);
    }
    let attenders = [];
    if (this.state.event.attenders) {
      attenders = this.state.event.attenders.map(attender => {
        return (
          <tr key={attender._id}>
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
      <h4 className='text-center'>Inscrições para o mês de {this.state.event.desc} ({moment(this.state.event.date).format('DD-MM-YYYY')})</h4>
        <br/>
        <div className="row">
          <div className="col-lg-6">
            <div className="input-group">
              <span className="input-group-btn">
                <span className="form-control" style={{ 'backgroundColor': '#f9f9f9' }}
                  type="text">Organizador:</span>
              </span>
              <span type="text" className="form-control" placeholder="" >
                {this.state.event.organizerName}
              </span>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="input-group">
              <span className="input-group-btn">
                <span className="form-control" style={{ 'backgroundColor': '#f9f9f9' }}
                  type="text">Local escolhido:</span>
              </span>
              <input type='text' className={'form-control ' + this.state.localValidationState} ref='localField' value={this.state.event.local}
                placeholder="Introduza o local" onChange={AttenderActions.updateEventLocal} autoFocus />
              <span className="input-group-btn">
                <button className="btn btn-default" onClick={this.editEvent.bind(this)}
                  type="button">Guardar</button>
              </span>
            </div>
            <span className='help-block'>{this.state.helpBlock || <br/>}</span>
          </div>
        </div>

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
                  <AddAttender eventId={this.props.eventId || this.props.params.eventId} onChangeParent={this.onChange} />
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