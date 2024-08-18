import { Session, Feedback } from "./session.js";
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (Session.getSessionItem("user_id")) {
        window.location.href = "index.html";
    }

    // Fetch and display masjid name
    fetch('db/database.json')
        .then(response => response.json())
        .then(data => {
            const name = data.setting.nama;
            document.getElementById('masjidName').textContent = name;
        })
        .catch(error => console.error('Error:', error));

    // Handle form submission
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const btn = this.querySelector('button.btn-primary');
        const btnText = btn.innerHTML;
        btn.innerHTML = '<i class="fa fa-spinner fa-pulse"></i> loading...';
        btn.disabled = true;

        const formData = new FormData(this);
        const data = {
            id: 'login',
            dt: {
                user: formData.get('user'),
                pass: formData.get('pass')
            }
        };

        fetch('proses.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(dt => {
            if (dt.registered) {
                Session.setSessionItem("user_id", dt.user); // Assuming the response includes a user_id
                window.location.reload();
            } else {
                alert(dt.data);
                document.getElementById('pass').value = '';
                document.getElementById('pass').focus();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("An error occurred. Please try again.");
        })
        .finally(() => {
            btn.innerHTML = btnText;
            btn.disabled = false;
        });
    });
});