import mongoose from 'mongoose';

const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost/demo_db';

mongoose.connect(MONGODB_URI)
  .then((): void => {
    console.log('MongoDB connected successfully');
  })
  .catch((err: Error): void => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

export default mongoose;
