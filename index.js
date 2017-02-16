'use strict';

const mongoose = require('mongoose');
mongoose.connect('mongodb://192.168.1.247/reddit_popular');

const Post = require('./models/post');
const getPosts = require('./getPosts');

nextAll();
setTimeout(nextPopular, 1000);

function storePosts (data) {
    // posts is a listing object from reddit
    // posts are in listing.data.children
    // post props are in listing.data.children[i].data
    return new Promise((fulfill, reject) => {
        let posts = data.posts;
        let promises = [];
        for (let i=0; i<posts.length; i++) {
            ((post) => {
                promises.push(new Promise((fulfill, reject) => {
                    post.multi = data.multi;
                    let query = {id:post.id, multi:post.multi};
                    Post.findOneAndUpdate(query, post, {upsert:true}, function(err, doc){
                        if (err) {
                            reject(err);
                            return;
                        }
                        fulfill(doc);
                    });
                }));
            })(posts[i]);
        }
        Promise.all(promises).then((posts) => {
            fulfill({
                after : data.after,
                posts : posts
            });
        }).catch((err) => {
            reject(err);
        });
    });
}

function nextAll (after) {
    console.log(`Getting /r/all after ${after}`);
    getPosts('all', after).then(storePosts)
        .then((data) => {
            setTimeout(() => {
                nextAll(data.after);
            }, 2000 * Math.random());
        })
        .catch((err) => {console.error(err);});
}

function nextPopular (after) {
    console.log(`Getting /r/popular after ${after}`);
    getPosts('popular', after).then(storePosts)
        .then((data) => {
            setTimeout(() => {
                nextPopular(data.after);
            }, 2000 * Math.random());
        })
        .catch((err) => {console.error(err);});}