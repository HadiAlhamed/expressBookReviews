const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.get('/books/async', async(req,res)=>{
    try{
        const response = await axios.get('http://localhost:5000/');
        const booksData = response.data.books;
        return res.status(200).json({books: booksData, message: "success"});
    }catch(err)
    {
        return res.status(500).json({message: "An error occurred while fetching books asynchronously"});
    }
});

public_users.post("/register", (req,res) => {
    const {username , password} = req.body;
    if(!username || !password)
    {
        return res.status(400).json({message : "please provide both username and password"});
    }
    const userExists = !isValid(username);
    if(userExists)
    {
        return res.status(409).json({message : "username already in use , please use different username"});
    }
    users.push({
        username,
        password
    });
    return res.status(201).json({message : "user created successfully"});
    
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    const returnedObject = {};

    try{
        returnedObject.books = books;
        returnedObject.message = "success";
        return res.status(200).send(JSON.stringify(returnedObject , null , 4));

    }catch(err)
    {   
        returnedObject.error = "An error has occurred while getting all available books"
        return res.status(500).send(JSON.stringify(returnedObject , null , 4));
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = parseInt(req.params.isbn);
    if(books.hasOwnProperty(isbn) === false)
    {
        return res.status(404).send(`book with isbn ${isbn} does not exist`);
    }    
    const book = books[isbn];
    res.status(200).send(JSON.stringify(book , null , 4));
    
});
  
//get  book details based on ISBN (async)

public_users.get('/async/isbn/:isbn', async(req,res)=>{
    const isbn = parseInt(req.params.isbn);
    try{    
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        const bookData = response.data;
        return res.status(200).json({book: bookData, message: "success"});
    }catch(err)
    {
        return res.status(500).json({message: "An error occurred while fetching book details asynchronously"});
    }
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    try{
        const returnedObject = {};
        const booksOfAuthor = [];
        for(isbn of Object.keys(books))
        {
            if((books[isbn].author).toLowerCase() === author.toLowerCase())
            {
                booksOfAuthor.push(books[isbn]);
            }
        }
        returnedObject.booksOfAuthor = booksOfAuthor;
        returnedObject.message = "success";
        return res.status(200).send(JSON.stringify(returnedObject , null , 4));
    }catch(err)
    { 
        returnedObject.error = "an error has occurred while getting authors books";
        return res.status(500).send(JSON.stringify(returnedObject , null , 4));
    }
});

// Get book details based on author (async)
public_users.get('/async/author/:author', async(req,res)=>{
    const author = req.params.author;
    try{
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        const booksData = response.data.booksOfAuthor;
        return res.status(200).json({books: booksData, message: "success"});
    }catch(err) {
        return res.status(500).json({message: "An error occurred while fetching author's books asynchronously"});
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const returnedObject = {};
    try{
        const booksOfTitle = [];
        for(isbn of Object.keys(books))
        {
            if((books[isbn].title).toLowerCase() === title.toLowerCase())
            {
                booksOfTitle.push(books[isbn]);
            }
        }
        returnedObject.booksOfTitle = booksOfTitle;
        returnedObject.message = "success";
        return res.status(200).send(JSON.stringify(returnedObject , null , 4));
   
    }catch(err)
    {
        returnedObject.error = "an error has occurred while getting books of a title";
        res.status(500).send(JSON.stringify(returnedObject , null , 4));
    }
});
// Get all books based on title(async)
public_users.get('/async/title/:title', async(req,res)=>{
    const title = req.params.title;
    try{
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        const booksData = response.data.booksOfTitle;
        return res.status(200).json({books: booksData, message: "success"});
    }catch(err) {
        return res.status(500).json({message: "An error occurred while fetching books of a title asynchronously"});
    }   
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const returnedObject = {};
    if(!books[isbn])
    {
        returnedObject.message = "books with given isbn does not exists";
        return res.status(500).send(JSON.stringify(returnedObject , null , 4));
    
    }
    try{
        
        returnedObject.reviews = books[isbn].reviews;
        returnedObject.message = "success";
        return res.status(200).send(JSON.stringify(returnedObject , null , 4));
   
    }catch(err)
    {
        returnedObject.error = "an error has occurred while getting books reviews";
        res.status(500).send(JSON.stringify(returnedObject , null , 4));
    }
});

module.exports.general = public_users;
