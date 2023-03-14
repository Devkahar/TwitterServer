const jwt = require('jsonwebtoken');
// Validate Email
const validateEmail = (email) => {
    return( String(email)
         .toLowerCase()
         .match(
             /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
         ));
 };
// Validate Email
const validatePassword = (password) =>{
    const regularExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    return String(password).match(regularExpression);
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};


module.exports ={
    validateEmail,validatePassword,generateToken
};