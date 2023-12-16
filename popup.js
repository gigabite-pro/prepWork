function displayContainer(state) {
    screenArray = ['start', 'register', 'login', 'forgot', 'course', 'error'];
    for (let i = 0; i < screenArray.length; i++) {
        if (state == screenArray[i]) {
            document.getElementById(`${screenArray[i]}-container`).style.display = 'flex';
        } else {
            document.getElementById(`${screenArray[i]}-container`).style.display = 'none';
        }
    }
}

async function verifyToken() {
    chrome.storage.local.get(['token'], function(result) {
        const token = result.token;

        if (token) {
            fetch('http://localhost:3000/users/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            })
            .then((res) => res.json())
            .then((data) => {
                if (data.status) {
                    appState = 'course'; // course
                    displayContainer(appState);
                    notyf.success('Auto Logged In!');
                    chrome.storage.local.set({ token: token });
                } else {
                    appState = 'start'; // start
                    displayContainer(appState);
                    notyf.error('Please Login Again!');
                }
            });
        } else {
            appState = 'start'; //start
            displayContainer(appState);
        }
    });
}

let appState = '';
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const tab = tabs[0];
    const url = new URL(tab.url);

    if (url.pathname.split('/').length > 5) {
        verifyToken();
    } else {
        appState = 'error';
        displayContainer(appState);
    }
});

var notyf = new Notyf({
    position: {
        x: 'center',
        y: 'top',
    }
});

// Register Choice Handler
document.getElementById('regChoiceBtn').addEventListener('click', () => {
    appState = 'register';
    displayContainer(appState);
});

// Login Choice Handler
document.getElementById('loginChoiceBtn').addEventListener('click', () => {
    appState = 'login';
    displayContainer(appState);
});

// Forgot Password Choice Handler
document.getElementById('forgotPass').addEventListener('click', () => {
    appState = 'forgot';
    displayContainer(appState);
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
            notyf.success('Registered Successfully!');
            appState = 'course';
            displayContainer(appState);
            chrome.storage.local.set({ token: data.token });
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
            notyf.success('Logged In Successfully!');
            appState = 'course';
            displayContainer(appState);
            chrome.storage.local.set({ token: data.token });
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
            appState = 'login';
            displayContainer(appState);
        } else {
            notyf.error(data.error);
        }
    });
});

// Show Course Info
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const tab = tabs[0];
    const url = new URL(tab.url);

    if (url.pathname.split('/').length > 5) {
        chrome.tabs.sendMessage(tab.id, {type: 'getCourseInfo'});
        setTimeout(() => {
            chrome.storage.local.get(['wwNumber', 'qNumber', 'courseNumber'], function(result) {
                document.getElementById('course-info').innerHTML = `${result.courseNumber} (WW${result.wwNumber} - Q${result.qNumber})`;
            });
        }, 500);
    }
});

// Show/Hide Password
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

// Back Button
document.querySelectorAll('#backBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (appState == 'register' || appState == 'login') {
            appState = 'start';
            displayContainer(appState);
        } else if (appState == 'forgot') {
            appState = 'login';
            displayContainer(appState);
        }
    });
});