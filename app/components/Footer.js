import React from 'react';
import {Link} from 'react-router';
import FooterStore from '../stores/FooterStore'
import FooterActions from '../actions/FooterActions';

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state = FooterStore.getState();
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    FooterStore.listen(this.onChange);
    FooterActions.getThisMonthOrganizer();
    FooterActions.getNextMonthOrganizer();
  }

  componentWillUnmount() {
    FooterStore.unlisten(this.onChange);
  }

  onChange(state) {
    this.setState(state);
  }

  render() {
    let thisMonthOrganizer = this.state.thisMonthOrganizer;
    let nextMonthOrganizer = this.state.nextMonthOrganizer;
    return (
      <footer>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-5'>
              <h3 className='lead'></h3>
              <p>© 2018 MAvim</p>
            </div>
            <div className='col-sm-7 hidden-xs'>
              <h4 className=''>Quem escolhe:</h4>
              <ul className='list-inline'>
                <p>Este mês: <strong>{thisMonthOrganizer} </strong> </p>
                <p>Próximo mês: <strong>{nextMonthOrganizer} </strong> </p>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;