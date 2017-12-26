import React from 'react';
import AddAttenderStore from '../stores/AddAttenderStore';
import AddAttenderActions from '../actions/AddAttenderActions';

class AddAttender extends React.Component {
  constructor(props) {
    super(props);
    this.state = AddAttenderStore.getState();
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    AddAttenderStore.listen(this.onChange);
  }

  componentWillUnmount() {
    AddAttenderStore.unlisten(this.onChange);
  }

  onChange(state) {
    this.setState(state);
    this.props.onChangeParent(state);
  }

  handleSubmit(event) {
    event.preventDefault();

    var name = this.state.name.trim();
    var event = this.props.eventId;
    var pinCode = this.state.pinCode;
    var onChange = this.props.onChange;

    if (!name) {
      AddAttenderActions.invalidName();
      this.refs.nameTextField.getDOMNode().focus();
    }

    if (name && event) {
      AddAttenderActions.addAttender(name, event, pinCode);
    }
  }

  render() {
    return (
      <form className='form' onSubmit={this.handleSubmit.bind(this)}>
        <div className={'form-group ' + this.state.nameValidationState}>
          <input type='text' className={'form-control ' + this.state.success} ref='nameTextField' value={this.state.name}
            placeholder="Nome" onChange={AddAttenderActions.updateName} autoFocus />
            <input type='hidden' value="1234"/>
          <span className='help-block'>{this.state.helpBlock}</span>
        </div>
        <button inline type='submit' className={'btn btn-primary ' + this.state.success}>Inscrever</button>
      </form>
    );
  }
}

export default AddAttender;
