declare namespace Api {
  /**
   * namespace Admin
   *
   * backend api module: "admin"
   */
  namespace Admin {
    interface Settings {
      siteName: string;
      siteTitle: string;
      siteDescription: string;
      siteKeywords: string;
      siteAnnouncement: string;
      siteLogo: string;
      siteFavicon: string;
      loginLogo: string;
      adminQQ: string;
      qqGroupLink: string;
      registerConfig: {
        allowRegister: boolean;
        needActivation: boolean;
        needCaptcha: boolean;
      };
      smtpConfig: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
        from: string;
      };
      createdAt?: string;
      updatedAt?: string;
    }

    interface TestEmailParams {
      to: string;
      validate_token?: string;
    }

    interface TestEmailResult {
      success: boolean;
      message: string;
    }

    interface GetUsersParams {
      page?: number;
      pageSize?: number;
      keyword?: string;
    }

    interface User {
      id: string;
      username: string;
      email: string;
      role: string;
      isActive: boolean;
      isBanned: boolean;
      banReason: string | null;
      createdAt: string;
      updatedAt: string;
    }

    interface UsersList {
      list: User[];
      total: number;
      page: number;
      pageSize: number;
    }

    interface UpdateUserStatusParams {
      isActive?: boolean;
      isBanned?: boolean;
      banReason?: string;
    }

    interface UpdateUserStatusResult {
      userId: string;
      isActive: boolean;
      isBanned: boolean;
      banReason: string | null;
    }

    // 云平台配置相关类型
    interface PlatformSetting {
      id: number;
      name: string;
      platform: 'aliyun' | 'tencent' | 'cloudflare';
      accessKeyId: string;
      accessKeySecret?: string;
      isActive: boolean;
      config?: Record<string, any>;
      createdAt: string;
      updatedAt: string;
      domainCount?: number;
    }

    interface PlatformSettingList {
      list: PlatformSetting[];
      total: number;
      page: number;
      pageSize: number;
    }

    interface AddPlatformSettingParams {
      name: string;
      platform: 'aliyun' | 'tencent' | 'cloudflare';
      accessKeyId: string;
      accessKeySecret: string;
      isActive?: boolean;
    }

    interface UpdatePlatformSettingParams {
      name?: string;
      accessKeyId?: string;
      accessKeySecret?: string;
      isActive?: boolean;
    }

    interface UpdatePlatformSettingStatusParams {
      isActive: boolean;
    }

    // 域名相关类型
    interface Domain {
      id: number;
      domain: string;
      platformId: number;
      platformName: string;
      platform: string;
      isActive: boolean;
      isPublic: boolean;
      remarks?: string;
      createdAt: string;
      updatedAt: string;
    }

    interface DomainList {
      list: Domain[];
      total: number;
      page: number;
      pageSize: number;
    }

    interface GetDomainsParams {
      page?: number;
      pageSize?: number;
      platformId?: number;
      keyword?: string;
      isActive?: boolean;
    }

    interface GetDomainsByPlatformParams {
      page?: number;
      pageSize?: number;
      keyword?: string;
    }

    interface CloudPlatformDomain {
      domainId: string;
      domainName: string;
      status: string;
    }

    interface CloudDomainList {
      list: CloudPlatformDomain[];
      total: number;
    }

    interface AddDomainParams {
      domain: string;
      platformId: number;
      remarks?: string;
      isPublic?: boolean;
    }

    interface AddDomainResult {
      id: number;
      domain: string;
      platformId: number;
      isActive: boolean;
      isPublic: boolean;
      remarks: string;
      createdAt: string;
      updatedAt: string;
    }
  }
}
