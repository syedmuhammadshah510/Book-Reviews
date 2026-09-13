const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('       BOOK REVIEW API - FULL PHASE TEST SUITE      ');
  console.log('====================================================\n');

  // ==========================================
  // PHASE 1: PUBLIC GENERAL ROUTES (TASKS 1-5)
  // ==========================================
  console.log('--- PHASE 1: Public General Routes (Tasks 1 - 5) ---');
  try {
    // 1. GET /
    const allBooksRes = await axios.get(`${BASE_URL}/`);
    assert(allBooksRes.status === 200, 'GET / returns 200 OK');
    assert(Object.keys(allBooksRes.data).length === 10, 'GET / returns 10 books');

    // 2. GET /isbn/:isbn
    const isbnRes = await axios.get(`${BASE_URL}/isbn/1`);
    assert(isbnRes.status === 200, 'GET /isbn/1 returns 200 OK');
    assert(isbnRes.data.title === 'Things Fall Apart', 'GET /isbn/1 contains correct title');

    try {
      await axios.get(`${BASE_URL}/isbn/9999`);
      assert(false, 'GET /isbn/9999 should return 404');
    } catch (err) {
      assert(err.response && err.response.status === 404, 'GET /isbn/9999 returns 404 Not Found');
    }

    // 3. GET /author/:author
    const authorRes = await axios.get(`${BASE_URL}/author/Jane%20Austen`);
    assert(authorRes.status === 200, 'GET /author/Jane Austen returns 200 OK');
    assert(Array.isArray(authorRes.data) && authorRes.data.length > 0, 'GET /author returns array of books');
    assert(authorRes.data[0].title === 'Pride and Prejudice', 'Matching book is Pride and Prejudice');

    try {
      await axios.get(`${BASE_URL}/author/NonExistentAuthor`);
      assert(false, 'GET /author/NonExistentAuthor should return 404');
    } catch (err) {
      assert(err.response && err.response.status === 404, 'GET /author/NonExistentAuthor returns 404 Not Found');
    }

    // 4. GET /title/:title
    const titleRes = await axios.get(`${BASE_URL}/title/Pride%20and%20Prejudice`);
    assert(titleRes.status === 200, 'GET /title/Pride and Prejudice returns 200 OK');
    assert(Array.isArray(titleRes.data) && titleRes.data.length > 0, 'GET /title returns array of books');

    try {
      await axios.get(`${BASE_URL}/title/NonExistentTitle`);
      assert(false, 'GET /title/NonExistentTitle should return 404');
    } catch (err) {
      assert(err.response && err.response.status === 404, 'GET /title/NonExistentTitle returns 404 Not Found');
    }

    // 5. GET /review/:isbn
    const reviewRes = await axios.get(`${BASE_URL}/review/1`);
    assert(reviewRes.status === 200, 'GET /review/1 returns 200 OK');
  } catch (e) {
    console.error('Phase 1 unexpected error:', e.message);
    failed++;
  }

  // ==========================================
  // PHASE 2: REGISTRATION & LOGIN (TASKS 6-7)
  // ==========================================
  console.log('\n--- PHASE 2: Registration & Login (Tasks 6 - 7) ---');
  const testUser = { username: `user_${Date.now()}`, password: 'password123' };
  let authToken = '';
  let sessionCookie = '';

  try {
    // 6. POST /register validation
    try {
      await axios.post(`${BASE_URL}/register`, {});
      assert(false, 'POST /register without credentials should return 400');
    } catch (err) {
      assert(err.response && err.response.status === 400, 'POST /register without credentials returns 400 Bad Request');
    }

    // Valid register
    const regRes = await axios.post(`${BASE_URL}/register`, testUser);
    assert(regRes.status === 200, 'POST /register with valid user returns 200 OK');

    // Duplicate register
    try {
      await axios.post(`${BASE_URL}/register`, testUser);
      assert(false, 'POST /register duplicate user should return 400');
    } catch (err) {
      assert(err.response && err.response.status === 400, 'POST /register duplicate user returns 400 Bad Request');
    }

    // 7. POST /customer/login validation
    try {
      await axios.post(`${BASE_URL}/customer/login`, { username: testUser.username, password: 'wrongpassword' });
      assert(false, 'POST /customer/login with bad password should return 401');
    } catch (err) {
      assert(err.response && err.response.status === 401, 'POST /customer/login with bad password returns 401 Unauthorized');
    }

    // Valid login
    const loginRes = await axios.post(`${BASE_URL}/customer/login`, testUser);
    assert(loginRes.status === 200, 'POST /customer/login with valid credentials returns 200 OK');
    assert(Boolean(loginRes.data.token), 'Login response contains JWT access token');
    authToken = loginRes.data.token;

    const cookieHeader = loginRes.headers['set-cookie'];
    assert(Boolean(cookieHeader), 'Login response sets connect.sid session cookie');
    sessionCookie = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader;
  } catch (e) {
    console.error('Phase 2 unexpected error:', e.message);
    failed++;
  }

  // ===================================================
  // PHASE 3: AUTHENTICATED REVIEW ROUTES (TASKS 8-9)
  // ===================================================
  console.log('\n--- PHASE 3: Authenticated Review Routes (Tasks 8 - 9) ---');
  try {
    // Unauthenticated PUT
    try {
      await axios.put(`${BASE_URL}/customer/auth/review/1?review=test`);
      assert(false, 'Unauthenticated PUT /customer/auth/review/1 should return 403');
    } catch (err) {
      assert(err.response && err.response.status === 403, 'Unauthenticated PUT /customer/auth/review/1 returns 403 Forbidden');
    }

    // 8. Add Review with Session Cookie
    const addReviewRes = await axios.put(
      `${BASE_URL}/customer/auth/review/1?review=Awesome%20Book!`,
      {},
      { headers: { Cookie: sessionCookie } }
    );
    assert(addReviewRes.status === 200, 'PUT /customer/auth/review/1 adds new review (200 OK)');
    assert(addReviewRes.data.reviews[testUser.username] === 'Awesome Book!', 'Review text matches input');

    // Modify Review with Bearer Token (supporting both cookie & header)
    const updateReviewRes = await axios.put(
      `${BASE_URL}/customer/auth/review/1?review=Updated%20review%20content!`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    assert(updateReviewRes.status === 200, 'PUT /customer/auth/review/1 modifies existing review (200 OK)');
    assert(updateReviewRes.data.reviews[testUser.username] === 'Updated review content!', 'Review is updated in-place');

    // Verify public route reflects updated review
    const publicReviewCheck = await axios.get(`${BASE_URL}/review/1`);
    assert(publicReviewCheck.data[testUser.username] === 'Updated review content!', 'Public GET /review/1 shows the updated review');

    // 9. Delete Review
    const deleteRes = await axios.delete(
      `${BASE_URL}/customer/auth/review/1`,
      { headers: { Cookie: sessionCookie } }
    );
    assert(deleteRes.status === 200, 'DELETE /customer/auth/review/1 removes user review (200 OK)');
    assert(!deleteRes.data.reviews[testUser.username], 'Review no longer exists in book reviews object');

    // Duplicate Delete returns 404
    try {
      await axios.delete(
        `${BASE_URL}/customer/auth/review/1`,
        { headers: { Cookie: sessionCookie } }
      );
      assert(false, 'Second DELETE should return 404');
    } catch (err) {
      assert(err.response && err.response.status === 404, 'DELETE on already deleted review returns 404 Not Found');
    }
  } catch (e) {
    console.error('Phase 3 unexpected error:', e.message);
    failed++;
  }

  // ==========================================
  // PHASE 4: ASYNC CONCURRENCY CLIENT SCRIPT
  // ==========================================
  console.log('\n--- PHASE 4: Asynchronous Axios Concurrency Client (Tasks 10 - 13) ---');
  try {
    const client = require('./general.js');
    assert(typeof client.getAllBooks === 'function', 'getAllBooks function exists in general.js');
    assert(typeof client.getBookByISBN === 'function', 'getBookByISBN function exists in general.js');
    assert(typeof client.getBookByAuthor === 'function', 'getBookByAuthor function exists in general.js');
    assert(typeof client.getBookByTitle === 'function', 'getBookByTitle function exists in general.js');

    const bAll = await client.getAllBooks();
    assert(Boolean(bAll && Object.keys(bAll).length === 10), 'client.getAllBooks() executes successfully');

    const bIsbn = await client.getBookByISBN(1);
    assert(Boolean(bIsbn && bIsbn.title), 'client.getBookByISBN(1) executes successfully with Promise chaining');

    const bAuthor = await client.getBookByAuthor('Jane Austen');
    assert(Boolean(bAuthor && bAuthor.length > 0), 'client.getBookByAuthor() executes successfully with async/await');

    const bTitle = await client.getBookByTitle('Pride and Prejudice');
    assert(Boolean(bTitle && bTitle.length > 0), 'client.getBookByTitle() executes successfully with async/await');
  } catch (e) {
    console.error('Phase 4 unexpected error:', e.message);
    failed++;
  }

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} Passed | ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
