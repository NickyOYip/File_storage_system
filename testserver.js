const express = require('express');
const path = require('path');
const app = express();

// Middleware setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Test user data
const testUser = {
    email: 'test@test.com',
    password: 'password',
    role: 'admin'
};

// Routes
// 1. Login page
app.get('/', (req, res) => {
    console.log('Accessing login page');
    res.render('login', { error: null });
});

// 2. Register routes
app.get('/register', (req, res) => {
    console.log('Accessing register page');
    res.render('register', { error: null });
});

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    console.log('Registration attempt:', { email });
    // For testing, just redirect back to login
    res.redirect('/');
});

// 3. Login post route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === testUser.email && password === testUser.password) {
        if (testUser.role === 'admin') {
            res.render('admin/dashboard', { user: testUser });
        } else {
            res.render('user/dashboard', { user: testUser, files: [] });
        }
    } else {
        res.render('login', { error: 'Invalid email or password' });
    }
});

// 4. Admin pages
app.get('/admin/dashboard', (req, res) => {
    res.render('admin/dashboard', { user: testUser });
});

app.get('/admin/createuser', (req, res) => {
    res.render('admin/createuser', { error: null });
});

// 5. User pages
app.get('/user/dashboard', (req, res) => {
    res.render('user/dashboard', { user: testUser, files: [] });
});

app.get('/user/create', (req, res) => {
    res.render('user/create', { error: null });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
    console.log('Test credentials:', testUser);
});