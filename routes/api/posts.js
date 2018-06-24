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