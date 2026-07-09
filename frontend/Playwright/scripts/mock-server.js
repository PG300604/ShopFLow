const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../mock-app')));

// API routes for E2E tests
app.get('/api/products', (req, res) => {
  res.json([
    { id: 1, name: 'Premium Coffee Mug', price: 15.99, category: 'Kitchen', rating: 4.5 },
    { id: 2, name: 'Wireless Bluetooth Earbuds', price: 49.99, category: 'Electronics', rating: 4.2 },
    { id: 3, name: 'Ergonomic Desk Chair', price: 199.99, category: 'Office', rating: 4.8 },
  ]);
});

app.post('/api/cart/sync', (req, res) => {
  const { cartItems } = req.body;
  res.json({ success: true, syncedCount: cartItems ? cartItems.length : 0 });
});

app.post('/api/create-payment-intent', (req, res) => {
  res.json({ clientSecret: 'pi_mock_secret_' + Math.random().toString(36).substring(7) });
});

app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
});
