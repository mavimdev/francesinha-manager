// Babel ES6/JSX Compiler
require('babel-register');

var _ = require('underscore');
var async = require('async');
var request = require('request');
var xml2js = require('xml2js');
var swig = require('swig');
var React = require('react');
var ReactDOM = require('react-dom/server');
var Router = require('react-router');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var express = require('express');
var config = require('./config');
var routes = require('./app/routes');
var Character = require('./models/character');
var Event = require('./models/event');

var MONTHS_DESC = ['Janeiro', 'Fevereiro', 'Março', 'Abril'
  , 'Maio', 'Junho', 'Julho', 'Agosto'
  , 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

mongoose.connect(config.database).then(
  () => { 
    console.info('Connected to MongoDB.');
   },
  err => {
    console.error('Error: Could not connect to MongoDB: ' + err);
   }
);

// mongoose.connection.on('error', function () {
//   console.info('Error: Could not connect to MongoDB. Did you forget to run `mongod`?');
// });

// express middleware
var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * GET /api/event/:eventId
 * Looks up a event with value.
 */
app.get('/api/event/:eventId', function (req, res, next) {
  var eventId = req.params.eventId;

  Event.findOne({ eventId: eventId }, function (err, event) {
    if (err) return next(err);

    if (!event) {
      return res.status(404).send({ message: 'Evento não encontrado.' });
    }

    res.send(event);
  });
});

/**
 * GET /api/events/:year
 * Get events of a year.
 */
app.get('/api/events/:year', function (req, res, next) {
  var year = Number(req.params.year);

  Event.find({ $or: [{ year: year }, { year: (year + 1) }] }, function (err, event) {
    if (err) return next(err);

    if (!event) {
      return res.status(404).send({ message: 'Não foram encontrados eventos' });
    }
    res.send(event);

  }).sort("year").limit(12);
});


/**
 * POST /api/attenders
 * Adds new attender to the database.
 */
app.post('/api/attenders', function (req, res, next) {
  var attenderName = req.body.name;
  var pinCode = req.body.pinCode;
  var eventId = Number(req.body.eventId);

  async.waterfall([
    function (callback) {
      Event.findOne({ eventId: eventId }, function (err, event) {
        if (err) return next(err);

        if (!event) {
          return res.status(409).send({ message: 'O evento não existe.' });
        }

        if (_.find(event.attenders, function (attender) {
          return attenderName.toUpperCase() === attender.name.toUpperCase();
        })) {
          return res.status(409).send({ message: 'Esse nome já se encontra nos inscritos.' });
        }

        callback(err, eventId, attenderName, pinCode);
      });
    },

    function (eventId, attenderName, pinCode) {
      Event.update({ eventId: eventId }, { $push: { attenders: { name: attenderName, pinCode: pinCode } } }, function (err) {
        if (err) return next(err);
        res.send({ attender: { name: attenderName, pinCode: pinCode }, message: 'Inscrito com sucesso.' });
      });
    }
  ]);
});

/**
 * DELETE /api/attenders
 * Removes an attender of the database.
 */
app.delete('/api/attenders', function (req, res, next) {
  var attenderName = req.body.name;
  var pinCode = Number(req.body.pinCode);
  var eventId = Number(req.body.eventId);

  async.waterfall([
    function (callback) {
      Event.findOne({ eventId: eventId }, function (err, event) {
        if (err) return next(err);

        if (!event) {
          return res.status(400).send({ message: 'Evento não encontrado.' });
        }

        var attender = _.find(event.attenders, function (attender) {
          return attenderName.toUpperCase() === attender.name.toUpperCase()
        });
        if (!attender) {
          return res.status(400).send({ message: 'Participante não encontrado.' });
        }
        if (Number(attender.pinCode) == pinCode) {
          callback(err, eventId, attenderName, pinCode);
        } else {
          return res.status(401).send({ message: 'Código PIN incorreto.' });
        }
      });
    },
    function (eventId, attenderName, pinCode) {
      Event.findOneAndUpdate({ eventId: eventId }
        , { $pull: { attenders: { name: attenderName } } }
        , { new: true }
        , function (err, event) {
          if (err) return next(err);

          res.send({ event: event, message: 'Removido com sucesso.' });
        });
    }
  ]);
});


/**
 * POST /api/events
 * Adds new event (with the organizer) to the database.
 */
app.post('/api/events', function (req, res, next) {
  var organizerName = req.body.organizerName;
  var pinCode = Number(req.body.pinCode);
  var currentYear = new Date().getFullYear();

  async.waterfall([
    function (callback) {
      Event.findOne({ $and: [{ organizerName: organizerName }, { year: currentYear }] }, function (err, event) {
        if (err) return next(err);

        if (event) {
          return res.status(409).send({ message: 'Não pode organizar mais de um evento.' });
        }
        callback(null);
      })
    },
    function (callback) {
      var usedMonths = [];
      Event.find({ year: currentYear }, function (err, events) {
        if (err) return next(err);

        usedMonths = _.map(events, function (event) { return event.month; });
        callback(null, usedMonths);
      })
    },
    function (usedMonths, callback) {
      var randomMonth = _.sample(_.difference(_.range(12), usedMonths));

      let lastFriday = new Date(currentYear, randomMonth + 1, 1);
      lastFriday.setDate(lastFriday.getDate()-1);
      lastFriday.setDate(lastFriday.getDate()-(2+lastFriday.getDay())%7);

      var event = new Event({
        eventId: currentYear.toString().concat(randomMonth),
        desc: MONTHS_DESC[randomMonth],
        organizerName: organizerName,
        pinCode: pinCode,
        local: "",
        date: lastFriday,
        month: randomMonth,
        monthVisible: false,
        year: currentYear,
        attenders: [{
          name: organizerName,
          pinCode: pinCode
        }]
      });

      event.save(function (err) {
        if (err) return next(err);

        callback(null);
      })
    },
    function (callback) {
      Event.find({ year: currentYear }, function (err, events) {
        if (err) return next(err);

        callback(null, events);
      });
    },
    function (events) {
      if (events.length == MONTHS_DESC.length) {
        Event.update({ year: currentYear }, { monthVisible: true }, { multi: true },  function (err) {
          if (err) return next(err);
        })
      }
      res.send({ events: events, message: 'Inscrição efetuada com sucesso' });
    }
  ]);
});


/**
 * PUT /api/events
 * Updates an event to the database.
 */
app.put('/api/events', function (req, res, next) {
  var eventId = Number(req.body.eventId);
  var newLocal = req.body.local;
  var newOrganizerName = req.body.organizerName;
  var pinCode = Number(req.body.pinCode);

  Event.update({ eventId: eventId, pinCode: pinCode },
    { $set: { local: newLocal, organizerName: newOrganizerName } }, function (err, result) {
      if (err) return next(err);

      if (result.nModified == 1) {
        res.send({ message: 'Atualizado com sucesso' });
      } else {
        return res.status(404).send({ message: 'Evento não encontrado ou código PIN incorreto.' });
      }
    })

});


/**
 * DELETE /api/events
 * Removes an event of the database.
 */
app.delete('/api/events', function (req, res, next) {
  var eventId = Number(req.body.eventId);
  var pinCode = Number(req.body.pinCode);

  async.waterfall([
    function (callback) {
      Event.remove({ eventId: eventId, pinCode: pinCode }, function (err, result) {
        if (err) return next(err);

        if (result.deletedCount == 1) {
          callback(null);
        } else {
          return res.status(404).send({ message: 'Evento não encontrado ou código PIN incorreto.' });
        }

      })
    },
    function () {
      Event.find({ year: new Date().getFullYear() }, function (err, events) {
        if (err) return next(err);

        res.send({ events: events, message: 'Removido com sucesso' });
      });
    }
  ]);
});


/**
 * 
 */
app.use(function (req, res) {
  Router.match({ routes: routes.default, location: req.url }, function (err, redirectLocation, renderProps) {
    if (err) {
      res.status(500).send(err.message)
    } else if (redirectLocation) {
      res.status(302).redirect(redirectLocation.pathname + redirectLocation.search)
    } else if (renderProps) {
      var html = ReactDOM.renderToString(React.createElement(Router.RoutingContext, renderProps));
      var page = swig.renderFile('views/index.html', { html: html });
      res.status(200).send(page);
    } else {
      res.status(404).send('Page Not Found')
    }
  });
});

// React middleware
/**
 * Socket.io stuff.
 */
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var onlineUsers = 0;

io.sockets.on('connection', function (socket) {
  onlineUsers++;

  io.sockets.emit('onlineUsers', { onlineUsers: onlineUsers });

  socket.on('disconnect', function () {
    onlineUsers--;
    io.sockets.emit('onlineUsers', { onlineUsers: onlineUsers });
  });
});

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
