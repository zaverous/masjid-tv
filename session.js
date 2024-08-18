// session.js

class Session {
    constructor() {
        this.sessName = this.md5("displayMasjid");
        this.initSession();
    }

    initSession() {
        if (!this.getSession()) {
            this.startSession();
        }
    }

    startSession() {
        localStorage.setItem(this.sessName, JSON.stringify({}));
    }

    getSession() {
        return JSON.parse(localStorage.getItem(this.sessName));
    }

    setSessionItem(key, value) {
        let session = this.getSession();
        session[key] = value;
        localStorage.setItem(this.sessName, JSON.stringify(session));
    }

    getSessionItem(key) {
        let session = this.getSession();
        return session[key];
    }

    removeSessionItem(key) {
        let session = this.getSession();
        delete session[key];
        localStorage.setItem(this.sessName, JSON.stringify(session));
    }

    clearSession() {
        localStorage.removeItem(this.sessName);
    }

    // Simple MD5 implementation (for demonstration purposes only)
    md5(string) {
        // In a real application, use a proper cryptographic library
        // This is a placeholder and NOT secure
        return btoa(string); // Base64 encoding as a simple stand-in
    }
}

class Feedback {
    constructor() {
        this.success = true;
        this.registered = true;
        this.data = null;
    }

    writeFeedBack() {
        return {
            success: this.success,
            registered: this.registered,
            data: this.data
        };
    }

    retSuccess() {
        return this.writeFeedBack();
    }

    retError(err) {
        this.success = false;
        this.data = err;
        return this.writeFeedBack();
    }

    verification(id, dt) {
        const session = new Session();
        if (!session.getSessionItem("user_id")) {
            this.registered = false;
            return this.writeFeedBack();
        } else if (typeof this[id] === 'function') {
            this.id = id;
            this.dt = dt || "";
            return true;
        } else {
            this.success = false;
            this.data = "Request tidak ditemukan...";
            return this.writeFeedBack();
        }
    }
}

// Export the classes if using ES6 modules
export { Session, Feedback };