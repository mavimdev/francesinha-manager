var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
  eventId: { type: Number, unique: true},
  desc: String,
  organizerName: String,
  pinCode: Number,
  local: String,
  date: Date,
  month: Number,
  year: Number,
  attenders: [{
    name: String,
    pinCode: Number
  }]
});

module.exports = mongoose.model('Event', eventSchema);