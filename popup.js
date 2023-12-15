appState = 'start';

// Register Choice Handler
document.getElementById('regChoiceBtn').addEventListener('click', () => {
    document.getElementById('start-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'flex';
    appState = 'register';
});

// Login Choice Handler
document.getElementById('loginChoiceBtn').addEventListener('click', () => {
    document.getElementById('start-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'flex';
    appState = 'login';
});

// Register
document.getElementById('regBtn').addEventListener('click', () => {
    const email = document.getElementById('regEmail').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({  email, username, password }),
    })
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
    });
});

document.querySelectorAll('#showPassBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const passwords = document.querySelectorAll('.password');
        passwords.forEach(password => {
            if (password.type === 'password') {
                password.type = 'text';
                e.target.style.backgroundImage = "url('./assets/rolling-eyes.png')";
            } else {
                password.type = 'password';
                e.target.style.backgroundImage = "url('./assets/peeking-face.png')";
            }
        });
    });
})

document.querySelectorAll('#backBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (appState == 'register' || appState == 'login') {
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('register-container').style.display = 'none';
            document.getElementById('start-container').style.display = 'flex';
        }
    });
});