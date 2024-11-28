const mongoose = require('mongoose');
require('dotenv').config();

// 简单的测试模型
const Test = mongoose.model('Test', new mongoose.Schema({
    name: String,
    date: { type: Date, default: Date.now }
}));

// 连接数据库
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Successfully connected to MongoDB.');
        
        // 创建测试数据
        try {
            const test = new Test({ name: 'test entry' });
            await test.save();
            console.log('Test data saved successfully');
            
            // 读取数据
            const result = await Test.findOne({ name: 'test entry' });
            console.log('Found test data:', result);
            
        } catch (err) {
            console.error('Error during test:', err);
        } finally {
            // 关闭连接
            await mongoose.connection.close();
            console.log('Database connection closed');
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    }); 