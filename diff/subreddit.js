'use strict';

const mongoose = require('mongoose');
mongoose.connect('mongodb://192.168.1.247/reddit_popular');
const Post = require('../models/post.js');
const toCsv = require('../toCsv');

getPostsFrom('all').then((all) => {
    return getPostsFrom('popular').then((popular) => {
        let allCounts = sortCounts(countSubreddits(all));
        let popularCounts = sortCounts(countSubreddits(popular));
        let uniqueToAll = [];
        let uniqueToPopular = [];
        console.log('All counts:');
        console.dir(allCounts);
        console.log('Popular counts:');
        console.dir(popularCounts);
        for (let i=0; i<allCounts.length; i++) {
            let subreddit = allCounts[i].subreddit;
            let found = false;
            for (let j=0; j<popularCounts.length; j++) {
                if (popularCounts[j].subreddit === subreddit) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                uniqueToAll.push(allCounts[i]);
            }
        }
        for (let i=0; i<popularCounts.length; i++) {
            let subreddit = popularCounts[i].subreddit;
            let found = false;
            for (let j=0; j<allCounts.length; j++) {
                if (allCounts[j].subreddit === subreddit) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                uniqueToPopular.push(popularCounts[i]);
            }
        }
        toCsv(uniqueToAll, 'subreddit_unique_to_all');
        toCsv(uniqueToPopular, 'subreddit_unique_to_popular');
    });
}).catch((err) => {
    console.error(err.stack);
});

function getPostsFrom (multi) {
    return new Promise((fulfill, reject) => {
        Post.find({multi:multi, over_18:false}).exec((err, posts) => {
            if (err) {
                reject(err);
                return;
            }
            fulfill(posts);
        });
    });
}

function countSubreddits (posts) {
    let counts = {};
    for (let i=0; i<posts.length; i++) {
        let subreddit = posts[i].subreddit;
        if (!counts.hasOwnProperty(subreddit)) {
            counts[subreddit] = 1;
            continue;
        }
        counts[subreddit]++;
    }
    return counts;
}

function sortCounts (count) {
    let counts = [];
    for (let subreddit in count) {
        if (count.hasOwnProperty(subreddit)) {
            counts.push({
                subreddit : subreddit,
                count : count[subreddit]
            });
        }
    }
    counts.sort((a,b) => {
        return ((a.count < b.count) ? 1 : ((a.count == b.count) ? 0 : -1));
    });
    return counts;
}