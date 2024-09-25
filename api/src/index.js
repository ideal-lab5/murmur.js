const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();

// Secret that is known only to the server (we would use this to connect with oauth, for example)
// can probably omit it for now if we don't care about security in the demo
const serverSecret = "your-server-side-secret-salt";

// Setup session middleware
app.use(session({
    secret: 'your-session-secret',  // session secret for signing cookies
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, maxAge: 60000 }  // adjust maxAge as needed
}));

// Route to login and start session
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const userId = username;
    console.log(`welcome ${userId}`)
    const seed = deriveSeed(password, userId);
    // Store the derived seed in the session (but not persistently)
    req.session.seed = seed;
    req.session.username = username;
    res.send("User logged in, session started.");
});

app.post('/create', (req, res) => {
    checkCookie(req, res, (uname, seed) => {
        // the cookie is valid and we have the username and seed
        // now we need to validate the inputs
        // murmur.create(seed, uname, 10000, injectedSigner);
        console.log('create mmr called')
    });
});

app.post('/execute', (req, res) => {
    checkCookie(req, res, (uname, seed) => {
        // murmur.execute(seed, uname, req.when, injectedSigner);
        console.log('execute called')
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});


 
// verify the session cookie contains username and seed
function checkCookie(req, res, callback) {
    if (req.session.seed && req.session.username) {
        let username = req.session.username;
        let seed = req.session.seed;
        callback(username, seed)
    } else {
        res.status(403).send("No session active");
    }
}

// Function to derive deterministic seed
function deriveSeed(password, userId) {
    const uniqueUserInput = `${userId}:${password}`;
    // bcrypt is deterministic if the input is the same
    const hash = bcrypt.hashSync(uniqueUserInput + serverSecret, 10);
    // the 'seed'
    return hash;
}