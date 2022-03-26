const redisgoose = require('../');
const mongoose = require('mongoose');
const { test, beforeAll, afterAll } = require('@jest/globals');

const Sample = mongoose.model('sample', new mongoose.Schema({ name: String }));

beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1/test');
});

afterAll(async () => {
    await mongoose.disconnect();
    await redisgoose.clearCache();
});

test('Basic NoInit', async () => {
    const q = { name: 'test' };

    const r1 = await Sample.findOne(q).cache(1000, Sample.makeCacheKey(q));
    if (!r1) await Sample.create(q);

    await Sample.findOne(q).cache(1000, Sample.makeCacheKey(q));
    redisgoose.clearCache(Sample.makeCacheKey(q));
});
