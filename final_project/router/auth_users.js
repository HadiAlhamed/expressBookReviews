const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {
        username:"testuser",
        password:"testpass"
    }
];

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
            username : username
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
    const isbn = req.params.isbn;
    const review = req.query.review;
    
    if (!review || review.trim().length === 0) {
        return res.status(400).send(JSON.stringify(
            {
                error: "Review text cannot be empty"
            },
            null,
            4
        ));
    }
    
    const cleanReview = review.trim();
    const { username } = req.user;
    
    if (!books.hasOwnProperty(isbn)) {
        return res.status(400).send(JSON.stringify(
            {
                error: `Book with ISBN ${isbn} does not exist`
            },
            null,
            4
        ));
    }
    
    const book = books[isbn];
    
    if (!book.reviews) {
        book.reviews = {};
    }
    
    const alreadyReviewed = book.reviews.hasOwnProperty(username);
    book.reviews[username] = cleanReview;
    return res.status(200).send(JSON.stringify(
        {
            message: alreadyReviewed 
                ? "Review modified successfully" 
                : "Review added successfully",
            review: cleanReview,
            isbn: isbn,
            
        },
        null,
        4
    ));
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
        const isbn = req.params.isbn;
        const { username } = req.user;
        
        if (!books.hasOwnProperty(isbn)) {
            return res.status(404).send(JSON.stringify(
                {
                    error: `Book with ISBN ${isbn} does not exist`
                },
                null,
                4
            ));
        }
        const book = books[isbn];
        
        if (!book.reviews || !book.reviews.hasOwnProperty(username)) {
            return res.status(404).send(JSON.stringify(
                {
                    error: "Review not found for the user"
                },
                null,
                4
            ));
        }
        delete book.reviews[username];
        if (Object.keys(book.reviews).length === 0) {
            delete book.reviews;
        }
        
        return res.status(200).send(JSON.stringify(
            {
                message: "Review deleted successfully",
                isbn: isbn,
            },
            null,
            4
        ));
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
