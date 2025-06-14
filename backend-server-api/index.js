const express = require('express');
const cors = require('cors');
const users = require('./user-data');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// GET /api/users?page=1&limit=10&search=rahul
app.get('/api/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const search = (req.query.search || '').toLowerCase();

  // Filter based on search
  const filtered = users.filter(user =>
    user.name.toLowerCase().includes(search) ||
    user.email.toLowerCase().includes(search)
  );

  // Paginate
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  res.json({
    total: filtered.length,
    page,
    limit,
    data: paginated,
  });
});

app.get('/scroll/users', (req, res) => {
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const paginated = users.slice(skip, skip + limit);

  res.json({
    products: paginated,
    total: users.length,
    skip,
    limit,
  });
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
