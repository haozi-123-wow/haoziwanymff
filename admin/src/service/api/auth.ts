import { request } from '../request';

/**
 * Login
 *
 * @param account Account (username or email)
 * @param password Password
 * @param validateToken Geetest validate token
 */
export function fetchLogin(account: string, password: string, validateToken = '') {
  return request<Api.Auth.LoginToken>({
    url: '/auth/login',
    method: 'post',
    data: {
      account,
      password,
      validate_token: validateToken
    }
  });
}

/**
 * Login with email verification code
 *
 * @param email Email address
 * @param code Verification code
 * @param validateToken Geetest validate token
 */
export function fetchLoginWithCode(email: string, code: string, validateToken: string) {
  return request<Api.Auth.LoginToken>({
    url: '/auth/login-with-code',
    method: 'post',
    data: {
      email,
      code,
      validate_token: validateToken
    }
  });
}

/** Get user info */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({ url: '/user/me' });
}

/**
 * User register
 *
 * @param username Username
 * @param email Email address
 * @param password Password
 * @param validateToken Geetest validate token
 */
export function fetchRegister(username: string, email: string, password: string, validateToken: string) {
  return request({
    url: '/auth/register',
    method: 'post',
    data: {
      username,
      email,
      password,
      validate_token: validateToken
    }
  });
}

/**
 * Activate account
 *
 * @param token Activation token
 */
export function fetchActivateAccount(token: string) {
  return request({
    url: `/auth/activate/${token}`,
    method: 'get'
  });
}

/**
 * Send email verification code
 *
 * @param email Email address
 * @param scene Scene (register, reset_password, update_email)
 * @param validateToken Geetest validate token
 */
export function fetchSendEmailCode(email: string, scene: string, validateToken: string) {
  return request({
    url: '/auth/email-code',
    method: 'post',
    data: {
      email,
      scene,
      validate_token: validateToken
    }
  });
}

/**
 * Reset password
 *
 * @param email Email address
 * @param code Verification code
 * @param newPassword New password
 * @param validateToken Geetest validate token
 */
export function fetchResetPassword(email: string, code: string, newPassword: string, validateToken: string) {
  return request({
    url: '/auth/reset-password',
    method: 'post',
    data: {
      email,
      code,
      newPassword,
      validate_token: validateToken
    }
  });
}

/**
 * Logout
 */
export function fetchLogout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  });
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return request({ url: '/auth/error', params: { code, msg } });
}
