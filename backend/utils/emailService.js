const nodemailer = require('nodemailer');
const { Setting } = require('../models');

/**
 * 获取邮件配置
 */
const getEmailConfig = async () => {
  // 首先尝试从数据库获取配置
  const dbConfig = await Setting.findOne({ where: { key: 'smtpConfig' } });
  
  if (dbConfig) {
    try {
      const config = JSON.parse(dbConfig.value);
      return {
        host: config.host,
        port: config.port,
        secure: config.secure === 'true' || config.secure === true, // true for 465, false for other ports
        auth: {
          user: config.user,
          pass: config.pass
        },
        from: config.from
      };
    } catch (e) {
      // 如果数据库配置解析失败，回退到环境变量
      return {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        from: process.env.EMAIL_USER
      };
    }
  }
  
  // 使用环境变量
  return {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    from: process.env.EMAIL_USER
  };
};

/**
 * 创建邮件传输器
 */
const createTransporter = async () => {
  const config = await getEmailConfig();
  return nodemailer.createTransporter(config);
};

/**
 * 生成HTML激活邮件内容
 */
const generateActivationEmail = (user, activationLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>账户激活 - Haoziwanymff</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .container {
          max-width: 600px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #4f46e5;
          color: white;
          padding: 30px;
          text-align: center;
        }
        .content {
          padding: 30px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #4f46e5;
          color: white !important;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>欢迎加入 Haoziwanymff</h1>
        </div>
        <div class="content">
          <h2>您好，${user.username}！</h2>
          <p>感谢您注册 Haoziwanymff 账户。</p>
          <p>请点击下方按钮激活您的账户：</p>
          <div style="text-align: center;">
            <a href="${activationLink}" class="button">激活账户</a>
          </div>
          <p>如果上面的按钮无法点击，请复制以下链接到浏览器地址栏中打开：</p>
          <p style="word-break: break-all; color: #4f46e5;">${activationLink}</p>
          <p>此链接将在24小时内有效，请尽快完成激活。</p>
          <p>如果您没有注册过我们的服务，请忽略此邮件。</p>
          <p>如有任何问题，请联系我们的客服团队。</p>
        </div>
        <div class="footer">
          <p>此邮件由 Haoziwanymff 系统自动发送，请勿回复。</p>
          <p>&copy; 2025 Haoziwanymff. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * 发送激活邮件
 */
const sendActivationEmail = async (user, activationToken) => {
  const transporter = await createTransporter();
  
  // 生成激活链接
  const activationLink = `${process.env.FRONTEND_URL}/activate/${activationToken}`;
  
  // 获取发件人信息
  const config = await getEmailConfig();
  const from = config.from || process.env.EMAIL_USER;
  
  const mailOptions = {
    from: `"Haoziwanymff" <${from}>`,
    to: user.email,
    subject: 'Haoziwanymff - 账户激活',
    html: generateActivationEmail(user, activationLink)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('激活邮件发送成功:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('发送激活邮件失败:', error);
    throw new Error(`邮件发送失败: ${error.message}`);
  }
};

/**
 * 发送测试邮件
 */
const sendTestEmail = async (to, subject = '测试邮件', content = '这是一封测试邮件') => {
  const transporter = await createTransporter();
  
  // 获取发件人信息
  const config = await getEmailConfig();
  const from = config.from || process.env.EMAIL_USER;
  
  const mailOptions = {
    from: `"Haoziwanymff" <${from}>`,
    to,
    subject,
    text: content
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('测试邮件发送成功:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('发送测试邮件失败:', error);
    throw new Error(`邮件发送失败: ${error.message}`);
  }
};

module.exports = {
  sendActivationEmail,
  sendTestEmail,
  getEmailConfig
};