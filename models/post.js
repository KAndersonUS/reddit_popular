'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    domain : String,
    subreddit : String,
    id : String,
    author : String,
    multi : String,
    permalink : String,
    score : Number,
    over_18 : Boolean
});

module.exports = mongoose.model('Post', postSchema);