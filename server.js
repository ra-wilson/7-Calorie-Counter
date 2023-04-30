const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));

let user = {};

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  user = {
    username,
    password,
  };

  res.status(200).json({ message: 'Registration successful!' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (username === user.username && password === user.password) {
    res.status(200).json({ message: 'Login successful!' });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

app.get('/api/nutrition', async (req, res) => {
  const query = req.query.query;

  try {
      const response = await axios.get('https://api.api-ninjas.com/v1/nutrition?query=' + query, {
          headers: { 'X-Api-Key': process.env.API_KEY },
      });

      res.json(response.data);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
