window.onload = () => {
    chrome.storage.local.get(['token'], function(result) {
        const token = result.token;

        const url = new URL(window.location.href);

        if (url.pathname.split('/').length > 5) {
            const regex = /\d+/;
            const wwNumber = parseInt(url.pathname.split('/')[3].match(regex)[0], 10);
            const qNumber = parseInt(url.pathname.split('/')[4]);
            let courseNumber;
            setTimeout(() => {
                courseNumber = document.getElementById('breadcrumb-navigation').children[0].children[1].innerText.substring(7, 15);
            }, 200);

            // Update course info every time the popup is opened
            chrome.runtime.onMessage.addListener(request => {
                console.log('hlo')
                if (request.type == "getCourseInfo") {
                    chrome.storage.local.set({ wwNumber: wwNumber, qNumber: qNumber, courseNumber: courseNumber });
                }
            });

            if(parseInt(document.getElementById('score_summary').children[0].innerHTML.split('<br>')[1].replace('Your overall recorded score is ', "").replace("%", "")) == 100) {
                let answers = [];
                const problem = document.getElementById('output_problem_body');

                function traverseDOM(node) {            
                    if (node.classList.contains('input-group')) {
                        answers.push(node.children[0].defaultValue);
                    }

                    // Use forEach to iterate over child nodes
                    Array.from(node.children).forEach(child => {
                        traverseDOM(child);
                    });
                }

                traverseDOM(problem);

                const textContent = document.querySelector('#output_problem_body').textContent
                const indexOfSolution = textContent.indexOf('Solution:  SOLUTION');
                const qString = document.querySelector('#output_problem_body').textContent.substring(0, indexOfSolution);

                html2canvas(document.querySelector('#output_problem_body')).then(canvas => {
                    fetch(`http://localhost:3000/answers/upload?token=${token}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            courseNumber: courseNumber,
                            wwNumber: wwNumber,
                            qNumber: qNumber,
                            answers: answers,
                            qString: qString,
                            file: canvas.toDataURL()
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        console.log(data);
                    })
                    .catch(err => console.log(err));
                });
            }
        }
    });
}