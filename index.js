require('dotenv').config();
const mongoose = require("mongoose");
const express = require("express");
const { runCrawler, addStatus } = require('./helpers/crawler');
const app = express();

mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to DB");
});

app.listen(3000, () => {
    console.log("Server started at port 3000");
    }
);

// add status
// addStatus();

runCrawler();
