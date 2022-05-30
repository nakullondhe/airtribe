const mongoose = require('mongoose')

const statusSchema = new mongoose.Schema({
    status: {type: String, enum: ['running', 'paused', 'stopped'], default: 'stopped'},
    recentLink: {type: String, default: ''},
    stop: {type: Boolean, default: false},
})

module.exports = mongoose.model('Status', statusSchema);