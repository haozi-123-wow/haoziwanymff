import { request } from '../request';

/** Get admin settings */
export function fetchGetAdminSettings() {
  return request<Api.Admin.Settings>({
    url: '/admin/settings',
    method: 'get'
  });
}

/** Update admin settings */
export function fetchUpdateAdminSettings(data: Partial<Api.Admin.Settings> | FormData) {
  return request<Api.Admin.Settings>({
    url: '/admin/settings',
    method: 'put',
    data,
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  });
}

/** Test email configuration */
export function fetchTestEmail(data: Api.Admin.TestEmailParams) {
  return request<Api.Admin.TestEmailResult>({
    url: '/admin/test-email',
    method: 'post',
    data
  });
}

/** Get users list */
export function fetchGetUsers(params?: Api.Admin.GetUsersParams) {
  return request<Api.Admin.UsersList>({
    url: '/admin/users',
    method: 'get',
    params
  });
}

/** Update user status */
export function fetchUpdateUserStatus(userId: string, isActive: boolean) {
  return request<Api.Admin.UpdateUserStatusResult>({
    url: `/admin/users/${userId}/status`,
    method: 'put',
    data: {
      isActive
    }
  });
}
