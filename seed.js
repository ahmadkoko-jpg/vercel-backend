import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Product from './models/Product.js';
import User from './models/User.js';

const img = (seed) => `https://picsum.photos/seed/${seed}/700/700`;

const products = [
  { name: 'Stoneware Mug', category: 'Kitchen', price: 1800, stock: 25, image: img('mug'), description: 'Hand-glazed 350 ml mug that keeps drinks warm and feels good in the hand.' },
  { name: 'Linen Apron', category: 'Kitchen', price: 3200, stock: 15, image: img('apron'), description: 'Washed linen apron with two deep pockets and adjustable neck strap.' },
  { name: 'Cast Iron Skillet', category: 'Kitchen', price: 7400, stock: 10, image: img('skillet'), description: 'Pre-seasoned 26 cm skillet. Works on gas, induction and open fire.' },
  { name: 'Desk Lamp', category: 'Home', price: 6900, stock: 12, image: img('lamp'), description: 'Adjustable arm lamp with warm LED light and a weighted base.' },
  { name: 'Woven Throw Blanket', category: 'Home', price: 5600, stock: 18, image: img('blanket'), description: 'Soft cotton throw, 130 x 180 cm. Machine washable.' },
  { name: 'Ceramic Vase', category: 'Home', price: 2900, stock: 20, image: img('vase'), description: 'Matte finish vase, 22 cm tall, sized for a small bunch of stems.' },
  { name: 'Canvas Backpack', category: 'Bags', price: 8800, stock: 9, image: img('backpack'), description: 'Water-resistant canvas backpack with a padded 15 inch laptop sleeve.' },
  { name: 'Leather Card Holder', category: 'Bags', price: 2400, stock: 30, image: img('cardholder'), description: 'Slim full-grain leather holder for six cards and folded notes.' },
  { name: 'Everyday Tote', category: 'Bags', price: 3900, stock: 22, image: img('tote'), description: 'Heavy cotton tote with an inside zip pocket. Holds up to 10 kg.' },
];

await mongoose.connect(process.env.MONGO_URI);
await Product.deleteMany();
await Product.insertMany(products);

if (!(await User.findOne({ email: 'admin@shop.com' }))) {
  await User.create({ name: 'Admin', email: 'admin@shop.com', password: 'admin123', isAdmin: true });
}

console.log(`Seeded ${products.length} products. Admin login: admin@shop.com / admin123`);
await mongoose.disconnect();
