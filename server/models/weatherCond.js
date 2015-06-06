/**
 * Created by ggez on 12/05/2015.
 */
var mongoose = require('mongoose');

var WeatherSchema = new mongoose.Schema({
        temperature: Number,
        waterTemperature: Number,
        windspeedKmph : Number,
        swellHeight_m : Number,
        description: String,
        winddirection: String,
        cloudcover: Number,
        humidity: Number,
        precipitation: Number,
        time : { type: Date, default: Date.now }
    },
    {collection: "weatherCond"}
);

module.exports = mongoose.model('weatherCond', WeatherSchema);