const redisgoose = require('../');
const mongoose = require('mongoose');
const { expect, test, beforeAll, afterAll } = require('@jest/globals');
redisgoose();

const Sample = mongoose.model('sample', new mongoose.Schema({ name: String }));

beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1/test');
    await Sample.create({ name: 'test' });
});

afterAll(async () => {
    await mongoose.disconnect();
    await redisgoose.clearCache();
    redisgoose.redisManager.disconnect();
});

test('Clear test', async () => {
    for (let i = 0; i < 100; i++) {
        await redisgoose.redisManager.set(i, i, 20);
    }
    expect(await redisgoose.clearCache()).toBe(100);
});

test('Basic test', async () => {
    const q = { name: 'test' };

    const r1 = await Sample.findOne(q).cache(20, Sample.makeCacheKey(q));
    expect(r1).not.toBeNull();
    const count = await redisgoose.clearCache(Sample.makeCacheKey(q));
    expect(count).toBe(1);
});

test('MakeCacheKey', () => {
    const makeCacheKey = Sample.makeCacheKey.bind(Sample);

    let strings = [
        makeCacheKey('test', 'nice'),
        makeCacheKey('test=nice'),
        makeCacheKey({ test: 'nice' }),
        makeCacheKey({ test: { foo: 'nice', wee: 'waa' } }),
        makeCacheKey(['test=nice', 'foo=bar', ['fer=baz']]),
        makeCacheKey(['test=nice', 'foo=bar', ['fer=baz']]),
        makeCacheKey({
            string: 'foo',
            array: ['foo', { foo: 'foo' }],
            int: 1,
            bool: true,
            obj: { arr: ['a=2'], x: 'x' }
        })
    ];

    console.log(strings.join('\n'));
});
