import { Router } from 'express';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/products?search=&category=&sort=price_asc|price_desc|newest
router.get('/', async (req, res) => {
  const { search, category, sort } = req.query;
  const filter = {};
  if (category && category !== 'all') filter.category = category;
  if (search) filter.name = { $regex: escapeRegex(String(search)), $options: 'i' };

  const sorts = { price_asc: { price: 1 }, price_desc: { price: -1 }, newest: { createdAt: -1 } };
  res.json(await Product.find(filter).sort(sorts[sort] || sorts.newest));
});

router.get('/categories', async (_req, res) => {
  res.json(await Product.distinct('category'));
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Admin: create / update / delete
router.post('/', protect, adminOnly, async (req, res) => {
  res.status(201).json(await Product.create(req.body));
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

export default router;
