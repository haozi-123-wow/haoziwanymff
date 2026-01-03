require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { sequelize } = require('./config/db');
const { connectRedis } = require('./config/redis');
const { syncDatabase } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// 静态文件服务 - 上传的图片
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP在windowMs毫秒内最多请求max次
  message: {
    code: 1001,
    message: '请求过于频繁，请稍后再试',
    data: null,
    timestamp: Date.now()
  }
});
app.use(limiter);

// API路由
app.use('/api/v1', routes);

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'Haoziwanymff Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    code: 1005,
    message: '接口不存在',
    data: null,
    timestamp: Date.now()
  });
});

// 全局错误处理
app.use((error, req, res, next) => {
  console.error('Unhandled Error:', error);
  res.status(500).json({
    code: 5000,
    message: '服务器内部错误',
    data: null,
    timestamp: Date.now()
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 成功连接到MySQL数据库');

    // 同步数据库
    await syncDatabase();

    // 连接Redis
    await connectRedis();

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();