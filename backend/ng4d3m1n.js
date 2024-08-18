import { Session, Feedback } from './session.js';

document.addEventListener('DOMContentLoaded', function() {
    const session = new Session();

    // Check if user is logged in
    if (!session.getSessionItem("user_id")) {
        window.location.href = "login.html";
    }

    // Fetch and display masjid name
    fetchMasjidName();

    // Handle sidebar navigation
    setupNavigation();

    // Load initial content (info)
    loadContent('info');
});

function fetchMasjidName() {
    fetch('db/database.json')
        .then(response => response.json())
        .then(data => {
            const name = data.setting.nama;
            document.getElementById('masjidName').textContent = name + " - Admin display";
        })
        .catch(error => console.error('Error:', error));
}

function setupNavigation() {
    document.querySelectorAll('.sidebar-menu a[data-target]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            if (target === 'logout') {
                handleLogout();
            } else {
                loadContent(target);
            }
        });
    });
}

function handleLogout() {
    const session = new Session();
    session.clearSession();
    window.location.href = "login.html";
}

function loadContent(target) {
    console.log("Loading content for:", target);
    // Here you would typically fetch content from the server
    // This is where you might use the Feedback class
    fetchContentFromServer(target);
}

function fetchContentFromServer(target) {
    const feedback = new Feedback();
    const session = new Session();
    const userId = session.getSessionItem("user_id");

    // Simulate an API call
    fetch(`api/content/${target}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId })
    })
    .then(response => response.json())
    .then(data => {
        // Use the Feedback class to handle the response
        if (feedback.verification(target, data)) {
            // If verification passes, process the data
            const result = feedback.retSuccess();
            if (result.success) {
                // Update the content
                document.getElementById('container').innerHTML = data.content;
            } else {
                console.error("Error loading content:", result.data);
            }
        } else {
            // Handle verification failure (e.g., user not logged in)
            const result = feedback.writeFeedBack();
            if (!result.registered) {
                window.location.href = "login.html";
            } else {
                console.error("Error:", result.data);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        feedback.retError("Failed to fetch content");
    });
}