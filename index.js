require('dotenv').config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();

mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to DB");
});

app.use('/', require('./routes/index'));

app.listen(8081, () => {
    console.log("Server started at port 8081");
    }
);

