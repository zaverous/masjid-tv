// Global variables and configurations
var lat, lng, timeZone, dst;
var prayTimesAdjust, prayTimesTune;
var format = '24h';



// Load JSON Data
fetch('../db/database.json')
    .then(response => {
        if (!response.ok) {
            throw new Error("Jalankan admin terlebih dahulu");
        }
        return response.json();

    })
    .then(db => {
        // Process timers
        const info_timer = db.timer.info * 1000; // milliseconds
        const wallpaper_timer = db.timer.wallpaper * 1000;
        const adzan_timer = db.timer.adzan * 1000 * 60; // minutes
        const sholat_timer = db.timer.sholat * 1000 * 60;

        // Optional timers
        const khutbah_jumat = db.jumat.duration * 1000 * 60;
        const sholat_tarawih = db.tarawih.duration * 1000 * 60;

        // Handle logos
        const dirLogo = 'logo/';
        fetch(dirLogo) // assuming you're serving files through an API or other mechanism
            .then(response => response.json()) // you'd need to handle file listing in another way
            .then(files => {
                const filesLogo = files.filter(file => !['.', '..', 'Thumbs.db'].includes(file));
                const logo = filesLogo[0];
                console.log("Logo:", logo);
            });
    })
    .then(data => {
                    // Set global variables
            lat = data.setting.latitude;
            lng = data.setting.longitude;
            timeZone = data.setting.timeZone;
            dst = data.setting.dst;

            // Set pray times adjustments and tuning
            if (data.prayTimesMethod === '0') {
                prayTimesAdjust = data.prayTimesAdjust;
                prayTimes.adjust(prayTimesAdjust);
            } else {
                prayTimes.setMethod(data.prayTimesMethod);
            }

            prayTimesTune = data.prayTimesTune;
            if (Object.keys(prayTimesTune).length > 0) {
                prayTimes.tune(prayTimesTune);
            }

            // Initialize app
            app.initialize(data);
    })
    .catch(error => {
        document.body.innerHTML = `<h1>${error.message}</h1>`;
    });

//PrayTimes initialize
var format = '24h';

//Baris ini ke bawah jika inget nanti pindah ke file terpisah biar rapi......
var app = {
    db : null,
    cekDb: false,
    tglHariIni: '',
    tglBesok: '',
    jadwalHariIni: {},
    jadwalBesok: {},
    timer: false,
    // waitAdzanTimer	: false,	// Display countdown sebelum adzan
    adzanTimer: false, // Display adzan
    countDownTimer: false, // Display countdown iqomah
    sholatTimer: false, // Display sholat
    khutbahTimer: false, // Display khutbah
    nextPrayCount: 0, // start next pray count-down
    // nextPrayTimer	: false,	// Display countdown ke sholat selanjutnya
    fajr: '',
    sunrise: '',
    dhuhr: '',
    asr: '',
    maghrib: '',
    isha: '',
    audio: new Audio('img/beep.mp3'),
    initialize: function() {
        app.timer = setInterval(function() {
            app.cekPerDetik()
        }, 1000);
        $('#preloader').delay(350).fadeOut('slow');
        // console.log(app.db);
        // let testTime	= moment().add(8,'seconds');
        // app.runRightCountDown(testTime,'Menuju Syuruq');
        // app.runFullCountDown(testTime,'iqomah',true);
        // app.runFullCountDown(testTime,'TEST COUNTER',false);
        // app.showDisplayAdzan('sunrise');
        // app.showDisplayKhutbah();
    },
    cekPerDetik: function() {
        if (!app.tglHariIni || moment().format('YYYY-MM-DD') != moment(app.tglHariIni).format('YYYY-MM-DD')) {
            app.tglHariIni = moment();
            app.tglBesok = moment().add(1, 'days');
            app.jadwalHariIni = app.getJadwal(moment(app.tglHariIni).toDate());
            app.jadwalBesok = app.getJadwal(moment(app.tglBesok).toDate());
            app.fajr = moment(app.jadwalHariIni.fajr, 'HH:mm');
            app.sunrise = moment(app.jadwalHariIni.sunrise, 'HH:mm');
            app.dhuhr = moment(app.jadwalHariIni.dhuhr, 'HH:mm');
            app.asr = moment(app.jadwalHariIni.asr, 'HH:mm');
            app.maghrib = moment(app.jadwalHariIni.maghrib, 'HH:mm');
            app.isha = moment(app.jadwalHariIni.isha, 'HH:mm');
        }
        app.showJadwal();
        app.displaySchedule();
        // app.countDownNextPray();
        // app.showCountDownNextPray();
        // app.runRightCountDown(app.dhuhr,'Fajr');

        $.ajax({
            type: "POST",
            url: "../proses.php",
            dataType: "json",
            data: {
                id: 'changeDbCheck'
            }
        }).done(function(dt) {
            // console.log(dt.data);
            if (app.cekDb == false) {
                app.cekDb = dt.data;
            } else if (app.cekDb !== dt.data) {
                // reload page
                location.reload();
            }
        }).fail(function(msg) {
            console.log(msg);
        });
        //  console.log('interval-1000');
    },
    getJadwal: function(jadwalDate) {
        let times = prayTimes.getTimes(jadwalDate, [lat, lng], timeZone, dst, format);
        //console.log(times)
        return times;
    },
    showJadwal: function() {
        // console.log(app.db.prayName)
        let jamSekarang = moment()
        //console.log(jamSekarang)

        // let jamSekarang = moment();

        //+5 menit baru berubah yang aktif (misal sekarang jam dzuhur, di jadwal setelah 5 menit baru berubah yang ashar yang aktif)
        let jamDelay = moment().subtract(5, 'minutes');
        let jadwal = '';
        let hari = app.db.dayName[jamSekarang.format("dddd")]; //pastikan moment js pake standart inggris (default) ==> jangan pindah locale
        let bulan = app.db.monthName[jamSekarang.format("MMMM")];

        // $('#tgl').html(moment().format("dddd, DD MMMM YYYY"));
        $('#jam').html(jamSekarang.format("HH.mm.ss"));
        $('#tgl').html(jamSekarang.format(" DD [" + bulan + "] YYYY"));
        $('#hari').html(jamSekarang.format("[" + hari + "]"));

        if ($('.full-screen').is(":visible")) {
            $('#full-screen-clock').html(jamSekarang.format("[<i class='fa fa-clock-o''></i>&nbsp;&nbsp;]HH:mm"));
            $('#full-screen-clock').slideDown();
            console.log('show');
        } else $('#full-screen-clock').slideUp();

        let jadwalDipake = app.jadwalHariIni;
        let jadwalPlusIcon = '';
        //jika diatasa isya' pake jadwal besok

        // console.log(jamSekarang.format('YYYY-MM-DD HH:mm:ss'));
        if (jamDelay > app.isha) {
            jadwalDipakeapp = app.jadwalBesok;
            jadwalPlusIcon = '<span><i class="fa fa-plus" aria-hidden="true"></i></span>';
            // console.log('besok');
        }
        $.each(app.db.prayName, function(k, v) {
            // console.log(jamDelay.format('YYYY-MM-DD HH:mm:ss'));
            // console.log(app.db.PrayName)
            //console.log({ k, v, app })
            let css = '';
            if (k == 'isha' && jamDelay < app.isha && jamDelay > app.maghrib) css = 'active';
            else if (k == 'maghrib' && jamDelay < app.maghrib && jamDelay > app.asr) css = 'active';
            else if (k == 'asr' && jamDelay < app.asr && jamDelay > app.dhuhr) css = 'active';
            else if (k == 'dhuhr' && jamDelay < app.dhuhr && jamDelay > app.fajr) css = 'active';
            else if (k == 'sunrise' && jamDelay < app.sunrise && jamDelay > app.sunrise) css = 'active';
            else if (k == 'fajr' && (jamDelay < app.fajr || jamDelay > app.isha)) css = 'active'; //diatas isha dan sebelum subuh (beda hari)
            jadwal += '<div class=" col ' + css + '"><div class="row-xs-5">' + v + '</div><div class="row-xs-7">' + jadwalDipake[k] + jadwalPlusIcon + '</div></div>';
        });
        $('#jadwal').html(jadwal);
    },
    displaySchedule: function() {
        // console.log(app.getNextPray());
        let waitAdzan = moment().add(app.db.timer.wait_adzan, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        let jamSekarang = moment().format('YYYY-MM-DD HH:mm:ss');
        let limaMenitKeAdzan = moment().add(5,"minutes").format('YYYY-MM-DD HH:mm:ss');

        // console.log(moment().add(5,'days').format('dddd'));
        // console.log(waitAdzan);
        // console.log(app.dhuhr.format('YYYY-MM-DD HH:mm:ss'));

        $.each(app.db.prayName, function(k, v) {
            //Normal 	: waitAdzanCountDown-adzan-iqomah-sholat-nextPrayCountDown
            //jumat 	: waitAdzanCountDown-adzan-khutbah-sholat-nextPrayCountDown
            //tarawih 	: waitAdzanCountDown-adzan-iqomah-sholat-isya-Tarawih(hanya durasi tarawih)-nextPrayCountDown

            let t = moment(app[k]); //bikin variable baru t ==> jika ditulis let t	= app[k]; ==> jika di tambah / kurang, variable app[k] ikut berubah
            let jadwal = t.format('YYYY-MM-DD HH:mm:ss');
            let stIqomah = t.add(app.db.timer.adzan, 'minutes').format('YYYY-MM-DD HH:mm:ss');
            let enIqomah = moment(stIqomah, 'YYYY-MM-DD HH:mm:ss').add(app.db.iqomah[k], 'minutes')

            //console.log('jadwal-------------- '+jadwal);
            //console.log('Now-------------- '+jamSekarang);
            // console.log('time '+v+' : '+jadwal);
            // console.log('waitAdzan '+v+' : '+waitAdzan);
            // console.log('st iqomah '+v+' : '+stIqomah);
            // console.log('en iqomah '+v+' : '+enIqomah.format('YYYY-MM-DD HH:mm:ss'));
            if (waitAdzan == jadwal) app.runRightCountDown(app[k], 'Menuju ' + v); // CountDown sebelum adzan
            else if (limaMenitKeAdzan == jadwal) app.countDownNextPray();
            else if (jadwal == jamSekarang) app.showDisplayAdzan(v); // Display adzan
            else if (stIqomah == jamSekarang) {
                if (moment().format('dddd') == 'Friday' && app.db.jumat.active && k == 'dhuhr') {
                    //jumatan aktif skip iqomah --> waitAdzanCountDown-adzan-khutbah-sholat-nextPrayCountDown
                    app.showDisplayKhutbah();
                } else
                    app.runFullCountDown(enIqomah, 'IQOMAH', true); // CountDown iqomah
            }
        });
        //let jamSekarang = moment().add(5, 'minutes');
        //if (!app.countDownTimer) {
        //	app.runFullCountDown(jamSekarang, 'IQOMAH');
        //}
    },
    
    getNextPray: function() {
        let jamSekarang = moment();
        let nextPray = 'fajr';
        let jadwalDipake = false;
        if (jamSekarang > app.isha) {
            jadwalDipake = moment(app.jadwalBesok[nextPray], 'HH:mm').add(1, 'Day');
            //console.log('jadwal besok');
        } else {
            $.each(app.db.prayName, function(k, v) {
                if (jamSekarang < app[k]) {
                    nextPray = k;
                    return false;
                }
            });
            jadwalDipake = moment(app.jadwalHariIni[nextPray], 'HH:mm');
        }
        // console.log(jadwalDipake);
        return {
            'pray': nextPray,
            'date': jadwalDipake
        };
    },
    showCountDownNextPray: function() {
        // $('#right-counter').html();
        let nextPray = app.getNextPray();
        if (app.countDownTimer) return; //timer masih jalan
        app.nextPrayCount = 0;
        //console.log(moment(nextPray['date']).format('YYYY-MM-DD HH:mm:ss'));
        app.countDownTimer = setInterval(function() {
            let t = app.countDownCalculate(nextPray.date);
            $('#right-counter .counter>h1').html('Menuju ' + app.db.prayName[nextPray.pray]);
            $('#right-counter .counter>.hh').html(t.hours + '<span>' + app.db.timeName.Hours + '</span>');
            $('#right-counter .counter>.ii').html(t.minutes + '<span>' + app.db.timeName.Minutes + '</span>');
            $('#right-counter .counter>.ss').html(t.seconds + '<span>' + app.db.timeName.Seconds + '</span>');

            $('#right-counter').slideDown();
            $('#quote').hide();        
            $('#countdown').hide();         // removing the countdown row so it would not cover the countdown 

            app.nextPrayCount++;
            if (app.nextPrayCount >= 30) { // 30 detik show counter
                clearInterval(app.countDownTimer);
                app.countDownTimer = false;
                $('#right-counter').fadeOut();
                $('#quote').fadeIn();          
                $('#countdown').fadeIn();      // putting it back after the timer ended
                // document.getElementById("demo").innerHTML = "EXPIRED";
            }
        }, 1000);
    },
    countDownNextPray: function() {
        // this function is a copy of the showCountDownNextPray for the row #countdown in a format of HH:mm:ss
        let nextPray = app.getNextPray();
        if (app.countDownTimer) return; //timer masih jalan
        app.nextPrayCount = 0;
        //console.log(moment(nextPray['date']).format('YYYY-MM-DD HH:mm:ss'));
        app.countDownTimer = setInterval(function() {
            let t = app.countDownCalculate(nextPray.date);
            $('#countdown .counter>.h1').html(app.db.prayName[nextPray.pray] );
            // $('#countdown .counter>.hh').html(t.hours + '<span>' + app.db.timeName.Hours + '</span>');
            // $('#countdown .counter>.ii').html(t.minutes + '<span>' + app.db.timeName.Minutes + '</span>');
            // $('#countdown .counter>.ss').html(t.seconds + '<span>' + app.db.timeName.Seconds + '</span>');
            $('#countdown .counter>.hhiiss').html(t.hours + ":" + t.minutes + ":" + t.seconds);

            $('#countdown').slideDown();

            app.nextPrayCount++;
            if (app.nextPrayCount >= 30) { // 30 detik show counter
                clearInterval(app.countDownTimer);
                app.countDownTimer = false;
                // $('#countdown').fadeOut();      // putting it back after the timer ended
                // document.getElementById("demo").innerHTML = "EXPIRED";
            }
            if (t.distance < 1) {
                $('#countdown').fadeOut();      // putting it back after the timer ended
            }
            
            
        }, 1000);
    },
    
    showDisplayAdzan: function(prayName) {
        if (!app.adzanTimer) {
            prayName = (prayName == 'sunrise') ? 'Waktu Syuruq' : prayName;
            $('#display-adzan>div').text(prayName);
            $('#display-adzan').show();
            app.adzanTimer = setTimeout(function() {
                $('#display-adzan').fadeOut();
                app.adzanTimer = false;
            }, (app.db.timer.adzan * 60 * 1000) + 1500); // to menit + 1.5 detik (remove jeda dengan iqomah)
        }
    },
    showDisplayKhutbah: function() {
        if (!app.khutbahTimer) {
            $('#display-khutbah>div').text(app.db.jumat.text);
            $('#display-khutbah').show();
            app.khutbahTimer = setTimeout(function() {
                app.khutbahTimer = false;
                app.showDisplaySholat();
                $('#display-khutbah').fadeOut();
            }, app.db.jumat.duration * 60 * 1000); // to menit
        }
    },
    showDisplaySholat: function() {
        if (!app.khutbahTimer) {
            //cek tarawih
            let jamSekarang = moment();
            let duration = (jamSekarang > app.isha && app.db.tarawih.active) ? app.db.tarawih.duration : app.db.timer.sholat;
            $('#display-sholat').show();
            app.khutbahTimer = setTimeout(function() {
                $('#display-sholat').fadeOut();
                app.khutbahTimer = false;
                app.showCountDownNextPray();
            }, duration * 60 * 1000); // to menit
        }
    },
    runFullCountDown: function(jam, title, runDisplaySholat) {
        // clearInterval(app.countDownTimer);
        if (app.countDownTimer) return; //timer masih jalan
        app.countDownTimer = setInterval(function() {
            let t = app.countDownCalculate(jam);

            $('#count-down .counter>h1').html(title);
            $('#count-down .counter>.hh').html(t.hours + '<span>' + app.db.timeName.Hours + '</span>');
            $('#count-down .counter>.ii').html(t.minutes + '<span>' + app.db.timeName.Minutes + '</span>');
            $('#count-down .counter>.ss').html(t.seconds + '<span>' + app.db.timeName.Seconds + '</span>');

            $('#count-down').fadeIn();
            if (t.distance == 5) {
                app.audio.play().then(() => {
                    // already allowed
                }).catch((e) => {
                    console.log('Agar beep bunyi ==> permission chrome : sound harus enable');
                    console.log(e);
                });
                // audio.play();
            }
            if (t.distance < 1) {
                clearInterval(app.countDownTimer);
                app.countDownTimer = false;
                $('#count-down').fadeOut();
                if (runDisplaySholat) {
                    app.showDisplaySholat();
                }
                // document.getElementById("demo").innerHTML = "EXPIRED";
            }
        }, 1000);
    },
    runRightCountDown: function(jam, title) {
        // $('#right-counter').html();
        if (app.countDownTimer) return; //timer masih jalan
        app.countDownTimer = setInterval(function() {

            let t = app.countDownCalculate(jam);
            $('#right-counter .counter>h1').html(title);
            $('#right-counter .counter>.hh').html(t.hours + '<span>' + app.db.timeName.Hours + '</span>');
            $('#right-counter .counter>.ii').html(t.minutes + '<span>' + app.db.timeName.Minutes + '</span>');
            $('#right-counter .counter>.ss').html(t.seconds + '<span>' + app.db.timeName.Seconds + '</span>');
            $('#right-counter').slideDown();
            $('#quote').hide();        
            $('#countdown').hide();         // removing the countdown row so it would not cover the countdown to adzan

            if (t.distance < 1) {
                clearInterval(app.countDownTimer);
                app.countDownTimer = false;
                $('#quote').fadeIn();          
                $('#right-counter').fadeOut();
                $('#countdown').fadeIn();  // putting it back after the timer ended
                // document.getElementById("demo").innerHTML = "EXPIRED";
            }
        }, 1000);
    },
    countDownCalculate(jam) {
        let jamSekarang = moment(); //.subtract(2,'seconds');
        // console.log(jam.format('YYYY-MM-DD HH:mm:ss SSS'));
        // console.log(jamSekarang.format('YYYY-MM-DD HH:mm:ss SSS'));
        // --> jam.diff(jamSekarang, 'seconds') --> convert integer tanpa pembulatan (pembulatan ke bawah)
        let distance = Math.round(jam.diff(jamSekarang, 'seconds', true));
        // console.log(distance);
        let hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60));
        let minutes = Math.floor((distance % (60 * 60)) / 60);
        let seconds = Math.floor((distance % 60));
        hours = (hours >= 0 && hours < 10) ? '0' + hours : hours;
        minutes = (minutes >= 0 && minutes < 10) ? '0' + minutes : minutes;
        seconds = (seconds >= 0 && seconds < 10) ? '0' + seconds : seconds;
        // console.log(hours);
        return {
            'distance': distance,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }
} ;
document.addEventListener('DOMContentLoaded', loadInitialData);
