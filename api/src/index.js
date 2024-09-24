const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();

// Secret that is known only to the server
const serverSecret = "your-server-side-secret-salt";

// Setup session middleware
app.use(session({
    secret: 'your-session-secret',  // session secret for signing cookies
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, maxAge: 60000 } // Adjust to your needs
}));

// Function to derive deterministic seed
function deriveSeed(password, userId) {
    const uniqueUserInput = `${userId}:${password}`;
    const hash = bcrypt.hashSync(uniqueUserInput + serverSecret, 10); // bcrypt is deterministic if the input is the same
    return hash;  // This is your deterministic, unique seed
}

// Route to login and start session
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const userId = username;
    console.log('welcome')
    const seed = deriveSeed(password, userId);
    // Store the derived seed in the session (but not persistently)
    req.session.seed = seed;
    req.session.username = username;
    res.send("User logged in, session started.");
});

app.post('/create', (req, res) => {
    checkCookie(req, res, (uname, seed) => {
        murmur.create(seed, uname, 10000, injectedSigner);
    });
});

app.post('/execute', (req, res) => {
    checkCookie(req, res, (uname, seed) => {
        murmur.execute(seed, uname, req.when, injectedSigner);
    });
});

function checkCookie(req, res, callback) {
    if (req.session.seed && req.session.username) {
        let username = req.session.username;
        let seed = req.session.seed;
        // res.send(`Your session seed is: ${req.session.seed}`);
        // now we call the wasm to create an MMR
        // murmur.create(seed, username, 10000, injectedSigner);
        callback(username, seed)
    } else {
        res.status(403).send("No session active");
    }
}
// });

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

