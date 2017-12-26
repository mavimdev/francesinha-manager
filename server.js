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

mongoose.connect(config.database);
mongoose.connection.on('error', function () {
  console.info('Error: Could not connect to MongoDB. Did you forget to run `mongod`?');
});

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
      return res.status(404).send({ message: 'Event not found.' });
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


// express API Routes
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
          return res.status(409).send({ message: 'Não existe esse evento.' });
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

app.delete('/api/Attenders', function (req, res, next) {
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
      Event.update({ eventId: eventId }, { $pull: { attenders: { name: attenderName } } }, function (err) {
        if (err) return next(err);
       
        res.send({ attender: { name: attenderName, pinCode: pinCode }, message: 'Removido com sucesso.' });
      });
    }
  ]);

});

/**
 * GET /api/characters
 * Returns 2 random characters of the same gender that have not been voted yet.
 */
app.get('/api/characters', function (req, res, next) {
  var choices = ['Female', 'Male'];
  var randomGender = _.sample(choices);

  Character.find({ random: { $near: [Math.random(), 0] } })
    .where('voted', false)
    .where('gender', randomGender)
    .limit(2)
    .exec(function (err, characters) {
      if (err) return next(err);

      if (characters.length === 2) {
        return res.send(characters);
      }

      var oppositeGender = _.first(_.without(choices, randomGender));

      Character.find({ random: { $near: [Math.random(), 0] } })
        .where('voted', false)
        .where('gender', oppositeGender)
        .limit(2)
        .exec(function (err, characters) {
          if (err) return next(err);

          if (characters.length === 2) {
            return res.send(characters);
          }

          Character.update({}, { $set: { voted: false } }, { multi: true }, function (err) {
            if (err) return next(err);
            res.send([]);
          });
        });
    });
});

/**
 * PUT /api/characters
 * Update winning and losing count for both characters.
 */
app.put('/api/characters', function (req, res, next) {
  var winner = req.body.winner;
  var loser = req.body.loser;

  if (!winner || !loser) {
    return res.status(400).send({ message: 'Voting requires two characters.' });
  }

  if (winner === loser) {
    return res.status(400).send({ message: 'Cannot vote for and against the same character.' });
  }

  async.parallel([
    function (callback) {
      Character.findOne({ characterId: winner }, function (err, winner) {
        callback(err, winner);
      });
    },
    function (callback) {
      Character.findOne({ characterId: loser }, function (err, loser) {
        callback(err, loser);
      });
    }
  ],
    function (err, results) {
      if (err) return next(err);

      var winner = results[0];
      var loser = results[1];

      if (!winner || !loser) {
        return res.status(404).send({ message: 'One of the characters no longer exists.' });
      }

      if (winner.voted || loser.voted) {
        return res.status(200).end();
      }

      async.parallel([
        function (callback) {
          winner.wins++;
          winner.voted = true;
          winner.random = [Math.random(), 0];
          winner.save(function (err) {
            callback(err);
          });
        },
        function (callback) {
          loser.losses++;
          loser.voted = true;
          loser.random = [Math.random(), 0];
          loser.save(function (err) {
            callback(err);
          });
        }
      ], function (err) {
        if (err) return next(err);
        res.status(200).end();
      });
    });
});

/**
 * GET /api/characters/count
 * Returns the total number of characters.
 */
app.get('/api/characters/count', function (req, res, next) {
  Character.count({}, function (err, count) {
    if (err) return next(err);
    res.send({ count: count });
  });
});

/**
 * GET /api/characters/search
 * Looks up a character by name. (case-insensitive)
 */
app.get('/api/characters/search', function (req, res, next) {
  var characterName = new RegExp(req.query.name, 'i');

  Character.findOne({ name: characterName }, function (err, character) {
    if (err) return next(err);

    if (!character) {
      return res.status(404).send({ message: 'Character not found.' });
    }

    res.send(character);
  });
});

/**
 * GET /api/characters/top
 * Return 100 highest ranked characters. Filter by gender, race and bloodline.
 */
app.get('/api/characters/top', function (req, res, next) {
  var params = req.query;
  var conditions = {};

  _.each(params, function (value, key) {
    conditions[key] = new RegExp('^' + value + '$', 'i');
  });

  Character
    .find(conditions)
    .sort('-wins') // Sort in descending order (highest wins on top)
    .limit(100)
    .exec(function (err, characters) {
      if (err) return next(err);

      // Sort by winning percentage
      characters.sort(function (a, b) {
        if (a.wins / (a.wins + a.losses) < b.wins / (b.wins + b.losses)) { return 1; }
        if (a.wins / (a.wins + a.losses) > b.wins / (b.wins + b.losses)) { return -1; }
        return 0;
      });

      res.send(characters);
    });
});

/**
 * GET /api/characters/shame
 * Returns 100 lowest ranked characters.
 */
app.get('/api/characters/shame', function (req, res, next) {
  Character
    .find()
    .sort('-losses')
    .limit(100)
    .exec(function (err, characters) {
      if (err) return next(err);
      res.send(characters);
    });
});

/**
 * GET /api/characters/:id
 * Returns detailed character information.
 */
app.get('/api/characters/:id', function (req, res, next) {
  var id = req.params.id;

  Character.findOne({ characterId: id }, function (err, character) {
    if (err) return next(err);

    if (!character) {
      return res.status(404).send({ message: 'Character not found.' });
    }

    res.send(character);
  });
});

/**
 * POST /api/report
 * Reports a character. Character is removed after 4 reports.
 */
app.post('/api/report', function (req, res, next) {
  var characterId = req.body.characterId;

  Character.findOne({ characterId: characterId }, function (err, character) {
    if (err) return next(err);

    if (!character) {
      return res.status(404).send({ message: 'Character not found.' });
    }

    character.reports++;

    if (character.reports > 4) {
      character.remove();
      return res.send({ message: character.name + ' has been deleted.' });
    }

    character.save(function (err) {
      if (err) return next(err);
      res.send({ message: character.name + ' has been reported.' });
    });
  });
});

/**
 * GET /api/stats
 * Returns characters statistics.
 */
app.get('/api/stats', function (req, res, next) {
  async.parallel([
    function (callback) {
      Character.count({}, function (err, count) {
        callback(err, count);
      });
    },
    function (callback) {
      Character.count({ race: 'Amarr' }, function (err, amarrCount) {
        callback(err, amarrCount);
      });
    },
    function (callback) {
      Character.count({ race: 'Caldari' }, function (err, caldariCount) {
        callback(err, caldariCount);
      });
    },
    function (callback) {
      Character.count({ race: 'Gallente' }, function (err, gallenteCount) {
        callback(err, gallenteCount);
      });
    },
    function (callback) {
      Character.count({ race: 'Minmatar' }, function (err, minmatarCount) {
        callback(err, minmatarCount);
      });
    },
    function (callback) {
      Character.count({ gender: 'Male' }, function (err, maleCount) {
        callback(err, maleCount);
      });
    },
    function (callback) {
      Character.count({ gender: 'Female' }, function (err, femaleCount) {
        callback(err, femaleCount);
      });
    },
    function (callback) {
      Character.aggregate({ $group: { _id: null, total: { $sum: '$wins' } } }, function (err, totalVotes) {
        var total = totalVotes.length ? totalVotes[0].total : 0;
        callback(err, total);
      }
      );
    },
    function (callback) {
      Character
        .find()
        .sort('-wins')
        .limit(100)
        .select('race')
        .exec(function (err, characters) {
          if (err) return next(err);

          var raceCount = _.countBy(characters, function (character) { return character.race; });
          var max = _.max(raceCount, function (race) { return race });
          var inverted = _.invert(raceCount);
          var topRace = inverted[max];
          var topCount = raceCount[topRace];

          callback(err, { race: topRace, count: topCount });
        });
    },
    function (callback) {
      Character
        .find()
        .sort('-wins')
        .limit(100)
        .select('bloodline')
        .exec(function (err, characters) {
          if (err) return next(err);

          var bloodlineCount = _.countBy(characters, function (character) { return character.bloodline; });
          var max = _.max(bloodlineCount, function (bloodline) { return bloodline });
          var inverted = _.invert(bloodlineCount);
          var topBloodline = inverted[max];
          var topCount = bloodlineCount[topBloodline];

          callback(err, { bloodline: topBloodline, count: topCount });
        });
    }
  ],
    function (err, results) {
      if (err) return next(err);

      res.send({
        totalCount: results[0],
        amarrCount: results[1],
        caldariCount: results[2],
        gallenteCount: results[3],
        minmatarCount: results[4],
        maleCount: results[5],
        femaleCount: results[6],
        totalVotes: results[7],
        leadingRace: results[8],
        leadingBloodline: results[9]
      });
    });
});

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
