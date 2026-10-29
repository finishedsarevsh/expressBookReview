const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// ==============================================================================
// Task 1: Register a new user
// ==============================================================================
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// ==============================================================================
// Task 2: Get the book list available in the shop (JSON formatted with 4 spaces)
// Implemented using Promise / Async-Await
// ==============================================================================
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => new Promise((resolve) => resolve(books));
    const allBooks = await getBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book list" });
  }
});

// ==============================================================================
// Task 3: Get book details based on ISBN
// Implemented using Promise / Async-Await
// ==============================================================================
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const getBookByISBN = (isbn) => new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject({ status: 404, message: "Book not found" });
      }
    });

    const book = await getBookByISBN(req.params.isbn);
    return res.status(200).json(book);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Error retrieving book" });
  }
});

// ==============================================================================
// Task 4: Get book details based on author (case-insensitive)
// Implemented using Promise / Async-Await
// ==============================================================================
public_users.get('/author/:author', async function (req, res) {
  try {
    const getBooksByAuthor = (author) => new Promise((resolve, reject) => {
      const authorLower = author.toLowerCase();
      const matchingBooks = [];
      for (const key in books) {
        if (books[key].author && books[key].author.toLowerCase() === authorLower) {
          matchingBooks.push(books[key]);
        }
      }
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject({ status: 404, message: "No books found for this author" });
      }
    });

    const matching = await getBooksByAuthor(req.params.author);
    return res.status(200).json(matching);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Error retrieving books" });
  }
});

// ==============================================================================
// Task 5: Get all books based on title (case-insensitive)
// Implemented using Promise / Async-Await
// ==============================================================================
public_users.get('/title/:title', async function (req, res) {
  try {
    const getBooksByTitle = (title) => new Promise((resolve, reject) => {
      const titleLower = title.toLowerCase();
      const matchingBooks = [];
      for (const key in books) {
        if (books[key].title && books[key].title.toLowerCase() === titleLower) {
          matchingBooks.push(books[key]);
        }
      }
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject({ status: 404, message: "No books found for this title" });
      }
    });

    const matching = await getBooksByTitle(req.params.title);
    return res.status(200).json(matching);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Error retrieving books" });
  }
});

// ==============================================================================
// Task 6: Get book review based on ISBN
// ==============================================================================
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn].reviews);
});

// ==============================================================================
// Tasks 10 - 13: Axios Async/Await & Promise Client Functions
// ==============================================================================

/**
 * Task 10: Get all books using async/await with Axios
 */
const getAllBooksAsync = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all books with Axios:", error.message);
    throw error;
  }
};

/**
 * Task 11: Get book details by ISBN using async/await with Axios
 */
const getBookByISBNAsync = async (isbn) => {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching book with ISBN ${isbn} with Axios:`, error.message);
    throw error;
  }
};

/**
 * Task 12: Get book details by Author using async/await with Axios
 */
const getBooksByAuthorAsync = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by author ${author} with Axios:`, error.message);
    throw error;
  }
};

/**
 * Task 13: Get book details by Title using async/await with Axios
 */
const getBooksByTitleAsync = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by title ${title} with Axios:`, error.message);
    throw error;
  }
};

// ==============================================================================
// Dedicated routes exposing Axios async/await client functions (Tasks 10-13)
// ==============================================================================

// Task 10 route: Get all books via Axios async/await
public_users.get('/async/books', async (req, res) => {
  try {
    const allBooks = await getAllBooksAsync();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve books using Axios async/await", error: error.message });
  }
});

// Task 11 route: Get book details by ISBN via Axios async/await
public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
    const book = await getBookByISBNAsync(req.params.isbn);
    return res.status(200).json(book);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const message = error.response && error.response.data ? error.response.data.message : error.message;
    return res.status(status).json({ message });
  }
});

// Task 12 route: Get book details by Author via Axios async/await
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const authorBooks = await getBooksByAuthorAsync(req.params.author);
    return res.status(200).json(authorBooks);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const message = error.response && error.response.data ? error.response.data.message : error.message;
    return res.status(status).json({ message });
  }
});

// Task 13 route: Get book details by Title via Axios async/await
public_users.get('/async/title/:title', async (req, res) => {
  try {
    const titleBooks = await getBooksByTitleAsync(req.params.title);
    return res.status(200).json(titleBooks);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const message = error.response && error.response.data ? error.response.data.message : error.message;
    return res.status(status).json({ message });
  }
});

module.exports.general = public_users;
module.exports.getAllBooksAsync = getAllBooksAsync;
module.exports.getBookByISBNAsync = getBookByISBNAsync;
module.exports.getBooksByAuthorAsync = getBooksByAuthorAsync;
module.exports.getBooksByTitleAsync = getBooksByTitleAsync;
