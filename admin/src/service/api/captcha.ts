import { request } from '../request';

/** Get captcha config */
export function fetchGetCaptchaConfig() {
  return request<Api.Captcha.CaptchaConfig>({
    url: '/captcha/config',
    method: 'get'
  });
}

/** Validate captcha */
export function fetchValidateCaptcha(data: Api.Captcha.ValidateParams) {
  return request<Api.Captcha.ValidateResult>({
    url: '/captcha/validate',
    method: 'post',
    data
  });
}

/** Get dev validate token */
export function fetchGetDevValidateToken(expiresInMinutes?: number) {
  return request<Api.Captcha.DevValidateToken>({
    url: '/captcha/dev/validate-token',
    method: 'post',
    data: {
      expiresInMinutes
    }
  });
}
