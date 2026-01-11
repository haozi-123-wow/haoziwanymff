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
  }
}
