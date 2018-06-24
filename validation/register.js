const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data){
    let errors = {};

    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';

    // Checking validation for first & last name, email & password

    // Check for first name
    if(!Validator.isLength(data.name, { min: 2, max: 30})){
        errors.name = 'Name must between 2 and 30 characters';
    }

    if(Validator.isEmpty(data.name)){
        errors.name = 'Name field is required';
    }

    // Check for email
    if(!Validator.isEmail(data.email)){
        errors.email = 'Email is not valid';
    }

    if(Validator.isEmpty(data.email)){
        errors.email = 'Email field is required';
    }

    // Check for password
    if(!Validator.isLength(data.password, { min: 6, max: 30})){
        errors.password = 'Password must be at least 6 and max of 30';
    }

    if(Validator.isEmpty(data.password)){
        errors.password = 'Password field cannot be empty';
    }

    // Check for matching password
    if(!Validator.equals(data.password, data.password2)){
        errors.password2 = 'Password does not match';
    }

    if(Validator.isEmpty(data.password2)){
        errors.password2 = 'Confirm password field is required';
    }

    return{
        errors,
        isValid: isEmpty(errors)
    }
}