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
export function fetchUpdateUserStatus(userId: string, data: Api.Admin.UpdateUserStatusParams) {
  return request<Api.Admin.UpdateUserStatusResult>({
    url: `/admin/users/${userId}/status`,
    method: 'put',
    data
  });
}

// ==================== 云平台配置相关API ====================

/** Get platform settings list */
export function fetchGetPlatformSettings(params?: { page?: number; pageSize?: number }) {
  return request<Api.Admin.PlatformSettingList>({
    url: '/admin/platform-settings',
    method: 'get',
    params
  });
}

/** Add platform setting */
export function fetchAddPlatformSetting(data: Api.Admin.AddPlatformSettingParams) {
  return request<Api.Admin.PlatformSetting>({
    url: '/admin/platform-settings',
    method: 'post',
    data
  });
}

/** Update platform setting */
export function fetchUpdatePlatformSetting(id: number, data: Api.Admin.UpdatePlatformSettingParams) {
  return request<Api.Admin.PlatformSetting>({
    url: `/admin/platform-settings/${id}`,
    method: 'put',
    data
  });
}

/** Delete platform setting */
export function fetchDeletePlatformSetting(id: number) {
  return request<{ message: string }>({
    url: `/admin/platform-settings/${id}`,
    method: 'delete'
  });
}

/** Update platform setting status */
export function fetchUpdatePlatformSettingStatus(id: number, data: Api.Admin.UpdatePlatformSettingStatusParams) {
  return request<{ message: string }>({
    url: `/admin/platform-settings/${id}/status`,
    method: 'put',
    data
  });
}

// ==================== 域名相关API ====================

/** Get all domains from database */
export function fetchGetDomains(params?: Api.Admin.GetDomainsParams) {
  return request<Api.Admin.DomainList>({
    url: '/admin/domains',
    method: 'get',
    params
  });
}

/** Get domains by platform setting */
export function fetchGetDomainsByPlatformSetting(
  platformId: number,
  params?: Api.Admin.GetDomainsByPlatformParams
) {
  return request<Api.Admin.DomainList>({
    url: `/admin/platform-settings/${platformId}/domains`,
    method: 'get',
    params
  });
}

/** Get cloud platform domains (for adding to database) */
export function fetchGetCloudDomains(platformId: number, params?: { page?: number; pageSize?: number }) {
  return request<Api.Admin.CloudDomainList>({
    url: `/admin/platform-settings/${platformId}/domains`,
    method: 'get',
    params
  });
}

/** Add domain */
export function fetchAddDomain(data: Api.Admin.AddDomainParams) {
  return request<Api.Admin.AddDomainResult>({
    url: '/admin/domains',
    method: 'post',
    data
  });
}

/** Update domain */
export function fetchUpdateDomain(domainId: number, data: Api.Admin.UpdateDomainParams) {
  return request<Api.Admin.Domain>({
    url: `/admin/domains/${domainId}`,
    method: 'put',
    data
  });
}

/** Delete domain */
export function fetchDeleteDomain(domainId: number) {
  return request<{ message: string }>({
    url: `/admin/domains/${domainId}`,
    method: 'delete'
  });
}

/** Get domain DNS records */
export function fetchGetDomainRecords(domainId: number, params?: Api.Admin.GetDomainRecordsParams) {
  return request<Api.Admin.DomainRecordList>({
    url: `/admin/domains/${domainId}/records`,
    method: 'get',
    params
  });
}

/** Add domain DNS record */
export function fetchAddDomainRecord(domainId: number, data: Api.Admin.AddDomainRecordParams) {
  return request<any>({
    url: `/admin/domains/${domainId}/records`,
    method: 'post',
    data
  });
}

/** Update domain DNS record */
export function fetchUpdateDomainRecord(domainId: number, recordId: string, data: Api.Admin.UpdateDomainRecordParams) {
  return request<any>({
    url: `/admin/domains/${domainId}/records/${recordId}`,
    method: 'put',
    data
  });
}

/** Delete domain DNS record */
export function fetchDeleteDomainRecord(domainId: number, recordId: string) {
  return request<{ message: string }>({
    url: `/admin/domains/${domainId}/records/${recordId}`,
    method: 'delete'
  });
}
