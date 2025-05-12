const express = require('express');
const stockRoutes = require('./routes/stockRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use('/', stockRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});