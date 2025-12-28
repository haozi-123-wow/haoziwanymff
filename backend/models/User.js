const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100] // bcrypt有长度限制
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    field: 'is_active', // 映射到数据库中的 is_active 字段
    defaultValue: false
  },
  activationToken: {
    type: DataTypes.STRING,
    field: 'activation_token' // 映射到数据库中的 activation_token 字段
  },
  activationTokenExpires: {
    type: DataTypes.DATE,
    field: 'activation_token_expires' // 映射到数据库中的 activation_token_expires 字段
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'admin']]
    }
  }
}, {
  tableName: 'users',
  timestamps: true, // 自动添加 createdAt 和 updatedAt
  underscored: true, // 这将自动将模型属性转换为下划线格式
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// 实例方法：比较密码
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;