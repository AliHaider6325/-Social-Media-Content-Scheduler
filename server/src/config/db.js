// server/src/config/db.js
import mongoose from 'mongoose';

export default async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  return mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}
