import type { AxiosResponse } from 'axios';
import { BACKEND_ERROR_CODE, createFlatRequest, createRequest } from '@sa/axios';
import { useAuthStore } from '@/store/modules/auth';
import { localStg } from '@/utils/storage';
import { getServiceBaseURL } from '@/utils/service';
import { $t } from '@/locales';
import { getAuthorization, handleExpiredRequest, showErrorMsg } from './shared';
import type { RequestInstanceState } from './type';

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL, otherBaseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

const parseEnvCodes = (value?: string) =>
  value
    ?.split(',')
    .map(code => code.trim())
    .filter(Boolean) ?? [];

export const request = createFlatRequest(
  {
    baseURL,
    headers: {
      apifoxToken: 'XL299LiMEDZ0H5h3A29PxwQXdMJqWyY2'
    }
  },
  {
    defaultState: {
      errMsgStack: []
    } as RequestInstanceState,
    transform(response: AxiosResponse<App.Service.Response<any>>) {
      return response.data.data;
    },
    async onRequest(config) {
      const Authorization = getAuthorization();
      Object.assign(config.headers, { Authorization });

      return config;
    },
    isBackendSuccess(response) {
      // when the backend response code equals the configured success code (default "0"), it means the request is success
      // convert both sides to string to avoid type mismatch between string env vars and numeric backend codes
      const successCode = String(import.meta.env.VITE_SERVICE_SUCCESS_CODE);
      return String(response.data.code) === successCode;
    },
    async onBackendFail(response, instance) {
      const authStore = useAuthStore();
      const responseCode = String(response.data.code ?? '');
      const backendMessage = response.data.message ?? '';
      const errMsgKey = backendMessage || responseCode || $t('common.error');

      function handleLogout() {
        authStore.resetStore();
      }

      function logoutAndCleanup() {
        handleLogout();
        window.removeEventListener('beforeunload', handleLogout);

        if (request.state.errMsgStack?.length) {
          request.state.errMsgStack = request.state.errMsgStack.filter(msg => msg !== errMsgKey);
        }
      }

      // when the backend response code is in `logoutCodes`, it means the user will be logged out and redirected to login page
      const logoutCodes = parseEnvCodes(import.meta.env.VITE_SERVICE_LOGOUT_CODES);
      if (logoutCodes.includes(responseCode)) {
        handleLogout();
        return null;
      }

      // when the backend response code is in `modalLogoutCodes`, it means the user will be logged out by displaying a modal
      const modalLogoutCodes = parseEnvCodes(import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES);
      if (modalLogoutCodes.includes(responseCode) && !request.state.errMsgStack?.includes(errMsgKey)) {
        request.state.errMsgStack = [...(request.state.errMsgStack || []), errMsgKey];

        // prevent the user from refreshing the page
        window.addEventListener('beforeunload', handleLogout);

        window.$dialog?.error({
          title: $t('common.error'),
          content: backendMessage || $t('common.error'),
          positiveText: $t('common.confirm'),
          maskClosable: false,
          closeOnEsc: false,
          onPositiveClick() {
            logoutAndCleanup();
          },
          onClose() {
            logoutAndCleanup();
          }
        });

        return null;
      }

      // when the backend response code is in `expiredTokenCodes`, it means the token is expired, and refresh token
      // the api `refreshToken` can not return error code in `expiredTokenCodes`, otherwise it will be a dead loop, should return `logoutCodes` or `modalLogoutCodes`
      const expiredTokenCodes = parseEnvCodes(import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES);
      if (expiredTokenCodes.includes(responseCode)) {
        const success = await handleExpiredRequest(request.state);
        if (success) {
          const Authorization = getAuthorization();
          Object.assign(response.config.headers, { Authorization });

          return instance.request(response.config) as Promise<AxiosResponse>;
        }
      }

      return null;
    },
    onError(error) {
      // when the request is fail, you can show error message

      let message = error.message;
      let backendErrorCode = '';

      // get backend error message and code
      // 处理后端业务错误（BACKEND_ERROR_CODE）和 HTTP 错误（如 403、401 等）
      if (error.code === BACKEND_ERROR_CODE || error.response) {
        // 优先使用后端返回的错误消息
        message = error.response?.data?.message || error.response?.data?.data?.message || message;
        backendErrorCode = String(error.response?.data?.code ?? '');

        // 对于 403 状态码，确保显示后端返回的详细错误信息
        if (error.response?.status === 403 && error.response?.data?.message) {
          message = error.response.data.message;
        }
      }

      // the error message is displayed in the modal
      const modalLogoutCodes = parseEnvCodes(import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES);
      if (modalLogoutCodes.includes(backendErrorCode)) {
        return;
      }

      // when the token is expired, refresh token and retry request, so no need to show error message
      const expiredTokenCodes = parseEnvCodes(import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES);
      if (expiredTokenCodes.includes(backendErrorCode)) {
        return;
      }

      showErrorMsg(request.state, message || $t('common.error'));
    }
  }
);

export const demoRequest = createRequest(
  {
    baseURL: otherBaseURL.demo
  },
  {
    transform(response: AxiosResponse<App.Service.DemoResponse>) {
      return response.data.result;
    },
    async onRequest(config) {
      const { headers } = config;

      // set token
      const token = localStg.get('token');
      const Authorization = token ? `Bearer ${token}` : null;
      Object.assign(headers, { Authorization });

      return config;
    },
    isBackendSuccess(response) {
      // when the backend response code is "200", it means the request is success
      // you can change this logic by yourself
      return response.data.status === '200';
    },
    async onBackendFail(_response) {
      // when the backend response code is not "200", it means the request is fail
      // for example: the token is expired, refresh token and retry request
    },
    onError(error) {
      // when the request is fail, you can show error message

      let message = error.message;

      // show backend error message
      if (error.code === BACKEND_ERROR_CODE) {
        message = error.response?.data?.message || message;
      }

      window.$message?.error(message);
    }
  }
);
