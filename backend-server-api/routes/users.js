const express = require('express');
const users = require('../data/user-data');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// GET /api/users?page=1&limit=10&search=rahul&sortBy=name&sortOrder=asc
router.get('/', verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const search = (req.query.search || '').toLowerCase();
  const sortBy = (req.query.sortBy || 'name').toLowerCase();
  const sortOrder = (req.query.sortOrder || 'asc').toLowerCase();

  // Filter based on search
  const filtered = users.filter(user =>
    user.name.toLowerCase().includes(search) ||
    user.email.toLowerCase().includes(search)
  );

  // Sort filtered users
  const sorted = filtered.sort((a, b) => {
    let valA = a[sortBy] ? a[sortBy].toLowerCase() : '';
    let valB = b[sortBy] ? b[sortBy].toLowerCase() : '';
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate (lazy loading)
  const start = (page - 1) * limit;
  const paginated = sorted.slice(start, start + limit);

  res.json({
    total: filtered.length,
    page,
    limit,
    data: paginated,
  });
});

// Infinite scroll endpoint
router.get('/scroll', verifyToken, (req, res) => {
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const paginated = users.slice(skip, skip + limit);

  res.json({
    products: paginated,
    total: users.length,
    skip,
    limit,
  });
});

module.exports = router;
