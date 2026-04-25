const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid (not already taken)
const isValid = (username) => {
  return users.some(u => u.username === username);
};

// Check if username and password match records
const authenticatedUser = (username, password) => {
  return users.some(u => u.username === username && u.password === password);
};

// Task 8: Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials. Please check your username and password." });
  }
  const accessToken = jwt.sign({ data: username }, "fingerprint_customer", { expiresIn: 60 * 60 });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: "User successfully logged in", token: accessToken });
});

// Task 9: Add or modify a book review (authenticated)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }
  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: `Review for ISBN ${isbn} successfully added/updated`,
    reviews: books[isbn].reviews
  });
});

// Task 10: Delete a book review (authenticated, only own reviews)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }
  delete books[isbn].reviews[username];
  return res.status(200).json({
    message: `Review for ISBN ${isbn} by user ${username} successfully deleted`,
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
