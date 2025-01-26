const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Rajan1.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'swastic.html'));
});

// API endpoints
app.get('/api', (req, res) => {
    res.json({ 
        message: 'Image Uploader API is running',
        endpoints: {
            register: '/api/register',
            login: '/api/login',
            users: '/api/users',
            profile: '/api/profile/:userId'
        }
    });
});

// Load users from file or create new if doesn't exist
let users = { users: [] };
const DATA_FILE = 'userdata.json';

// Load existing data
try {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        users = JSON.parse(data);
    } else {
        // Create file with default test user
        users.users.push({
            id: 'user_1',
            username: 'test',
            email: 'test@example.com',
            password: 'password123',
            joinDate: '2024-01-01T00:00:00.000Z'
        });
        fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
    }
} catch (error) {
    console.log('Error loading user data:', error);
}

// Function to save users to file
function saveUsers() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
    } catch (error) {
        console.log('Error saving user data:', error);
    }
}

// API endpoints
app.get('/api/users', (req, res) => {
    res.json(users);
});

app.post('/api/register', (req, res) => {
    const newUser = req.body;
    
    if (users.users.find(u => u.email === newUser.email)) {
        return res.status(400).json({ error: 'Email already exists' });
    }
    
    users.users.push(newUser);
    saveUsers();
    
    res.json({ 
        success: true,
        message: 'Registration successful',
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            joinDate: newUser.joinDate
        }
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = users.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                joinDate: user.joinDate
            }
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// API endpoint to get user profile
app.get('/api/profile/:userId', (req, res) => {
    const user = users.users.find(u => u.id === req.params.userId);
    
    if (user) {
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            joinDate: user.joinDate
        });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Test user available:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
}); 