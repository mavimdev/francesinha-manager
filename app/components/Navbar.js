import React from 'react';
import {Link} from 'react-router';
import NavbarStore from '../stores/NavbarStore';
import NavbarActions from '../actions/NavbarActions';

class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = NavbarStore.getState();
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    NavbarStore.listen(this.onChange);
    NavbarActions.getEvents();
    // let socket = io.connect();

    // socket.on('onlineUsers', (data) => {
    //   NavbarActions.updateOnlineUsers(data);
    // });
   
    $(document).ajaxStart(() => {
      NavbarActions.updateAjaxAnimation('fadeIn');
    });

    $(document).ajaxComplete(() => {
      setTimeout(() => {
        NavbarActions.updateAjaxAnimation('fadeOut');
      }, 500);
    });
  }

  componentWillUnmount() {
    NavbarStore.unlisten(this.onChange);
  }

  onChange(state) {
    this.setState(state);
  }

  render() {
    let events = this.state.events
      .filter((ev) => { return (ev.monthVisible) })
      .map((ev) => {
        return (
          <li key={ev.eventId}>
            <Link to={'/event/' + ev.eventId}>
              {ev.desc}
            </Link>
          </li >
        )
      });

    let now = new Date();
    let currentEventId = now.getFullYear().toString().concat(now.getMonth());
    let currentEvent = this.state.events.find((ev) => { 
      return (ev.eventId == currentEventId); 
    });

    return (
      <nav className='navbar navbar-default navbar-static-top'>
        <div className='navbar-header'>
          <button type='button' className='navbar-toggle collapsed' data-toggle='collapse' data-target='#navbar'>
            <span className='sr-only'>Toggle navigation</span>
            <span className='icon-bar'></span>
            <span className='icon-bar'></span>
            <span className='icon-bar'></span>
          </button>
          <Link to='/' className='navbar-brand'>
            <span ref='triangles' className={'triangles animated ' + this.state.ajaxAnimationClass}>
              <div className='tri invert'></div>
              <div className='tri invert'></div>
              <div className='tri'></div>
              <div className='tri invert'></div>
              <div className='tri invert'></div>
              <div className='tri'></div>
              <div className='tri invert'></div>
              <div className='tri'></div>
              <div className='tri invert'></div>
            </span>
            FRANCESINHAS
            {/* <span className='badge badge-up badge-danger'>{this.state.onlineUsers}</span> */}
          </Link>
        </div>
        <div id='navbar' className='navbar-collapse collapse'>
          <ul className='nav navbar-nav'>
            <li><Link to='/'>Home</Link></li>
            <li><Link to='/events'>Quem escolhe</Link></li>
            <li className='dropdown'>
              <a href='#' className='dropdown-toggle' data-toggle='dropdown'>Quem vai <span className='caret'></span></a>
              <ul className='dropdown-menu'>
                {events.length  > 0 ? events : <li style={{'color': '#ccc', 'textAlign': 'center'}}>Sem eventos marcados</li>}
              </ul>
            </li>
          </ul>
          <span className="navbar-text" style={{'float': 'right', 'marginRight': '100px'}}>
            Inscritos este mês: {currentEvent && currentEvent.monthVisible ? currentEvent.attenders.length : 0}
          </span>
        </div>
      </nav>
    );
  }
}

export default Navbar;
