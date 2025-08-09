import mongoose from 'mongoose';

// Connecting to MongoDB Database
const connectDB = async () => {
    try {
        // 检查环境变量是否存在
        if (!process.env.MONGODB_URI) {
            console.error('Error: MONGODB_URI environment variable is not defined.');
            console.error('Please set the MONGODB_URI environment variable in your .env file.');
            process.exit(1);
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Connection pool configuration
            maxPoolSize: 10,
            minPoolSize: 2,
            // Timeout settings
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            // Heartbeat detection
            heartbeatFrequencyMS: 10000,
        });

        console.log(`MongoDB Atlas connected: ${conn.connection.host}`);
        console.log("current database name:", conn.connection.name);

        // Listening for connection events
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB The connection is lost, try to reconnect...');
            setTimeout(connectDB, 5000);
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB Connection Error:', err);
        });

    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.error('Error details:', error);
        // Retry the connection
        console.log('Try to reconnect after 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

export default connectDB;
