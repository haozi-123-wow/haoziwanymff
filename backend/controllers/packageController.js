const { UserPackage, Package, Domain } = require('../models');

const checkUserPackageStatus = async (req, res) => {
  try {
    const { domainId } = req.query;
    const userId = req.user.id;

    if (!domainId) {
      return res.status(400).json({
        code: 1001,
        message: '参数错误：缺少domainId'
      });
    }

    const domain = await Domain.findByPk(domainId);
    if (!domain) {
      return res.status(404).json({
        code: 1005,
        message: '域名不存在'
      });
    }

    const now = new Date();

    const userPackages = await UserPackage.findAll({
      where: {
        user_id: userId,
        domain_id: domainId,
        status: 'active',
        valid_end: {
          [require('sequelize').Op.gt]: now
        }
      },
      include: [
        {
          model: Package,
          attributes: ['id', 'name', 'parse_count', 'duration_days', 'price']
        }
      ],
      order: [['valid_end', 'ASC']]
    });

    if (userPackages.length === 0) {
      return res.json({
        code: 0,
        message: 'success',
        data: {
          hasPackage: false,
          packages: [],
          totalAvailable: 0,
          canUsePackage: false,
          singlePrice: domain.price
        }
      });
    }

    const packagesData = userPackages.map(up => ({
      packageId: up.package_id,
      packageName: up.Package.name,
      totalCount: up.total_count,
      usedCount: up.used_count,
      availableCount: up.total_count - up.used_count,
      validEnd: up.valid_end
    }));

    const totalAvailable = packagesData.reduce((sum, pkg) => sum + pkg.availableCount, 0);

    res.json({
      code: 0,
      message: 'success',
      data: {
        hasPackage: true,
        packages: packagesData,
        totalAvailable,
        canUsePackage: totalAvailable > 0
      }
    });
  } catch (error) {
    console.error('检查用户套餐状态失败:', error);
    res.status(500).json({
      code: 5000,
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  checkUserPackageStatus
};
