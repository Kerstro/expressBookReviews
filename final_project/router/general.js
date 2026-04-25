const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Task 7: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  const userExists = users.some(u => u.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists! Please login." });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login." });
});

// Task 2: Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});

// Task 3: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  }
  return res.status(404).json({ message: "Book not found" });
});

// Task 4: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const matchingBooks = {};
  for (let key in books) {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      matchingBooks[key] = books[key];
    }
  }
  if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).json(matchingBooks);
  }
  return res.status(404).json({ message: "No books found for this author" });
});

// Task 5: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const matchingBooks = {};
  for (let key in books) {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      matchingBooks[key] = books[key];
    }
  }
  if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).json(matchingBooks);
  }
  return res.status(404).json({ message: "No books found with this title" });
});

// Task 6: Get book review by ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

// Task 11 - Get all books using Promise callbacks
public_users.get('/books/async', function (req, res) {
  const getBooks = new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject(new Error("Unable to retrieve books"));
    }
  });
  getBooks
    .then((data) => res.status(200).json(data))
    .catch((err) => res.status(500).json({ message: err.message }));
});

// Task 11 - Get book by ISBN using async/await with Axios
public_users.get('/books/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const getBook = new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error("Book not found for ISBN: " + isbn));
      }
    });
    const data = await getBook;
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 11 - Get books by Author using Promise callbacks
public_users.get('/books/author/:author', function (req, res) {
  const author = req.params.author;
  const getBooksbyAuthor = new Promise((resolve, reject) => {
    const matchingBooks = {};
    for (let key in books) {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        matchingBooks[key] = books[key];
      }
    }
    if (Object.keys(matchingBooks).length > 0) {
      resolve(matchingBooks);
    } else {
      reject(new Error("No books found for author: " + author));
    }
  });
  getBooksbyAuthor
    .then((data) => res.status(200).json(data))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// Task 11 - Get books by Title using async/await with Axios
public_users.get('/books/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const getBooksbyTitle = new Promise((resolve, reject) => {
      const matchingBooks = {};
      for (let key in books) {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
          matchingBooks[key] = books[key];
        }
      }
      if (Object.keys(matchingBooks).length > 0) {
        resolve(matchingBooks);
      } else {
        reject(new Error("No books found with title: " + title));
      }
    });
    const data = await getBooksbyTitle;
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

module.exports.general = public_users;
