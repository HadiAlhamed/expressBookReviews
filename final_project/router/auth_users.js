const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    const userAlreadyExists = users.filter((user)=> user.username === username);
    if(!userAlreadyExists || userAlreadyExists.length === 0)
    {
        return true;
    }
    return false;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    const user = users.filter( user => user.username === username && user.password === password);
    if(!user || user.length === 0)
    {
        return false;
    }
    return true;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username , password} = req.body;
  if(!username || !password)
  {
    return res.status(400).send(
        JSON.stringify(
            {
                message: "Invalid credentials"
            },
            null,
            4
    )
    );
  }
  if(!authenticatedUser(username.trim() , password.trim()))
  {
    return res.status(401).send(
        JSON.stringify(
            {
                message: "Invalid credentials"

            },
            null,
            4
    )
    );
  }
  try{
    const accessToken =  jwt.sign(
        {
            data : username
        },
        "fingerprint_customer",
        {
            expiresIn: 60 * 60,
        }
    );
    req.session.authorization = {
        accessToken: accessToken,
        user: username,
    }
    res.status(200).send(JSON.stringify(
        {
            message: "User logged in successfully",
            accessToken: accessToken,

        },
        null,
        4
    ));
  }catch(err)
  {
    res.status(200).send(JSON.stringify(
        {
            error: "internal server error, please try again later",

        },
        null,
        4
    ));
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
