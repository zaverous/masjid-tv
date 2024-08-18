import { Session, Feedback } from "./session.js";


if (!Session.getSessionItem("user_id")) {
    window.location.href = "login.html";
}

let db; // definisikan global variable utk db

$.ajax({
    url: 'database.json',
    method: 'GET',
    dataType: 'json',
    async: false, // buat agar request synchronous
    success: function (data) {
        db = data; // simpan data ke global var
        console.log('udah ada ni di global', db);
    },
    error: function (xhr, status, error) {
        console.error('There was a problem with the AJAX request:', error);
    }
});

// db siap dioperasikan utk kalkulasi waktu, set value, dst

console.log('Global DB:', db);
