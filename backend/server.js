import express from 'express';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';


(async() => {
    dotenv.config();

    await connectDB();

    const app = express();

    app.use(express.json());
    app.use(cookieParser());

    app.get('/health', (req, res) => {
        res.send('server is working');
    });

    // routes
    app.use('/api/auth', authRoutes);


    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})();