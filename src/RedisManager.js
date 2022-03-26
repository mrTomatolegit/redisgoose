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

    async del(...keys) {
        return new Promise((res, rej) => {
            this.client.client.unlink(...keys.map(x => `${this.client.prefix}${x}`), (err, x) => {
                if (err) return rej(err);
                return res(x);
            });
        });
    }

    async clear() {
        return new Promise((res, rej) => {
            this.client.client.keys(`${this.client.prefix}*`, (err, data) => {
                if (err) return rej(err);
                if (data.length > 0) {
                    this.client.client.unlink(...data, (err, count) => {
                        if (err) return rej(err);
                        res(count);
                    });
                } else res();
            });
        });
    }

    disconnect(flush = false) {
        this.client.client.end(flush);
    }
}

module.exports = RedisManager;
