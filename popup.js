function displayContainer(state) {
    screenArray = ['start', 'register', 'login', 'forgot', 'course', 'question', 'error'];
    for (let i = 0; i < screenArray.length; i++) {
        if (state == screenArray[i]) {
            document.getElementById(`${screenArray[i]}-container`).style.display = 'flex';
        } else {
            document.getElementById(`${screenArray[i]}-container`).style.display = 'none';
        }
    }
}

const host = 'https://prep-work-api.vercel.app';

async function verifyToken() {
    chrome.storage.local.get(['token'], function(result) {
        const token = result.token;

        if (token) {
            fetch(`${host}/users/verify`, {
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
                    listenForCourseInfo();
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

    fetch(`${host}/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({  email, username, password }),
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.status) {
            sendReloadRequest();
            chrome.runtime.onMessage.addListener(function(request) {
                if (request.type == "reloaded" && request.from == "background") {
                    notyf.success('Registered Successfully!');
                    appState = 'course';
                    displayContainer(appState);
                    chrome.storage.local.set({ token: data.token });
                    listenForCourseInfo();
                }
            });
        } else {
            notyf.error(data.error);
        }
    });
});

// Login
document.getElementById('loginBtn').addEventListener('click', () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    fetch(`${host}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.status) {
            sendReloadRequest();
            chrome.runtime.onMessage.addListener(function(request){
                if (request.type == "reloaded" && request.from == "background") {
                    notyf.success('Logged In Successfully!');
                    appState = 'course';
                    displayContainer(appState);
                    chrome.storage.local.set({ token: data.token });
                    listenForCourseInfo();
                }
            });
        } else {
            notyf.error(data.error);
        }
    });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    chrome.storage.local.remove(['token'], function() {
        notyf.success('Logged Out!');
        appState = 'start';
        displayContainer(appState);
    });
});

// Forgot Password
document.getElementById('forgotBtn').addEventListener('click', () => {
    const email = document.getElementById('forgotEmail').value;

    fetch(`${host}/users/forgot-password`, {
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

// Send Reload Request
function sendReloadRequest() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tab = tabs[0];
        const url = new URL(tab.url);
    
        if (url.pathname.split('/').length > 5) {
            chrome.tabs.sendMessage(tab.id, {type: 'reload'});
        }
    });
}

// Show Course Info and fetch answers
function listenForCourseInfo() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tab = tabs[0];
        const url = new URL(tab.url);
    
        if (url.pathname.split('/').length > 5) {
            chrome.tabs.sendMessage(tab.id, {type: 'getCourseInfo'});
            setTimeout(() => {
                chrome.storage.local.get(['wwNumber', 'qNumber', 'courseNumber', 'token'], function(result) {
                    document.getElementById('course-info').innerHTML = `${result.courseNumber} (WW${result.wwNumber} - Q${result.qNumber})`;
    
                    fetch(`${host}/answers/get?wwNumber=${result.wwNumber}&qNumber=${result.qNumber}&courseNumber=${result.courseNumber}&token=${result.token}`, {
                        method: 'GET',
                    })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.status) {
                            const cardContainer = document.getElementById('ques-cards');
                            cardContainer.innerHTML = '';
                            data.allQuestions.forEach(question => {
                                cardContainer.innerHTML += `<div class="ques-card" id="ques-card">
                                <input type="hidden" hidden value=${question._id}>
                                <div class="ques-card-head">
                                    <p class="card-question">${question.qString}</p>
                                </div>
                                <div class="ques-card-body">
                                    <p class="card-answer-number pink-button">${question.answers.length} Answer(s)</p>
                                </div>
                            </div>`
                            });

                            document.querySelectorAll('.ques-card').forEach(card => {
                                card.addEventListener('click', () => {
                                    const questionId = card.children[0].value;
                                    for (let i = 0; i < data.allQuestions.length; i++) {
                                        if (data.allQuestions[i]._id == questionId) {
                                            // Inflate Question
                                            document.getElementById('question').style.backgroundImage = `url(${data.allQuestions[i].file})`;
                                            const img = new Image();
                                            img.src = data.allQuestions[i].file;
                                            img.onload = () => {
                                                const aspectRatio = img.height / img.width;

                                                document.documentElement.style.setProperty('--paddingTop', `${aspectRatio * 100}%`);
                                            }
                                            // Inflate Answers
                                            document.getElementById('answers').innerHTML = '';
                                            for (let j = 0; j < data.allQuestions[i].answers.length; j++) {
                                                document.getElementById('answers').innerHTML += `<div class="answer-card">
                                                <p class="username">${data.allQuestions[i].answers[j][0]}</p>
                                                <div class="wrapper" id="${questionId}-${j}">
                                                </div>
                                                </div>`

                                                for (let k = 1; k < data.allQuestions[i].answers[j].length; k++) {
                                                    document.getElementById(`${questionId}-${j}`).innerHTML += `<input class="answer-input" type="text" value="${data.allQuestions[i].answers[j][k]}">`
                                                }
                                            }
                                        }
                                    }
                                    appState = 'question';
                                    displayContainer(appState);
                                    document.getElementById('question-info').innerHTML = `${result.courseNumber} (WW${result.wwNumber} - Q${result.qNumber})`;
                                });
                            });
                        } else {
                            notyf.error(data.error);
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
                });
            }, 500);
        }
    });
}

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
        } else if (appState == 'question') {
            appState = 'course';
            displayContainer(appState);
        }
    });
});