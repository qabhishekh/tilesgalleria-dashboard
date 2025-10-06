import mongoose from "mongoose";

let cachedConnection = null;

export const connectDB = async (uri) => {
  // Return existing connection if available and healthy
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    // Enhanced connection options for serverless environments
    const options = {
      maxPoolSize: 5, // Reduce pool size for serverless
      serverSelectionTimeoutMS: 10000, // Increase timeout for serverless cold starts
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 30000,
      // Additional options for better serverless support
      retryWrites: true,
      retryReads: true,
    };

    // Ensure URI is properly formatted
    const connectionUri = uri.replace('mongodb+srv://', 'mongodb+srv://');

    cachedConnection = await mongoose.connect(connectionUri, options);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      cachedConnection = null;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      cachedConnection = null;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    console.log('✅ MongoDB connected successfully');
    return cachedConnection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    cachedConnection = null;
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

// Health check function
export const checkDBConnection = () => {
  return mongoose.connection.readyState === 1;
};

// Graceful shutdown for development
if (typeof process !== 'undefined' && process.on) {
  process.on('SIGINT', async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
    }
    process.exit(0);
  });
}
