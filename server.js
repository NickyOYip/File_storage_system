require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

const app = express();

// Import models
const User = require('./models/user');
const File = require('./models/file');

// Create uploads directory if it doesn't exist
const uploadDir = './public/uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    name: 'connect.sid'
}));

console.log('Session middleware configured');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// Authentication Middleware with more logging
const isAuthenticated = (req, res, next) => {
    console.log('\n=== AUTH CHECK ===');
    console.log('Checking authentication');
    console.log('Session exists:', !!req.session);
    console.log('Session data:', req.session);
    
    if (!req.session.user) {
        console.log('No user in session, redirecting to login');
        return res.redirect('/login');
    }
    
    console.log('User authenticated, proceeding...');
    console.log('=== AUTH CHECK END ===\n');
    
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
};

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') return next();
    res.status(403).send('Access denied');
};

// Routes
app.get('/', (req, res) => {
    console.log('Accessing root route');
    res.render('login', { error: null });
});

// Auth Routes
app.get('/login', (req, res) => {
    console.log('Accessing login route');
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email });
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.render('login', { error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.log('Invalid password');
            return res.render('login', { error: 'Invalid credentials' });
        }

        // Set session
        req.session.user = {
            _id: user._id,
            email: user.email,
            role: user.role
        };
        
        console.log('Login successful');
        console.log('Session created:', req.session.user);
        
        // Use res.redirect instead of res.render
        if (user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else {
            return res.redirect('/user/dashboard');
        }
    } catch (err) {
        console.error('Login error:', err);
        res.render('login', { error: 'Login failed' });
    }
});

// Logout route with extensive logging
app.post('/logout', (req, res) => {
    console.log('\n=== LOGOUT INITIATED ===');
    
    // Store session info for logging
    const sessionInfo = {
        id: req.sessionID,
        data: req.session
    };
    
    console.log('Current session before logout:', sessionInfo);
    
    // Destroy session
    req.session.destroy((err) => {
        if(err) {
            console.error('Logout error:', err);
            return res.status(500).send('Logout failed');
        }
        
        console.log('Session destroyed');
        res.clearCookie('connect.sid');
        console.log('Cookie cleared');
        
        // Log final state
        console.log('Final session state: null');
        console.log('=== LOGOUT COMPLETED ===\n');
        
        // Redirect to login
        res.redirect('/login');
    });
});

// Keep the GET route for direct URL access
app.get('/logout', (req, res) => {
    console.log('GET logout accessed - redirecting to POST');
    res.redirect('/login');
});

// Add a test route
app.get('/session-status', (req, res) => {
    console.log('\n=== SESSION STATUS ===');
    console.log('Session exists:', !!req.session);
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    console.log('=== STATUS END ===\n');
    res.send('Session status logged - check console');
});

// Add this route to test session status
app.get('/session-check', (req, res) => {
    console.log('Current session:', req.session);
    res.send('Check console for session status');
});

// User Routes
app.get('/user/dashboard', isAuthenticated, async (req, res) => {
    try {
        console.log('Accessing user dashboard');
        console.log('User ID for query:', req.session.user._id);

        // Get user's files with debug logging
        const files = await File.find({ user: req.session.user._id });
        console.log('Query result:', files);
        console.log('Files found:', files.length);

        res.render('user/dashboard', {
            user: req.session.user,
            files: files
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).send('Error loading dashboard');
    }
});

app.get('/user/create', isAuthenticated, (req, res) => {
    res.render('user/create', { file: {} });
});

app.get('/user/edit/:fileId', isAuthenticated, async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) return res.status(404).send('File not found');
        res.render('user/edit', { file });
    } catch (err) {
        res.status(500).send('Error loading file');
    }
});

app.get('/user/delete/:fileId', isAuthenticated, async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) return res.status(404).send('File not found');
        res.render('user/delete', { file });
    } catch (err) {
        res.status(500).send('Error loading file');
    }
});

// File Routes
app.post('/upload', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            console.log('No file uploaded');
            return res.redirect('/user/dashboard');
        }

        console.log('File upload attempt:', req.file);
        console.log('User ID:', req.session.user._id);

        // Create new file document with user ID
        const newFile = new File({
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            uploadDate: new Date(),
            user: req.session.user._id
        });

        await newFile.save();
        console.log('File saved to database:', newFile);

        res.redirect('/user/dashboard');
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).send('Error uploading file');
    }
});

app.get('/download/:fileId', isAuthenticated, async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        
        if (!file || file.user.toString() !== req.session.user._id.toString()) {
            return res.status(404).send('File not found');
        }

        res.download(file.path, file.originalName);
    } catch (err) {
        console.error('Download error:', err);
        res.status(500).send('Error downloading file');
    }
});

app.post('/files/:fileId/delete', isAuthenticated, async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) return res.status(404).send('File not found');
        
        // Delete file from storage
        fs.unlinkSync(path.join(__dirname, 'public/uploads', file.filename));
        // Delete file record from database
        await File.findByIdAndDelete(req.params.fileId);
        
        res.redirect('/user/dashboard');
    } catch (err) {
        res.status(500).send('Delete failed');
    }
});

// Admin Routes
app.get('/admin/dashboard', isAdmin, (req, res) => {
    res.render('admin/dashboard', { user: req.session.user });
});

app.get('/admin/record', isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.render('admin/record', { users });
    } catch (err) {
        res.status(500).send('Error loading users');
    }
});

app.get('/admin/createuser', isAdmin, (req, res) => {
    res.render('admin/createuser');
});

app.post('/admin/createuser', isAdmin, async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await User.create({
            email,
            password: hashedPassword,
            role
        });
        
        res.redirect('/admin/record');
    } catch (err) {
        res.render('admin/createuser', { error: 'User creation failed' });
    }
});

app.post('/admin/users/:userId/delete', isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.userId);
        res.redirect('/admin/record');
    } catch (err) {
        res.status(500).send('Delete failed');
    }
});

// Show registration page
app.get('/register', (req, res) => {
    res.render('register', { error: null });
    console.log('Accessing register page');

});

// Handle registration
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Registration attempt:', { email });
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { 
                error: 'Email already registered' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        await User.create({
            email,
            password: hashedPassword,
            role: 'user'
        });

        console.log('Registration successful:', email);
        res.redirect('/login');
    } catch (err) {
        console.error('Registration error:', err);
        res.render('register', { 
            error: 'Registration failed' 
        });
    }
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Add this to test view resolution
app.get('/test-view', (req, res) => {
    console.log('View path:', path.join(__dirname, 'views'));
    console.log('Available views:', require('fs').readdirSync(path.join(__dirname, 'views')));
    res.send('Check console for view debug info');
});

// Add a test route to verify session state
app.get('/test-session', (req, res) => {
    console.log('\n=== SESSION TEST ===');
    console.log('Current session:', req.session);
    console.log('Session ID:', req.sessionID);
    console.log('=== SESSION TEST END ===\n');
    res.send('Check console for session status');
});

app.post('/delete/:fileId', isAuthenticated, async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        
        if (!file || file.user.toString() !== req.session.user._id.toString()) {
            return res.status(404).send('File not found');
        }

        // Delete file from storage
        fs.unlink(file.path, async (err) => {
            if (err) {
                console.error('File deletion error:', err);
            }
            
            // Delete file from database
            await File.findByIdAndDelete(req.params.fileId);
            res.redirect('/user/dashboard');
        });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).send('Error deleting file');
    }
});

// Add this route for testing
app.get('/test-files', isAuthenticated, async (req, res) => {
    try {
        // Find all files
        const allFiles = await File.find({});
        console.log('All files in database:', allFiles);
        
        // Find user's files
        const userFiles = await File.find({ user: req.session.user._id });
        console.log('User files:', userFiles);
        
        res.json({
            allFiles: allFiles,
            userFiles: userFiles
        });
    } catch (err) {
        console.error('Test query error:', err);
        res.status(500).send('Error testing files');
    }
});