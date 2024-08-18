
var format = '24h';
const app = {
    db: null,
    showDb: null,
    info_timer: 0,
    wallpaper_timer: 0,
    adzan_timer: 0,
    sholat_timer: 0,
    khutbah_jumat: 0,
    sholat_tarawih: 0,
    logo: '',
    wallpaper: '',

    initialize: function() {
        this.loadDatabase()
            .then(() => {
                this.processData();
                this.loadLogo();
                this.loadWallpaper();
                this.updateDOM();
            })
            .catch(error => {
                console.error('Failed to initialize app:', error);
                document.body.innerHTML = "<h1>Jalankan admin terlebih dahulu</h1>";
            });
    },

    loadDatabase: function() {
        return fetch('../db/database.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                this.db = data;
                this.showDb = {...this.db};
                delete this.showDb.akses;
            });
    },

    processData: function() {
        this.info_timer = this.db.timer.info * 1000;
        this.wallpaper_timer = this.db.timer.wallpaper * 1000;
        this.adzan_timer = this.db.timer.adzan * 1000 * 60;
        this.sholat_timer = this.db.timer.sholat * 1000 * 60;
        this.khutbah_jumat = this.db.jumat.duration * 1000 * 60;
        this.sholat_tarawih = this.db.tarawih.duration * 1000 * 60;
    },

    loadLogo: function() {
        fetch('logo/')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(data, 'text/html');
                const files = Array.from(htmlDoc.querySelectorAll('a'))
                    .map(a => a.getAttribute('href'))
                    .filter(file => file !== '..' && file !== '.' && file !== 'Thumbs.db');
                this.logo = files[0];
            });
    },

    loadWallpaper: function() {
        fetch('wallpaper/')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(data, 'text/html');
                const files = Array.from(htmlDoc.querySelectorAll('a'))
                    .map(a => a.getAttribute('href'))
                    .filter(file => file !== '..' && file !== '.' && file !== 'Thumbs.db');
                
                this.wallpaper = files.map((file, index) => 
                    `<div class="item slides ${index === 0 ? 'active' : ''}">
                        <div style="background-image: url(wallpaper/${file});"></div>
                    </div>`
                ).join('');
            });
    },

    updateDOM: function() {
        // Update your HTML elements here
        document.querySelector('.carousel-inner').innerHTML = this.wallpaper;
        // ... other DOM updates ...
    }

};

document.addEventListener('DOMContentLoaded', () => app.initialize());