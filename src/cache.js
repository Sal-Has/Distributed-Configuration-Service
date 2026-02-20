const Redis = require('ioredis');

let redisClient;

function getClient() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    redisClient = new Redis(redisUrl);

    redisClient.on('error', (err) => {
      console.error('Redis error:', err.message || err);
    });
  }

  return redisClient;
}

function buildKey(env, key) {
  return `${env}:${key}`;
}

async function getConfigFromCache(env, key) {
  const client = getClient();
  const cacheKey = buildKey(env, key);
  const cached = await client.get(cacheKey);
  if (!cached) return null;

  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

async function setConfigInCache(env, key, valueObj, ttlSeconds = 300) {
  const client = getClient();
  const cacheKey = buildKey(env, key);
  const payload = JSON.stringify(valueObj);

  if (ttlSeconds && ttlSeconds > 0) {
    await client.set(cacheKey, payload, 'EX', ttlSeconds);
  } else {
    await client.set(cacheKey, payload);
  }
}

async function deleteConfigFromCache(env, key) {
  const client = getClient();
  const cacheKey = buildKey(env, key);
  await client.del(cacheKey);
}

module.exports = {
  getConfigFromCache,
  setConfigInCache,
  deleteConfigFromCache,
};