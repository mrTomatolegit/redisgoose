class RedisManager {
    constructor(cacheman) {
        this.client = cacheman;
    }

    async get(key) {
        return new Promise((res, rej) => {
            this.client.get(key, (err, data) => {
                if (err) return rej(err);
                if (data === '') return res(null);
                if (data) return res(data);
                res();
            });
        });
    }

    async set(key, value, ttl) {
        return new Promise((res, rej) => {
            if (value === null) value = '';
            this.client.set(key, value, ttl, err => {
                if (err) return rej(err);
                return res();
            });
        });
    }

    async del(key) {
        return new Promise((res, rej) => {
            this.client.del(key, err => {
                if (err) return rej(err);
                return res();
            });
        });
    }

    async clear() {
        return new Promise((res, rej) => {
            this.client.clear(err => {
                if (err) return rej(err);
                return res();
            });
        });
    }
}

module.exports = RedisManager;
