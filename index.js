const express = require('express');
const app = express();

// Built-in middleware for parsing JSON bodies
app.use(express.json());

app.post('/', (req, res) => {
  console.log('Received POST:', req.body);
  res.status(200).json({ message: 'Received!' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
