appState = 'start';

var notyf = new Notyf({
    position: {
        x: 'center',
        y: 'top',
    }
});

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

// Forgot Password Choice Handler
document.getElementById('forgotPass').addEventListener('click', () => {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('forgot-container').style.display = 'flex';
    appState = 'forgot';
});

// Register
document.getElementById('regBtn').addEventListener('click', () => {
    const email = document.getElementById('regEmail').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    fetch('http://localhost:3000/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({  email, username, password }),
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.status) {
            document.cookie = `token=${data.token}`;
            notyf.success('Registered Successfully!');
            document.getElementById('register-container').style.display = 'none';
            document.getElementById('course-container').style.display = 'flex';
            appState = 'course';
        } else {
            notyf.error(data.error);
        }
    });
});

// Login
document.getElementById('loginBtn').addEventListener('click', () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.status) {
            document.cookie = `token=${data.token}`;
            notyf.success('Logged In Successfully!');
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('course-container').style.display = 'flex';
            appState = 'course';
        } else {
            notyf.error(data.error);
        }
    });
});

// Forgot Password
document.getElementById('forgotBtn').addEventListener('click', () => {
    const email = document.getElementById('forgotEmail').value;

    fetch('http://localhost:3000/users/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.status) {
            notyf.success('Password Reset Link Sent!');
            document.getElementById('forgot-container').style.display = 'none';
            document.getElementById('login-container').style.display = 'flex';
            appState = 'login';
        } else {
            notyf.error(data.error);
        }
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
        } else if (appState == 'forgot') {
            document.getElementById('forgot-container').style.display = 'none';
            document.getElementById('login-container').style.display = 'flex';
        }
    });
});