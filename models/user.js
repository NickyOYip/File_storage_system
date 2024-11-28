const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true,
        unique: true,
        min: 1
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;