const express = require('express');
const app = express();
const PORT = 8080;

app.get('/xxx', (req, res) => {
  res.send('¡¡Holi!!');
});
app.listen(PORT);