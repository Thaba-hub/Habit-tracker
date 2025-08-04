const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pg = require('pg');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:password@localhost:5432/habits' });

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (userRes.rows.length && await bcrypt.compare(password, userRes.rows[0].password)) {
    req.session.user = userRes.rows[0];
    res.json({ user: { email: userRes.rows[0].email } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/habits', async (req, res) => {
  const result = await pool.query('SELECT * FROM habits WHERE user_id = $1', [req.session.user.id]);
  res.json(result.rows);
});

app.post('/api/habits', async (req, res) => {
  await pool.query('INSERT INTO habits (user_id, name) VALUES ($1, $2)', [req.session.user.id, req.body.name]);
  res.json({ status: 'ok' });
});

app.post('/api/habits/:id/toggle', async (req, res) => {
  await pool.query('UPDATE habits SET completed_today = NOT completed_today WHERE id = $1 AND user_id = $2', [req.params.id, req.session.user.id]);
  res.json({ status: 'ok' });
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
