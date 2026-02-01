const { Domain } = require('../models');

/**
 * 获取公开可购买的域名列表
 * GET /api/v1/domains/public
 */
const getPublicDomains = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Domain.findAndCountAll({
      where: {
        is_public: true,
        is_active: true
      },
      attributes: ['id', 'domain', 'price', 'require_icp', 'remarks', 'is_public'],
      limit: pageSize,
      offset: offset,
      order: [['created_at', 'DESC']]
    });

    const list = rows.map(domain => ({
      id: domain.id,
      domainName: domain.domain,
      price: parseFloat(domain.price),
      requireIcp: domain.require_icp,
      description: domain.remarks || '',
      isPublic: domain.is_public
    }));

    res.json({
      code: 0,
      message: 'success',
      data: {
        list,
        total: count,
        page,
        pageSize
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null
    });
  }
};

/**
 * 检查主机名是否可用
 * GET /api/v1/domains/:domainId/check-hostname
 */
const checkHostname = async (req, res) => {
  try {
    const { domainId } = req.params;
    const { hostname } = req.query;

    if (!hostname) {
      return res.status(400).json({
        code: 1001,
        message: '主机名不能为空',
        data: null
      });
    }

    const domain = await Domain.findByPk(domainId);
    if (!domain) {
      return res.status(404).json({
        code: 1004,
        message: '域名不存在',
        data: null
      });
    }

    const fullDomain = hostname === '@'
      ? domain.domain
      : `${hostname}.${domain.domain}`;

    // 暂时返回可用，后续根据实际需求实现
    res.json({
      code: 0,
      message: 'success',
      data: {
        available: true,
        message: '主机名可用',
        fullDomain: fullDomain
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null
    });
  }
};

module.exports = {
  getPublicDomains,
  checkHostname
};
