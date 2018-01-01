import React from 'react';
import {Link} from 'react-router';
import HomeStore from '../stores/HomeStore';
import HomeActions from '../actions/HomeActions';
import Attender from './Attender';
import Event from './Event';

class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = HomeStore.getState();
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    HomeStore.listen(this.onChange);
    HomeActions.getCurrentEvent();
  }

  componentWillUnmount() {
    HomeStore.unlisten(this.onChange);
  }

  onChange(state) {
    this.setState(state);
  }


  render() {
    if (!this.state.event.eventId) {
      return (<Event />);
    } else if (this.state.event.monthVisible) {
      return (<Attender eventId={this.state.event.eventId} />);
    }
  }
}

export default Home;