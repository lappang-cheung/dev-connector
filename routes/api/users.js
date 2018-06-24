const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Load validation
const validateRegisterInput = require('../../validation/register');

// Load keys
const keys = require('../../config/keys');
// Load user model
const User = require('../../models/User');

// @route   GET api/user/test
// @desc    Test user route
// @access  public
router.get('/test', (req,res, next) => {
    res.status(200).json({
        message: 'User Route is working'
    })
});

// @route   POST api/user/register
// @desc    Register route
// @access  public
router.post('/register', async (req,res, next) => {

    const {errors, isValid } = validateRegisterInput(req.body);
    //  Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    try{
        const user = await User.findOne({email: req.body.email});

        if(user){
            return res.status(400).json({ email: 'Email already exists'});
        }else{
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
                    newUser.password = hash;
                    newUser.save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                })
            })
        }

    }catch(e){
        next(e)
    }
});

// @route   POST api/user/login
// @desc    Login route / Return JWT Token
// @access  public
router.post('/login', (req,res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    const temp = User;
    
    User.findOne({ email }).then(user =>{
        if(!user){
            return res.status(404).json({ email: "User not found"});
        }

        bcrypt.compare(password, user.password).then(isMatch => {
            if(isMatch){
                // res.json({msg: 'success'})
                // User matched JWT

                // JWT Payload
                const payload = {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }

                jwt.sign(payload, keys.secretOrKey, { expiresIn: 60 * 60 }, (err, token) => {
                    res.json({ 
                        success: true,
                        token: 'Bearer ' + token 
                    })
                });
            }else{
                return res.status(400).json({ password: 'Password incorrect'})
            }
        })
    })     

});

// @route   POST api/user/current
// @desc    Return current user
// @access  private

router.get('/current', passport.authenticate('jwt', {session: false }), (req,res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
})


module.exports = router;