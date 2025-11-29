const bcrypt = require('bcryptjs');
const Category = require('../models/Category');
const User = require('../models/User');
const Admin = require('../models/Admin');

const SEED_ADMIN_EMAIL = 'admin@gmail.com';
const SEED_ADMIN_PASSWORD = 'Admin@123';
const SEED_ADMIN_NAME = 'Admin';

const DEFAULT_CATEGORIES = [
  { category: 'Video Streaming', platform: 'Netflix' },
  { category: 'Video Streaming', platform: 'YouTube' },
  { category: 'Video Streaming', platform: 'Hotstar' },
  { category: 'Video Streaming', platform: 'Hulu' },
  { category: 'Video Streaming', platform: 'Amazon Prime' },
  { category: 'Video Streaming', platform: 'HBO Max' },
  { category: 'Audio Streaming', platform: 'Spotify' },
  { category: 'Audio Streaming', platform: 'SoundCloud' },
  { category: 'Audio Streaming', platform: 'Audible' },
  { category: 'Audio Streaming', platform: 'Apple Music' },
  { category: 'Online Storage', platform: 'Google Drive' },
  { category: 'Online Storage', platform: 'Dropbox' },
  { category: 'Online Storage', platform: 'OneDrive' }
];

async function ensureSeedAdmin() {
  let admin = await Admin.findOne({ email: SEED_ADMIN_EMAIL.toLowerCase() });
  if (!admin) {
    const hashed = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);
    admin = await Admin.create({
      fullName: SEED_ADMIN_NAME,
      email: SEED_ADMIN_EMAIL.toLowerCase(),
      password: hashed,
      isVerified: true
    });
  }

  // Also ensure a corresponding user exists to satisfy category refs
  let user = await User.findOne({ email: SEED_ADMIN_EMAIL.toLowerCase() });
  if (!user) {
    const hashed = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);
    user = await User.create({
      firstName: SEED_ADMIN_NAME,
      lastName: 'Seeder',
      email: SEED_ADMIN_EMAIL.toLowerCase(),
      phone: '0000000000',
      password: hashed,
      role: 'admin',
      isVerified: true,
      isActive: true
    });
  }

  return { admin, user };
}

async function seedCategories() {
  try {
    const { admin, user } = await ensureSeedAdmin();

    for (const item of DEFAULT_CATEGORIES) {
      const exists = await Category.findOne({
        category: item.category,
        platform: item.platform
      });

      if (exists) continue;

      await Category.create({
        category: item.category,
        platform: item.platform,
        user: user._id,
        createdBy: user._id,
        updatedBy: user._id
      });
    }

    console.log('Default admin seeded and categories ensured.');
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
}

module.exports = seedCategories;
