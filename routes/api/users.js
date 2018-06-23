const express = require('express');
const router = express.Router();

/*
 * @route   GET api/users/test
 * @desc    Tests user route
 * @access  Public
 */
router.get('/test', (req,res) => {
    res.status(200).json({
        message: 'Connected to users'
    })
});

module.exports = router;