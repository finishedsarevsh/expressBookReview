const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Returns true if username is valid and not already registered
    const matchingUsers = users.filter((user) => user.username === username);
    return matchingUsers.length === 0;
};

const authenticatedUser = (username, password) => {
    // Returns true if username and password match records
    const matchingUsers = users.filter((user) => user.username === username && user.password === password);
    return matchingUsers.length > 0;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const accessToken = jwt.sign({ username: username }, "access", { expiresIn: "1h" });
    req.session.authorization = {
        accessToken,
        username
    };

    return res.status(200).json({ message: "User successfully logged in" });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session && req.session.authorization 
        ? req.session.authorization.username 
        : (req.user ? req.user.username : null);

    if (!username) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review query parameter is required" });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    const isExisting = Boolean(books[isbn].reviews[username]);
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: isExisting
            ? `Review for ISBN ${isbn} updated successfully.`
            : `Review for ISBN ${isbn} added successfully.`,
        reviews: books[isbn].reviews
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session && req.session.authorization 
        ? req.session.authorization.username 
        : (req.user ? req.user.username : null);

    if (!username) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: `Review for ISBN ${isbn} posted by user ${username} deleted.` });
    } else {
        return res.status(404).json({ message: `Review for ISBN ${isbn} by user ${username} not found.` });
    }
});

module.exports.authenticated = regd_users;
module.exports.regd_users = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
