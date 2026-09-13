/**
 * Book Review API - Asynchronous Client Script (Tasks 10 - 13)
 * Demonstrating Asynchronous Programming Patterns with Axios:
 * 1. async/await pattern
 * 2. Promise chaining (.then / .catch)
 *
 * Concurrency & Non-blocking I/O:
 * Node.js operates on an event-driven, single-threaded event loop.
 * By using asynchronous operations (Promises and async/await), network I/O
 * requests made via Axios are delegated to the libuv thread pool / kernel,
 * freeing the main thread to process other events and handle concurrent requests
 * without blocking execution.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

/**
 * Task 10: Get all books using async/await
 * Pattern: async/await
 * Why it enables concurrency:
 * Awaiting the Promise yields execution back to the Node.js event loop
 * while the HTTP request is pending, allowing other operations or client requests
 * to be processed in parallel rather than blocking the main execution thread.
 */
async function getAllBooks() {
  console.log('\n--- Task 10: getAllBooks() [Pattern: async/await] ---');
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log('Status:', response.status);
    console.log('Books Data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error fetching all books:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

/**
 * Task 11: Get book details by ISBN using plain Promises (.then / .catch)
 * Pattern: Promise Chaining (.then() / .catch())
 * Why it enables concurrency:
 * The Axios request returns a pending Promise immediately. Callbacks registered
 * via .then() and .catch() are scheduled in the microtask queue once the response
 * arrives, keeping the JavaScript call stack free and completely non-blocking.
 */
function getBookByISBN(isbn) {
  console.log(`\n--- Task 11: getBookByISBN(${isbn}) [Pattern: Promise .then()/.catch()] ---`);
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => {
      console.log(`Status:`, response.status);
      console.log(`Book details for ISBN ${isbn}:`, JSON.stringify(response.data, null, 2));
      return response.data;
    })
    .catch((error) => {
      console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
    });
}

/**
 * Task 12: Get book details by Author using async/await
 * Pattern: async/await
 * Why it enables concurrency:
 * Asynchronous execution allows Node.js to initiate the network request and resume
 * execution precisely when the HTTP response data is available, enabling high-throughput
 * concurrent handling of multiple user requests.
 */
async function getBookByAuthor(author) {
  console.log(`\n--- Task 12: getBookByAuthor("${author}") [Pattern: async/await] ---`);
  try {
    const encodedAuthor = encodeURIComponent(author);
    const response = await axios.get(`${BASE_URL}/author/${encodedAuthor}`);
    console.log(`Status:`, response.status);
    console.log(`Books by author "${author}":`, JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by author "${author}":`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

/**
 * Task 13: Get book details by Title using async/await with Promise
 * Pattern: async/await wrapped around Axios
 * Why it enables concurrency:
 * Promise-based async/await prevents thread starvation and allows multiple
 * asynchronous operations to run concurrently without blocking one another.
 */
async function getBookByTitle(title) {
  console.log(`\n--- Task 13: getBookByTitle("${title}") [Pattern: async/await] ---`);
  try {
    const encodedTitle = encodeURIComponent(title);
    const response = await axios.get(`${BASE_URL}/title/${encodedTitle}`);
    console.log(`Status:`, response.status);
    console.log(`Books with title "${title}":`, JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error(`Error fetching books with title "${title}":`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Self-invoking runner when executed directly via `node general.js`
async function runAll() {
  console.log('==============================================');
  console.log('Starting Asynchronous API Client Executions');
  console.log('==============================================');

  // 1. Task 10: Get all books
  await getAllBooks();

  // 2. Task 11: Get book by ISBN (using Promise chaining)
  await getBookByISBN(1);

  // 3. Task 12: Get book by Author
  await getBookByAuthor('Jane Austen');

  // 4. Task 13: Get book by Title
  await getBookByTitle('Pride and Prejudice');

  console.log('\n==============================================');
  console.log('All Asynchronous Client Tasks Completed');
  console.log('==============================================');
}

if (require.main === module) {
  runAll();
}

module.exports = {
  getAllBooks,
  getBookByISBN,
  getBookByAuthor,
  getBookByTitle
};
