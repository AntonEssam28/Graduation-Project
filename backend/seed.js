const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  const email = 'admin@example.com';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists');
    return;
  }
  const password = await bcrypt.hash('Admin@123', 10);
  const admin = new User({
    name: 'Admin',
    email,
    password,
    role: 'Super Admin',
    assignedShelter: '',
  });
  await admin.save();
  console.log('Admin user created');
};

const run = async () => {
  await connect();
  await seedAdmin();
  mongoose.disconnect();
};

run();
