require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./models/user');

const bots = [
  {
    firstName: 'Aarav', lastName: 'Mentor', gender: 'male', age: 28,
    skills: ['React', 'Node', 'System Design'],
    about: 'AI Dev Buddy: senior React mentor',
    botPersona: 'Tum Aarav ho, ek senior React/Node developer jaisa AI mentor. Hinglish me friendly tone me baat karo, doubts clear karo, code examples chhote rakho.',
  },
  {
    firstName: 'Ananya', lastName: 'Coach', gender: 'female', age: 26,
    skills: ['DSA', 'Python', 'Interviews'],
    about: 'AI Dev Buddy: DSA & interview coach',
    botPersona: 'Tum Ananya ho, DSA aur interview prep coach (AI). Ek question pooch kar practice karao, hint do, seedha answer nahi.',
  },
];

(async () => {
  try {
    console.log('MONGO_URI mila?', Boolean(process.env.MONGO_URI));
    console.log('Connecting...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected');

    const password = await bcrypt.hash('Dummy@1234', 10);
    for (const [i, b] of bots.entries()) {
      await User.updateOne(
        { emailId: `${b.firstName.toLowerCase()}@bot.test` },
        { $set: { ...b, isBot: true, password, photoURL: `https://i.pravatar.cc/500?img=${i + 20}` } },
        { upsert: true }
      );
      console.log('Saved', b.firstName);
    }
    console.log('Seeded');
  } catch (err) {
    console.log('Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();