declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      expireIn: number;
      userInfo: {
        id: string;
        username: string;
        role: string;
      };
    }

    interface UserInfo {
      id: string;
      username: string;
      email: string;
      role: string;
      createdAt: string;
    }
  }
}
