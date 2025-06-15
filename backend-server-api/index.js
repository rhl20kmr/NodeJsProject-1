const express = require('express');
const cors = require('cors');
const users = require('./user-data');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


const SECRET_KEY = "your_secret_key";

// Simulated user database
const user = {
  username: "admin",
  password: bcrypt.hashSync("admin123", 8), // hashed password
};

// Login route
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username !== user.username || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

// Protected route
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: "Access granted to protected data" });
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (!bearerHeader || !bearerHeader.startsWith("Bearer ")) {
    return res.sendStatus(403);
  }
  const token = bearerHeader.split(" ")[1];

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
}

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
