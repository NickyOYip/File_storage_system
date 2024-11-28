// Required dependencies
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

// Initialize Express app
const app = express();

// Database Models
const User = require('./models/user');
const File = require('./models/file');
//====================================================================================================================
// Middleware Setup
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
//====================================================================================================================
// Multer Configuration for File Upload
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// Authentication Middleware
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
};

const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') return next();
    res.status(403).send('Access denied');
};

// Passport Configuration
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                user = await User.create({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails[0].value
                });
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
//====================================================================================================================
// Authentication Routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => res.redirect('/dashboard')
);

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});
//====================================================================================================================
// User Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/dashboard', isAuthenticated, async (req, res) => {
    const files = await File.find({ uploadedBy: req.user._id });
    res.render('dashboard', { user: req.user, files });
});
//====================================================================================================================
// File Management Routes
app.post('/upload', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
        const newFile = await File.create({
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user._id
        });
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Upload failed');
    }
});

app.get('/download/:fileId', isAuthenticated, async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) return res.status(404).send('File not found');
        res.download(path.join(__dirname, 'public/uploads', file.filename), file.originalName);
    } catch (err) {
        res.status(500).send('Download failed');
    }
});

app.delete('/file/:fileId', isAuthenticated, async (req, res) => {
    try {
        await File.findByIdAndDelete(req.params.fileId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});
//====================================================================================================================
// Admin Routes
app.get('/admin', isAdmin, async (req, res) => {
    const users = await User.find();
    res.render('admin', { users });
});

app.post('/admin/users', isAdmin, async (req, res) => {
    try {
        await User.create(req.body);
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('User creation failed');
    }
});

app.delete('/admin/users/:userId', isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.userId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});
//====================================================================================================================
// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
//====================================================================================================================
// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));