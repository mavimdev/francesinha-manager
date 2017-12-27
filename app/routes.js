import React from 'react';
import {Route} from 'react-router';
import App from './components/App';
import Home from './components/Home';
import Attender from './components/Attender';
import Event from './components/Event';

export default (
  <Route component={App}>
    <Route path='/' component={Home} />
    <Route path='/event/:eventId' component={Attender} />
    <Route path='/events' component={Event} />
  </Route>
);
