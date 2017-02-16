'use strict';

const https = require('https');

module.exports = getPosts;

function getPosts (subreddit, after) {
    return new Promise ((fulfill, reject) => {
        if (!subreddit) {
            reject(new Error("Subreddit is required"));
        }
        // this was changed manually, between top and controversial and all time spans, as reddit stopped returning
        // unique posts after a certain point.
        // Time spans: hour, day, week, month, year, all
        // query for unique number of posts: db.posts.distinct('id').length
        let requestUrl = `https://www.reddit.com/r/${subreddit}/top/.json?sort=top&t=hour`;
        if (after) {
            requestUrl += `&after=${after}`;
        }
        https.get(requestUrl, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Bad status code: ${res.statusCode}`));
                return;
            }
            res.on('error', reject);
            let data = "";
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                let d = JSON.parse(data);
                fulfill({
                    multi : subreddit,
                    after : d.data.after,
                    posts : d.data.children.map((p) => {
                        p = p.data;
                        return p;
                    })
                });
            });
        })
    });
}