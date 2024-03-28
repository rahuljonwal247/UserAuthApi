const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/authentication', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Remove deprecated options below
      // useCreateIndex: true,
      // useFindAndModify: false,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
