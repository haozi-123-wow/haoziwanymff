declare namespace Api {
  namespace Captcha {
    interface CaptchaConfig {
      captchaId: string;
      apiServer: string;
      timestamp: number;
    }

    interface ValidateParams {
      lot_number: string;
      captcha_output: string;
      pass_token: string;
      gen_time: string;
    }

    interface ValidateResult {
      result: string;
      validate_token: string;
    }

    interface DevValidateToken {
      validate_token: string;
      expiresInMinutes: number;
    }
  }
}
