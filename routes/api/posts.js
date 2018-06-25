const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Loading post model
const Post = require('../../models/Post');

// Loading post validation
const validatePostInput = require('../../validation/post');

/*
 * @route   GET api/posts/test
 * @desc    Tests posts route
 * @access  Public
 */
router.get('/test', (req,res) => {
    res.status(200).json({
        message: 'Connected to posts'
    })
});

/*
 * @route   Get api/posts
 * @desc    Get posts
 * @access  Public
 */
router.get('/', (req,res) => {
    Post.find()
        .sort({date: -1})
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({
            nopostsfound: 'No post found with that id'
        }));
});

/*
 * @route   Get api/posts/:id
 * @desc    Get post by id
 * @access  Public
 */
router.get('/:id', (req,res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({
            nopostfound: 'No post found with that id'
        }));
});

/*
 * @route   Post api/posts
 * @desc    Crate posts route
 * @access  Private
 */
router.post('/', passport.authenticate('jwt', { session: false }), (req,res) => {

    const {errors, isValid } = validatePostInput(req.body);

    // Check validation
    if(!isValid){
        // If any errors, send 400 with errors object
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));
});

module.exports = router;