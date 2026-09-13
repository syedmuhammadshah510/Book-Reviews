const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  }
  return res.status(404).json({ message: "Book not found" });
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const authorQuery = req.params.author.toLowerCase();
  const matchingBooks = [];
  const isbns = Object.keys(books);

  for (let isbn of isbns) {
    if (books[isbn].author && books[isbn].author.toLowerCase().includes(authorQuery)) {
      matchingBooks.push({ isbn: isbn, ...books[isbn] });
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const titleQuery = req.params.title.toLowerCase();
  const matchingBooks = [];
  const isbns = Object.keys(books);

  for (let isbn of isbns) {
    if (books[isbn].title && books[isbn].title.toLowerCase().includes(titleQuery)) {
      matchingBooks.push({ isbn: isbn, ...books[isbn] });
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    if (books[isbn].reviews && Object.keys(books[isbn].reviews).length > 0) {
      return res.status(200).json(books[isbn].reviews);
    } else {
      return res.status(200).json({ message: "No reviews for this book yet", reviews: books[isbn].reviews });
    }
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
