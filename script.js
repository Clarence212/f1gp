let sessionId = sessionStorage.getItem('viewer_id');
if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('viewer_id', sessionId);
}

const counterElement = document.getElementById('counter');
const stream1Btn = document.getElementById('stream1-btn');
const stream2Btn = document.getElementById('stream2-btn');
const iframe = document.querySelector('iframe');

const stream1Url = 'https://streamcrichd.com/update/skyf1.php';
const stream2Url = 'https://embedsports.me/fia-f1/sky-sports-f1-sky-f1-stream-1';

function setStream(url, btn) {
    console.log(`Switching to stream: ${url}`);

    // updates active state
    document.querySelectorAll('.stream-selector button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Force reload by clearing src first
    iframe.src = 'about:blank';
    setTimeout(() => {
        iframe.src = url;
    }, 100);
}

stream1Btn.addEventListener('click', () => setStream(stream1Url, stream1Btn));
stream2Btn.addEventListener('click', () => setStream(stream2Url, stream2Btn));

// PHP Backend Polling Logic
function updateCounter() {
    const formData = new FormData();
    formData.append('id', sessionId);

    fetch('counter.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.count !== undefined) {
                counterElement.textContent = data.count;
            }
        })
        .catch(error => console.error('Error fetching count:', error));
}

// Poll every 5 seconds
setInterval(updateCounter, 5000);
// Initial call
updateCounter();

// --- Chat Logic ---
const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementById('chat-messages');
const usernameInput = document.getElementById('username-input');
const messageInput = document.getElementById('message-input');

// Load username from storage
if (localStorage.getItem('chat_username')) {
    usernameInput.value = localStorage.getItem('chat_username');
}

console.log('Chat script loaded');

if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Chat form submitted');

        const username = usernameInput.value.trim();
        const message = messageInput.value.trim();

        if (username && message) {
            console.log('Sending message:', message);
            localStorage.setItem('chat_username', username);

            const formData = new FormData();
            formData.append('username', username);
            formData.append('message', message);

            fetch('chat.php', {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    console.log('Raw response:', response);
                    return response.text();
                })
                .then(text => {
                    console.log('Response text:', text);
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        console.error('Json parse error:', e);
                        // ALERT THE USER with the actual response text (truncated)
                        alert('Server Error: ' + text.substring(0, 100));
                        throw new Error('Invalid JSON');
                    }
                })
                .then(data => {
                    console.log('Parsed data:', data);
                    if (data.status === 'success') {
                        messageInput.value = '';
                        updateChat(); // Instant update
                    } else {
                        alert('Error from server: ' + (data.message || 'Unknown error'));
                    }
                })
                .catch(err => {
                    console.error('Fetch error:', err);
                    // Don't alert again if we already alerted in the JSON parse block
                    if (err.message !== 'Invalid JSON') {
                        alert('Network/Fetch Error: ' + err.message);
                    }
                });
        } else {
            console.warn('Username or message empty');
        }
    });
} else {
    console.error('Chat form element not found!');
}

let lastMessageCount = 0;

function updateChat() {
    fetch('chat.php')
        .then(response => response.json())
        .then(messages => {
            if (!Array.isArray(messages)) return;

            // Only update if new messages arrived
            if (messages.length !== lastMessageCount || messages.length === 0) {
                chatMessages.innerHTML = '';

                if (messages.length === 0) {
                    chatMessages.innerHTML = '<div class="message system">Welcome to the chat!</div>';
                }

                messages.forEach(msg => {
                    const div = document.createElement('div');
                    div.className = 'message';

                    const userSpan = document.createElement('span');
                    userSpan.className = 'user';
                    userSpan.textContent = msg.username + ': ';

                    const textSpan = document.createElement('span');
                    textSpan.textContent = msg.message;

                    div.appendChild(userSpan);
                    div.appendChild(textSpan);
                    chatMessages.appendChild(div);
                });

                // Auto scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
                lastMessageCount = messages.length;
            }
        })
        .catch(error => {
            console.error('Error fetching chat:', error);
        });
}

// Poll chat every 1 second
setInterval(updateChat, 1000);
updateChat();

// --- Countdown Logic ---
const f1Events = [
    { name: "Australia • Practice 1", time: "2026-03-06T09:30:00+08:00" },
    { name: "Australia • Practice 2", time: "2026-03-06T13:00:00+08:00" },
    { name: "Australia • Practice 3", time: "2026-03-07T09:30:00+08:00" },
    { name: "Australia • Qualifying", time: "2026-03-07T13:00:00+08:00" },
    { name: "Australia • Race", time: "2026-03-08T12:00:00+08:00" },
    { name: "China • Practice 1", time: "2026-03-13T11:30:00+08:00" },
    { name: "China • Sprint Quali", time: "2026-03-13T15:30:00+08:00" },
    { name: "China • Sprint", time: "2026-03-14T11:00:00+08:00" },
    { name: "China • Qualifying", time: "2026-03-14T15:00:00+08:00" },
    { name: "China • Race", time: "2026-03-15T15:00:00+08:00" },
    { name: "Japan • Practice 1", time: "2026-03-27T10:30:00+08:00" },
    { name: "Japan • Practice 2", time: "2026-03-27T14:00:00+08:00" },
    { name: "Japan • Practice 3", time: "2026-03-28T10:30:00+08:00" },
    { name: "Japan • Qualifying", time: "2026-03-28T14:00:00+08:00" },
    { name: "Japan • Race", time: "2026-03-29T13:00:00+08:00" },
    { name: "Bahrain • Practice 1", time: "2026-04-10T19:30:00+08:00" },
    { name: "Bahrain • Practice 2", time: "2026-04-10T23:00:00+08:00" },
    { name: "Bahrain • Practice 3", time: "2026-04-11T20:30:00+08:00" },
    { name: "Bahrain • Qualifying", time: "2026-04-12T00:00:00+08:00" },
    { name: "Bahrain • Race", time: "2026-04-12T23:00:00+08:00" },
    { name: "Saudi Arabia • Practice 1", time: "2026-04-17T21:30:00+08:00" },
    { name: "Saudi Arabia • Practice 2", time: "2026-04-18T01:00:00+08:00" },
    { name: "Saudi Arabia • Practice 3", time: "2026-04-18T21:30:00+08:00" },
    { name: "Saudi Arabia • Qualifying", time: "2026-04-19T01:00:00+08:00" },
    { name: "Saudi Arabia • Race", time: "2026-04-20T01:00:00+08:00" },
    { name: "Miami • Practice 1", time: "2026-05-01T23:30:00+08:00" },
    { name: "Miami • Sprint Quali", time: "2026-05-02T03:30:00+08:00" },
    { name: "Miami • Sprint", time: "2026-05-02T23:00:00+08:00" },
    { name: "Miami • Qualifying", time: "2026-05-03T03:00:00+08:00" },
    { name: "Miami • Race", time: "2026-05-04T03:00:00+08:00" },
    { name: "Canada • Practice 1", time: "2026-05-22T23:30:00+08:00" },
    { name: "Canada • Sprint Quali", time: "2026-05-23T03:30:00+08:00" },
    { name: "Canada • Sprint", time: "2026-05-23T23:00:00+08:00" },
    { name: "Canada • Qualifying", time: "2026-05-24T03:00:00+08:00" },
    { name: "Canada • Race", time: "2026-05-25T02:00:00+08:00" },
    { name: "Monaco • Practice 1", time: "2026-06-05T19:30:00+08:00" },
    { name: "Monaco • Practice 2", time: "2026-06-05T23:00:00+08:00" },
    { name: "Monaco • Practice 3", time: "2026-06-06T18:30:00+08:00" },
    { name: "Monaco • Qualifying", time: "2026-06-06T22:00:00+08:00" },
    { name: "Monaco • Race", time: "2026-06-07T21:00:00+08:00" },
    { name: "Barcelona • Practice 1", time: "2026-06-12T19:30:00+08:00" },
    { name: "Barcelona • Practice 2", time: "2026-06-12T23:00:00+08:00" },
    { name: "Barcelona • Practice 3", time: "2026-06-13T18:30:00+08:00" },
    { name: "Barcelona • Qualifying", time: "2026-06-13T22:00:00+08:00" },
    { name: "Barcelona • Race", time: "2026-06-14T21:00:00+08:00" },
    { name: "Austria • Practice 1", time: "2026-06-26T18:30:00+08:00" },
    { name: "Austria • Sprint Quali", time: "2026-06-26T22:30:00+08:00" },
    { name: "Austria • Sprint", time: "2026-06-27T18:00:00+08:00" },
    { name: "Austria • Qualifying", time: "2026-06-27T22:00:00+08:00" },
    { name: "Austria • Race", time: "2026-06-28T21:00:00+08:00" },
    { name: "Great Britain • Practice 1", time: "2026-07-03T19:30:00+08:00" },
    { name: "Great Britain • Sprint Quali", time: "2026-07-03T23:30:00+08:00" },
    { name: "Great Britain • Sprint", time: "2026-07-04T19:00:00+08:00" },
    { name: "Great Britain • Qualifying", time: "2026-07-04T23:00:00+08:00" },
    { name: "Great Britain • Race", time: "2026-07-05T22:00:00+08:00" },
    { name: "Belgium • Practice 1", time: "2026-07-17T19:30:00+08:00" },
    { name: "Belgium • Practice 2", time: "2026-07-17T23:00:00+08:00" },
    { name: "Belgium • Practice 3", time: "2026-07-18T18:30:00+08:00" },
    { name: "Belgium • Qualifying", time: "2026-07-18T22:00:00+08:00" },
    { name: "Belgium • Race", time: "2026-07-19T21:00:00+08:00" },
    { name: "Hungary • Practice 1", time: "2026-07-24T19:30:00+08:00" },
    { name: "Hungary • Practice 2", time: "2026-07-24T23:00:00+08:00" },
    { name: "Hungary • Practice 3", time: "2026-07-25T18:30:00+08:00" },
    { name: "Hungary • Qualifying", time: "2026-07-25T22:00:00+08:00" },
    { name: "Hungary • Race", time: "2026-07-26T21:00:00+08:00" },
    { name: "Netherlands • Practice 1", time: "2026-08-21T18:30:00+08:00" },
    { name: "Netherlands • Practice 2", time: "2026-08-21T22:00:00+08:00" },
    { name: "Netherlands • Practice 3", time: "2026-08-22T17:30:00+08:00" },
    { name: "Netherlands • Qualifying", time: "2026-08-22T21:00:00+08:00" },
    { name: "Netherlands • Race", time: "2026-08-23T21:00:00+08:00" },
    { name: "Italy • Practice 1", time: "2026-09-04T19:30:00+08:00" },
    { name: "Italy • Practice 2", time: "2026-09-04T23:00:00+08:00" },
    { name: "Italy • Practice 3", time: "2026-09-05T18:30:00+08:00" },
    { name: "Italy • Qualifying", time: "2026-09-05T22:00:00+08:00" },
    { name: "Italy • Race", time: "2026-09-06T21:00:00+08:00" },
    { name: "Spain (Madrid) • Practice 1", time: "2026-09-11T19:30:00+08:00" },
    { name: "Spain (Madrid) • Practice 2", time: "2026-09-11T23:00:00+08:00" },
    { name: "Spain (Madrid) • Practice 3", time: "2026-09-12T18:30:00+08:00" },
    { name: "Spain (Madrid) • Qualifying", time: "2026-09-12T22:00:00+08:00" },
    { name: "Spain (Madrid) • Race", time: "2026-09-13T21:00:00+08:00" },
    { name: "Azerbaijan • Practice 1", time: "2026-09-24T17:30:00+08:00" },
    { name: "Azerbaijan • Practice 2", time: "2026-09-24T21:00:00+08:00" },
    { name: "Azerbaijan • Practice 3", time: "2026-09-25T16:30:00+08:00" },
    { name: "Azerbaijan • Qualifying", time: "2026-09-25T20:00:00+08:00" },
    { name: "Azerbaijan • Race", time: "2026-09-26T19:00:00+08:00" },
    { name: "Singapore • Practice 1", time: "2026-10-09T17:30:00+08:00" },
    { name: "Singapore • Sprint Quali", time: "2026-10-09T21:30:00+08:00" },
    { name: "Singapore • Sprint", time: "2026-10-10T17:30:00+08:00" },
    { name: "Singapore • Qualifying", time: "2026-10-10T21:00:00+08:00" },
    { name: "Singapore • Race", time: "2026-10-11T20:00:00+08:00" },
    { name: "United States • Practice 1", time: "2026-10-23T01:30:00+08:00" },
    { name: "United States • Practice 2", time: "2026-10-23T05:00:00+08:00" },
    { name: "United States • Practice 3", time: "2026-10-24T02:30:00+08:00" },
    { name: "United States • Qualifying", time: "2026-10-24T06:00:00+08:00" },
    { name: "United States • Race", time: "2026-10-26T03:00:00+08:00" },
    { name: "Mexico • Practice 1", time: "2026-10-31T02:30:00+08:00" },
    { name: "Mexico • Practice 2", time: "2026-10-31T06:00:00+08:00" },
    { name: "Mexico • Practice 3", time: "2026-11-01T01:30:00+08:00" },
    { name: "Mexico • Qualifying", time: "2026-11-01T05:00:00+08:00" },
    { name: "Mexico • Race", time: "2026-11-02T04:00:00+08:00" },
    { name: "Brazil • Practice 1", time: "2026-11-06T22:30:00+08:00" },
    { name: "Brazil • Practice 2", time: "2026-11-07T02:00:00+08:00" },
    { name: "Brazil • Practice 3", time: "2026-11-07T22:30:00+08:00" },
    { name: "Brazil • Qualifying", time: "2026-11-08T02:00:00+08:00" },
    { name: "Brazil • Race", time: "2026-11-09T01:00:00+08:00" },
    { name: "Las Vegas • Practice 1", time: "2026-11-20T10:30:00+08:00" },
    { name: "Las Vegas • Practice 2", time: "2026-11-20T14:00:00+08:00" },
    { name: "Las Vegas • Practice 3", time: "2026-11-21T10:30:00+08:00" },
    { name: "Las Vegas • Qualifying", time: "2026-11-21T14:00:00+08:00" },
    { name: "Las Vegas • Race", time: "2026-11-22T14:00:00+08:00" },
    { name: "Qatar • Practice 1", time: "2026-11-27T21:30:00+08:00" },
    { name: "Qatar • Practice 2", time: "2026-11-28T01:00:00+08:00" },
    { name: "Qatar • Practice 3", time: "2026-11-28T21:30:00+08:00" },
    { name: "Qatar • Qualifying", time: "2026-11-29T01:00:00+08:00" },
    { name: "Qatar • Race", time: "2026-11-30T01:00:00+08:00" },
    { name: "Abu Dhabi • Practice 1", time: "2026-12-04T17:30:00+08:00" },
    { name: "Abu Dhabi • Practice 2", time: "2026-12-04T21:00:00+08:00" },
    { name: "Abu Dhabi • Practice 3", time: "2026-12-05T18:30:00+08:00" },
    { name: "Abu Dhabi • Qualifying", time: "2026-12-05T22:00:00+08:00" },
    { name: "Abu Dhabi • Race", time: "2026-12-06T21:00:00+08:00" },
];

let currentEventIndex = 0;
let countdownInterval;

const cdEventName = document.getElementById('cd-event-name');
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins = document.getElementById('cd-mins');
const cdSecs = document.getElementById('cd-secs');
const prevEventBtn = document.getElementById('prev-event-btn');
const nextEventBtn = document.getElementById('next-event-btn');

if (cdEventName) {
    function getNextEventIndex() {
        const nowCheck = new Date().getTime();
        for (let i = 0; i < f1Events.length; i++) {
            // An event is considered "current or future" up to 2.5 hours after its start time
            const eventEndTime = new Date(f1Events[i].time).getTime() + (2.5 * 60 * 60 * 1000);

            if (eventEndTime > nowCheck) {
                return i;
            }
        }
        return f1Events.length - 1; // If all events ended, stay on the last one
    }

    currentEventIndex = getNextEventIndex();

    function updateCountdownUI() {
        const event = f1Events[currentEventIndex];
        cdEventName.textContent = event.name;

        clearInterval(countdownInterval);

        function tick() {
            const targetDate = new Date(event.time);
            const now = new Date();
            const diff = targetDate - now;

            if (diff <= 0) {
                // Event is currently happening. Wait 2.5 hours (9000000 ms) before advancing
                const eventEndTime = targetDate.getTime() + (2.5 * 60 * 60 * 1000);

                if (now.getTime() > eventEndTime) {
                    // Try to advance automatically once it's entirely over
                    const trueNextIndex = getNextEventIndex();
                    if (currentEventIndex < trueNextIndex) {
                        currentEventIndex = trueNextIndex;
                        updateCountdownUI();
                        return;
                    }
                }

                cdDays.textContent = '00';
                cdHours.textContent = '00';
                cdMins.textContent = '00';
                cdSecs.textContent = '00';
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / 1000 / 60) % 60);
            const s = Math.floor((diff / 1000) % 60);

            cdDays.textContent = d.toString().padStart(2, '0');
            cdHours.textContent = h.toString().padStart(2, '0');
            cdMins.textContent = m.toString().padStart(2, '0');
            cdSecs.textContent = s.toString().padStart(2, '0');
        }

        tick();
        countdownInterval = setInterval(tick, 1000);

        prevEventBtn.disabled = currentEventIndex === 0;
        nextEventBtn.disabled = currentEventIndex === f1Events.length - 1;

        prevEventBtn.style.opacity = currentEventIndex === 0 ? '0.5' : '1';
        prevEventBtn.style.cursor = currentEventIndex === 0 ? 'not-allowed' : 'pointer';

        nextEventBtn.style.opacity = currentEventIndex === f1Events.length - 1 ? '0.5' : '1';
        nextEventBtn.style.cursor = currentEventIndex === f1Events.length - 1 ? 'not-allowed' : 'pointer';
    }

    prevEventBtn?.addEventListener('click', () => {
        if (currentEventIndex > 0) {
            currentEventIndex--;
            updateCountdownUI();
        }
    });

    nextEventBtn?.addEventListener('click', () => {
        if (currentEventIndex < f1Events.length - 1) {
            currentEventIndex++;
            updateCountdownUI();
        }
    });

    updateCountdownUI();
}

// --- Feedback Logic ---
const feedbackToggle = document.getElementById('feedback-toggle');
const feedbackSidebar = document.getElementById('feedback-sidebar');
const feedbackForm = document.getElementById('feedback-form');
const feedbackMessage = document.getElementById('feedback-message');

if (feedbackToggle && feedbackSidebar) {
    feedbackToggle.addEventListener('click', () => {
        feedbackSidebar.classList.toggle('open');
    });
}

if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('feedback-text').value.trim();
        
        if (text) {
            const formData = new FormData();
            formData.append('feedback', text);
            
            fetch('feedback.php', {
                method: 'POST',
                body: formData
            }).catch(e => console.error('Feedback error:', e));

            // Show success message
            feedbackForm.style.display = 'none';
            feedbackMessage.style.display = 'block';
            
            // Auto close after 2 seconds
            setTimeout(() => {
                feedbackSidebar.classList.remove('open');
                
                // Reset form after animation
                setTimeout(() => {
                    feedbackForm.style.display = 'flex';
                    feedbackMessage.style.display = 'none';
                    document.getElementById('feedback-text').value = '';
                }, 300);
            }, 2000);
        }
    });
}
