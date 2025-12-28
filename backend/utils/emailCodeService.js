const { redisClient } = require('../config/redis');

const CODE_TTL_SECONDS = parseInt(process.env.EMAIL_CODE_TTL || '600', 10); // 默认10分钟
const RESEND_INTERVAL_SECONDS = parseInt(process.env.EMAIL_CODE_RESEND_INTERVAL || '60', 10); // 默认60秒
const KEY_PREFIX = 'email:code';
const memoryStore = new Map();

const normalizeEmail = (email = '') => email.trim().toLowerCase();
const buildKey = (scene, email) => `${KEY_PREFIX}:${scene}:${normalizeEmail(email)}`;
const isRedisReady = () => Boolean(redisClient && redisClient.isOpen);

const scheduleMemoryCleanup = (key) => {
  setTimeout(() => memoryStore.delete(key), CODE_TTL_SECONDS * 1000).unref?.();
};

const getRecord = async (email, scene) => {
  const key = buildKey(scene, email);

  if (isRedisReady()) {
    try {
      const raw = await redisClient.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Redis get email code失败，使用内存缓存:', error.message);
    }
  }

  const record = memoryStore.get(key);
  if (!record) return null;

  if (record.expiresAt <= Date.now()) {
    memoryStore.delete(key);
    return null;
  }

  return record;
};

const storeRecord = async (email, scene, code) => {
  const key = buildKey(scene, email);
  const record = {
    code,
    scene,
    email: normalizeEmail(email),
    sentAt: Date.now(),
    expiresAt: Date.now() + CODE_TTL_SECONDS * 1000
  };

  if (isRedisReady()) {
    try {
      await redisClient.set(key, JSON.stringify(record), { EX: CODE_TTL_SECONDS });
      return record;
    } catch (error) {
      console.warn('Redis set email code失败，回退到内存缓存:', error.message);
    }
  }

  memoryStore.set(key, record);
  scheduleMemoryCleanup(key);
  return record;
};

const deleteRecord = async (email, scene) => {
  const key = buildKey(scene, email);

  if (isRedisReady()) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.warn('Redis删除email code失败:', error.message);
    }
  }

  memoryStore.delete(key);
};

const canSendCode = async (email, scene) => {
  const record = await getRecord(email, scene);

  if (!record) {
    return { allowed: true, retryAfter: 0 };
  }

  const elapsedSeconds = (Date.now() - record.sentAt) / 1000;
  if (elapsedSeconds < RESEND_INTERVAL_SECONDS) {
    return {
      allowed: false,
      retryAfter: Math.ceil(RESEND_INTERVAL_SECONDS - elapsedSeconds)
    };
  }

  return { allowed: true, retryAfter: 0 };
};

const verifyEmailCode = async (email, scene, code) => {
  const record = await getRecord(email, scene);

  if (!record) {
    return { valid: false, reason: '验证码已失效，请重新获取' };
  }

  if (record.code !== code) {
    return { valid: false, reason: '验证码不正确' };
  }

  await deleteRecord(email, scene);
  return { valid: true };
};

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

module.exports = {
  generateVerificationCode,
  canSendCode,
  storeRecord,
  verifyEmailCode,
  deleteRecord,
  CODE_TTL_SECONDS,
  RESEND_INTERVAL_SECONDS
};
