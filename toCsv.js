'use strict';

const fs = require('fs');
const csv = require('to-csv');

module.exports = function toCsv (obj, name) {
    fs.writeFileSync(`../results/${name}.csv`, csv(obj));
};