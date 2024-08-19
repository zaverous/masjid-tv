$(document).ready(function () {
    // Check if there's an active session
    if (localStorage.getItem('loggedIn') === 'true') {
        // If already logged in, redirect to index.html
        window.location.href = 'index.html';
    }

    // Load the database.json file using jQuery's AJAX method
    $.getJSON('db/database.json', function(data) {
        // Optionally, set the masjid name dynamically from the JSON data
        $('#masjidName').text(data.setting.nama);

        // When the form is submitted
        $('#loginForm').on('submit', function (e) {
            e.preventDefault(); // Prevent the default form submission
            
            // Get the input values
            var username = $('input[name="user"]').val();
            var password = $('input[name="pass"]').val();

            // Access the stored credentials from the JSON data
            var storedUser = data.akses.user;
            var storedPass = data.akses.pass;

            // Check if the input credentials match the stored credentials
            if (username === storedUser && password === storedPass) {
                // If they match, set the session in localStorage
                localStorage.setItem('loggedIn', 'true');
                
                // Redirect to index.html instead of reloading
                window.location.href = 'index.html';
            } else {
                // If they don't match, show an error message
                alert('Invalid username or password. Please try again.');
            }
        });
    });
});
