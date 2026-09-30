import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Create an order. Prices come from the database, never from the client.
router.post('/', protect, async (req, res) => {
  const { items, shipping } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Your cart is empty' });
  }

  const products = await Product.find({ _id: { $in: items.map((i) => i.product) } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const orderItems = [];
  for (const { product, qty } of items) {
    const p = byId.get(String(product));
    const q = Number(qty);
    if (!p || !Number.isInteger(q) || q < 1) {
      return res.status(400).json({ message: 'One of the items in your cart is invalid' });
    }
    if (p.stock < q) {
      return res.status(400).json({ message: `Only ${p.stock} left of ${p.name}` });
    }
    orderItems.push({ product: p._id, name: p.name, image: p.image, price: p.price, qty: q });
  }

  const total = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  try {
    const order = await Order.create({ user: req.user._id, items: orderItems, shipping, total });
    await Promise.all(
      orderItems.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: -i.qty } }))
    );
    res.status(201).json(order);
  } catch {
    res.status(400).json({ message: 'Please fill in all shipping details' });
  }
});

router.get('/mine', protect, async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
});

export default router;
