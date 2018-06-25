const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Loading post model
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

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

/*
 * @route   DELETE api/posts/:id
 * @desc    Delete posts
 * @access  Private
 */
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req,res) => {
    Profile.findOne({ user: req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
            .then(post => {
                // Check for post owner
                if(post.user.toString() !== req.user.id){
                    return res.status(401).json({ notauthorized: 'User not authorized'});
                }
                post.remove().then(() => res.json({ success: true}))
            })
            .catch(err => res.status(404).json({
                postnotfound: 'No post found'
            }))
        })
});

/*
 * @route   POST api/posts/like/:id
 * @desc    Like posts
 * @access  Private
 */
router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req,res) => {
    Profile.findOne({ user: req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
            .then(post => {
                if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
                    return res.status(400).json({
                        alreadylike: 'User already like this post'
                    })
                }

                // Add user id to the like array
                post.likes.unshift({ user: req.user.id});
                post.save().then(post => res.json(post));
            })
            .catch(err => res.status(404).json({
                postnotfound: 'No post found'
            }))
        })
});

/*
 * @route   POST api/posts/unlike/:id
 * @desc    Unlike posts
 * @access  Private
 */
router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req,res) => {
    Profile.findOne({ user: req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
            .then(post => {
                if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
                    return res.status(400).json({
                        notlike: 'You have no yet like this post'
                    })
                }

                // Get remove index
                const removeIndex = post.likes
                    .map(item => item.user.toString())
                    .indexOf(req.user.id);
                // Splice out of array
                post.likes.splice(removeIndex,1);

                // save
                post.save().then(post => res.json(post));
            })
            .catch(err => res.status(404).json({
                postnotfound: 'No post found'
            }))
        })
});

/*
 * @route   POST api/posts/comment/:id
 * @desc    Add comment to post
 * @access  Private
 */
router.post('/comment/:id', passport.authenticate('jwt', {session: false}), (req,res) => {

    const {errors, isValid } = validatePostInput(req.body);

    // Check validation
    if(!isValid){
        // If any errors, send 400 with errors object
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            }
            // Add comment to array
            post.comments.unshift(newComment);
            post.save().then(post => res.json(post))
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
});

/*
 * @route   DELETE api/posts/comment/:id/:comment_id
 * @desc    Remove comment to post
 * @access  Private
 */
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session: false}), (req,res) => {

    Post.findById(req.params.id)
        .then(post => {
            // Check if the comment exist
            if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
                return res.status(404).json({ commentnotexist: 'Comment does not exist' })
            }
            // Get remove index
            const removeIndex = post.comments
                .map(item => item._id.toString())
                .indexOf(req.params.comment_id);
            
            // Splice out of array
            post.comments.splice(removeIndex, 1);
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
});

module.exports = router;