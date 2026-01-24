<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue';
import { $t } from '@/locales';
import {
  NButton,
  NCard,
  NDataTable,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NSwitch,
  NTag,
  NDivider,
  NCheckbox,
  NModal,
  NPopconfirm
} from 'naive-ui';
import {
  fetchGetPlatformSettings,
  fetchGetDomains,
  fetchGetCloudDomains,
  fetchAddDomain,
  fetchUpdateDomain,
  fetchDeleteDomain,
  fetchGetDomainRecords,
  fetchAddDomainRecord,
  fetchUpdateDomainRecord,
  fetchDeleteDomainRecord
} from '@/service/api/admin';

defineOptions({
  name: 'DomainManagementList'
});

const loading = ref(false);
const cloudLoading = ref(false);
const adding = ref(false);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const domains = ref<Api.Admin.Domain[]>([]);
const searchKeyword = ref('');

// 添加域名相关
const addDomainModalVisible = ref(false);
const platformLoading = ref(false);
const platformSettings = ref<Api.Admin.PlatformSetting[]>([]);
const addPlatformId = ref<number | null>(null);
const cloudDomains = ref<Api.Admin.CloudPlatformDomain[]>([]);
const selectedDomains = ref<string[]>([]);
const addRemarks = ref('');
const addIsPublic = ref(true);

// 修改域名相关
const editDomainModalVisible = ref(false);
const editDomainId = ref<number | null>(null);
const editDomain = ref<Api.Admin.Domain | null>(null);
const editPlatformId = ref<number | null>(null);
const editRemarks = ref('');
const editIsPublic = ref(true);
const editIsActive = ref(true);
const editing = ref(false);

// 解析记录相关
const recordModalVisible = ref(false);
const recordLoading = ref(false);
const recordDomain = ref<Api.Admin.Domain | null>(null);
const dnsRecords = ref<Api.Admin.DnsRecord[]>([]);
const recordPagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});
const recordTypeFilter = ref('');
const recordKeyword = ref('');

// 添加/修改解析记录
const recordFormModalVisible = ref(false);
const recordFormMode = ref<'add' | 'edit'>('add');
const recordFormLoading = ref(false);
const recordForm = reactive({
  recordId: '',
  rr: '',
  type: 'A',
  value: '',
  ttl: 600,
  line: '默认'
});

onMounted(async () => {
  await loadDomains();
});

async function loadDomains() {
  try {
    loading.value = true;
    const params: Api.Admin.GetDomainsParams = {
      page: pagination.page,
      pageSize: pagination.pageSize
    };

    // 如果有搜索关键词，则添加搜索条件
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value;
    }

    const { data, error } = await fetchGetDomains(params);

    if (!error && data) {
      domains.value = data.list;
      pagination.total = data.total;
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '加载域名列表失败',
      duration: 3000
    });
  } finally {
    loading.value = false;
  }
}

async function loadPlatformSettings() {
  try {
    platformLoading.value = true;
    const { data, error } = await fetchGetPlatformSettings({ pageSize: 100 });

    if (!error && data) {
      platformSettings.value = data.list;
      // 选择第一个云平台
      if (data.list.length > 0 && !addPlatformId.value) {
        addPlatformId.value = data.list[0].id;
      }
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '加载云平台配置失败',
      duration: 3000
    });
  } finally {
    platformLoading.value = false;
  }
}

function handlePageChange(page: number) {
  pagination.page = page;
  loadDomains();
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  loadDomains();
}

function handleSearch() {
  pagination.page = 1;
  loadDomains();
}

function handleReset() {
  searchKeyword.value = '';
  pagination.page = 1;
  loadDomains();
}

// 添加域名相关功能
async function openAddModal() {
  addDomainModalVisible.value = true;
  selectedDomains.value = [];
  addRemarks.value = '';
  addIsPublic.value = true;
  cloudDomains.value = [];
  addPlatformId.value = null;

  // 加载云平台配置列表
  await loadPlatformSettings();

  // 自动加载第一个云平台的域名列表
  if (addPlatformId.value) {
    loadCloudDomains(addPlatformId.value);
  }
}

async function handleAddPlatformChange(platformId: number) {
  addPlatformId.value = platformId;
  selectedDomains.value = [];
  cloudDomains.value = [];

  if (platformId) {
    await loadCloudDomains(platformId);
  }
}

async function loadCloudDomains(platformId: number) {
  try {
    cloudLoading.value = true;
    const { data, error } = await fetchGetCloudDomains(platformId, { page: 1, pageSize: 100 });

    if (!error && data) {
      cloudDomains.value = data.list;
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '获取云平台域名列表失败',
      duration: 3000
    });
  } finally {
    cloudLoading.value = false;
  }
}

async function handleAddDomains() {
  if (!addPlatformId.value) {
    window.$notification?.error({
      title: '错误',
      content: '请选择云平台账户',
      duration: 3000
    });
    return false;
  }

  if (selectedDomains.value.length === 0) {
    window.$notification?.error({
      title: '错误',
      content: '请至少选择一个域名',
      duration: 3000
    });
    return false;
  }

  try {
    adding.value = true;

    // 逐个添加域名
    for (const domain of selectedDomains.value) {
      await fetchAddDomain({
        domain: domain,
        platformId: addPlatformId.value,
        remarks: addRemarks.value,
        isPublic: addIsPublic.value
      });
    }

    window.$notification?.success({
      title: '成功',
      content: `成功添加 ${selectedDomains.value.length} 个域名`,
      duration: 3000
    });

    addDomainModalVisible.value = false;
    await loadDomains();
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '添加域名失败',
      duration: 3000
    });
  } finally {
    adding.value = false;
  }
}

function getPlatformTag(platform: string) {
  const providerMap: Record<string, { type: 'success' | 'info' | 'warning' | 'error' | 'default'; label: string }> = {
    aliyun: { type: 'success' as const, label: '阿里云' },
    tencent: { type: 'info' as const, label: '腾讯云' },
    cloudflare: { type: 'warning' as const, label: 'Cloudflare' }
  };
  return providerMap[platform] || { type: 'default' as const, label: platform };
}

// 编辑域名相关
function openEditModal(domain: Api.Admin.Domain) {
  editDomain.value = domain;
  editDomainId.value = domain.id;
  editPlatformId.value = domain.platformId;
  editRemarks.value = domain.remarks || '';
  editIsPublic.value = domain.isPublic;
  editIsActive.value = domain.isActive;
  editDomainModalVisible.value = true;
}

async function handleEditDomain() {
  if (!editDomainId.value) {
    return;
  }

  try {
    editing.value = true;
    const { data, error } = await fetchUpdateDomain(editDomainId.value, {
      platformId: editPlatformId.value!,
      remarks: editRemarks.value,
      isPublic: editIsPublic.value,
      isActive: editIsActive.value
    });

    if (!error && data) {
      window.$notification?.success({
        title: '成功',
        content: '修改域名配置成功',
        duration: 3000
      });
      editDomainModalVisible.value = false;
      await loadDomains();
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '修改域名配置失败',
      duration: 3000
    });
  } finally {
    editing.value = false;
  }
}

async function handleDeleteDomain(domainId: number, domain: string) {
  try {
    const { error } = await fetchDeleteDomain(domainId);

    if (!error) {
      window.$notification?.success({
        title: '成功',
        content: '删除域名成功',
        duration: 3000
      });
      await loadDomains();
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '删除域名失败',
      duration: 3000
    });
  }
}

// 解析记录相关
function openRecordModal(domain: Api.Admin.Domain) {
  recordDomain.value = domain;
  recordModalVisible.value = true;
  recordPagination.page = 1;
  recordTypeFilter.value = '';
  recordKeyword.value = '';
  loadDomainRecords();
}

async function loadDomainRecords() {
  if (!recordDomain.value) return;

  try {
    recordLoading.value = true;
    const params: Api.Admin.GetDomainRecordsParams = {
      page: recordPagination.page,
      pageSize: recordPagination.pageSize
    };

    if (recordTypeFilter.value) {
      params.type = recordTypeFilter.value;
    }
    if (recordKeyword.value) {
      params.keyword = recordKeyword.value;
    }

    const { data, error } = await fetchGetDomainRecords(recordDomain.value.id, params);

    if (!error && data) {
      dnsRecords.value = data.list;
      recordPagination.total = data.total;
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '获取解析记录失败',
      duration: 3000
    });
  } finally {
    recordLoading.value = false;
  }
}

function handleRecordSearch() {
  recordPagination.page = 1;
  loadDomainRecords();
}

function handleRecordReset() {
  recordTypeFilter.value = '';
  recordKeyword.value = '';
  recordPagination.page = 1;
  loadDomainRecords();
}

function handleRecordPageChange(page: number) {
  recordPagination.page = page;
  loadDomainRecords();
}

function handleRecordPageSizeChange(pageSize: number) {
  recordPagination.pageSize = pageSize;
  recordPagination.page = 1;
  loadDomainRecords();
}

function openAddRecordModal() {
  recordFormMode.value = 'add';
  recordForm.recordId = '';
  recordForm.rr = '';
  recordForm.type = 'A';
  recordForm.value = '';
  recordForm.ttl = 600;
  recordForm.line = '默认';
  recordFormModalVisible.value = true;
}

function openEditRecordModal(record: Api.Admin.DnsRecord) {
  recordFormMode.value = 'edit';
  recordForm.recordId = record.recordId;
  recordForm.rr = record.rr;
  recordForm.type = record.type;
  recordForm.value = record.value;
  recordForm.ttl = record.ttl;
  recordForm.line = record.line;
  recordFormModalVisible.value = true;
}

async function handleSaveRecord() {
  if (!recordDomain.value || !recordForm.rr || !recordForm.value) {
    window.$notification?.error({
      title: '错误',
      content: '请填写完整的记录信息',
      duration: 3000
    });
    return;
  }

  try {
    recordFormLoading.value = true;

    if (recordFormMode.value === 'add') {
      const { error } = await fetchAddDomainRecord(recordDomain.value.id, {
        rr: recordForm.rr,
        type: recordForm.type,
        value: recordForm.value,
        ttl: recordForm.ttl,
        line: recordForm.line
      });

      if (!error) {
        window.$notification?.success({
          title: '成功',
          content: '添加解析记录成功',
          duration: 3000
        });
        recordFormModalVisible.value = false;
        await loadDomainRecords();
      }
    } else {
      const { error } = await fetchUpdateDomainRecord(
        recordDomain.value.id,
        recordForm.recordId,
        {
          rr: recordForm.rr,
          type: recordForm.type,
          value: recordForm.value
        }
      );

      if (!error) {
        window.$notification?.success({
          title: '成功',
          content: '修改解析记录成功',
          duration: 3000
        });
        recordFormModalVisible.value = false;
        await loadDomainRecords();
      }
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '操作解析记录失败',
      duration: 3000
    });
  } finally {
    recordFormLoading.value = false;
  }
}

async function handleDeleteRecord(recordId: string, rr: string) {
  if (!recordDomain.value) return;

  try {
    const { error } = await fetchDeleteDomainRecord(recordDomain.value.id, recordId);

    if (!error) {
      window.$notification?.success({
        title: '成功',
        content: '删除解析记录成功',
        duration: 3000
      });
      await loadDomainRecords();
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '删除解析记录失败',
      duration: 3000
    });
  }
}




</script>

<template>
  <NSpace vertical :size="16">
    <NCard :bordered="false" class="card-wrapper">
      <template #header>
        <span>{{ $t('route.domain-management_list') }}</span>
      </template>

      <NSpace vertical :size="16">
        <!-- 操作栏 -->
        <NSpace vertical :size="12">
          <NSpace :size="12">
            <NButton type="primary" @click="openAddModal">
              <template #icon>
                <icon-mdi:plus />
              </template>
              添加域名
            </NButton>
          </NSpace>

          <NFormItem label="搜索域名">
            <NSpace :size="12">
              <NInput
                v-model:value="searchKeyword"
                placeholder="请输入域名搜索"
                clearable
                style="width: 300px"
                @keyup.enter="handleSearch"
              />
              <NButton type="primary" @click="handleSearch">
                <template #icon>
                  <icon-mdi:magnify />
                </template>
                搜索
              </NButton>
              <NButton @click="handleReset">重置</NButton>
            </NSpace>
          </NFormItem>
        </NSpace>

        <NDivider />

        <!-- 域名列表表格 -->
        <NDataTable
          :columns="[
            {
              title: 'ID',
              key: 'id',
              width: 80,
              ellipsis: { tooltip: true }
            },
            {
              title: '域名',
              key: 'domain',
              width: 200,
              ellipsis: { tooltip: true }
            },
            {
              title: '所属平台',
              key: 'platformName',
              width: 150,
              render: row => {
                if (!row.platformName) return '-';
                const tag = getPlatformTag(row.platform);
                return h(NTag, { type: tag.type }, { default: () => row.platformName });
              }
            },
            {
              title: '是否公开',
              key: 'isPublic',
              width: 100,
              render: row => {
                return h(
                  NTag,
                  { type: row.isPublic ? 'success' : 'default' },
                  { default: () => (row.isPublic ? '是' : '否') }
                );
              }
            },
            {
              title: '备注',
              key: 'remarks',
              width: 200,
              ellipsis: { tooltip: true },
              render: row => row.remarks || '-'
            },
            {
              title: '状态',
              key: 'isActive',
              width: 100,
              render: row => {
                return h(
                  NTag,
                  { type: row.isActive ? 'success' : 'default' },
                  { default: () => (row.isActive ? '启用' : '禁用') }
                );
              }
            },
            {
              title: '创建时间',
              key: 'createdAt',
              width: 180,
              render: row => new Date(row.createdAt).toLocaleString('zh-CN')
            },
            {
              title: '操作',
              key: 'actions',
              width: 280,
              fixed: 'right',
              align: 'center',
              render: row => {
                return h(
                  NSpace,
                  { size: 8 },
                  {
                    default: () => [
                      h(
                        NButton,
                        {
                          size: 'small',
                          type: 'info',
                          onClick: () => openRecordModal(row)
                        },
                        { default: () => '解析' }
                      ),
                      h(
                        NButton,
                        {
                          size: 'small',
                          type: 'warning',
                          onClick: () => openEditModal(row)
                        },
                        { default: () => '修改' }
                      ),
                      h(
                        NPopconfirm,
                        {
                          onPositiveClick: () => handleDeleteDomain(row.id, row.domain)
                        },
                        {
                          default: () => `确认删除域名 '${row.domain}' 吗？`,
                          trigger: () =>
                            h(
                              NButton,
                              {
                                size: 'small',
                                type: 'error'
                              },
                              { default: () => '删除' }
                            )
                        }
                      )
                    ]
                  }
                );
              }
            }
          ]"
          :data="domains"
          :loading="loading"
          :pagination="{
            page: pagination.page,
            pageSize: pagination.pageSize,
            itemCount: pagination.total,
            showSizePicker: true,
            pageSizes: [10, 20, 50, 100],
            onChange: handlePageChange,
            onUpdatePageSize: handlePageSizeChange
          }"
          :bordered="false"
          scroll-x="1400"
        />
      </NSpace>
    </NCard>

    <!-- 添加域名模态框 -->
    <NModal
      v-model:show="addDomainModalVisible"
      preset="card"
      title="添加域名"
      :bordered="false"
      size="large"
      class="add-domain-modal"
      style="max-width: 700px;"
    >
      <NSpace vertical :size="16">
        <NFormItem label="选择云平台账户" required>
          <NSelect
            v-model:value="addPlatformId"
            :loading="platformLoading"
            :options="platformSettings.map((p: Api.Admin.PlatformSetting) => ({ label: p.name, value: p.id }))"
            placeholder="请选择云平台账户"
            @update:value="handleAddPlatformChange"
          />
        </NFormItem>

        <NFormItem label="选择域名" required>
          <div v-if="cloudLoading" style="text-align: center; padding: 40px;">
            加载中...
          </div>
          <div v-else-if="cloudDomains.length === 0" style="text-align: center; padding: 40px; color: #999;">
            请先选择云平台账户
          </div>
          <div v-else class="domain-list">
            <div class="domain-list-header">
              <NCheckbox
                :checked="selectedDomains.length === cloudDomains.length"
                :indeterminate="selectedDomains.length > 0 && selectedDomains.length < cloudDomains.length"
                @update:checked="selectedDomains = selectedDomains.length === cloudDomains.length ? [] : cloudDomains.map(d => d.domainName)"
              >
                全选
              </NCheckbox>
              <span>已选择 {{ selectedDomains.length }} 个域名</span>
            </div>
            <div class="domain-list-content">
              <NCheckbox
                v-for="domain in cloudDomains"
                :key="domain.domainId"
                :checked="selectedDomains.includes(domain.domainName)"
                @update:checked="(checked) => {
                  if (checked) {
                    selectedDomains.push(domain.domainName);
                  } else {
                    const index = selectedDomains.indexOf(domain.domainName);
                    if (index > -1) selectedDomains.splice(index, 1);
                  }
                }"
              >
                <span class="domain-name">{{ domain.domainName }}</span>
                <NTag v-if="domain.status" :type="domain.status === 'ENABLE' ? 'success' : 'warning'" size="small">
                  {{ domain.status }}
                </NTag>
              </NCheckbox>
            </div>
          </div>
        </NFormItem>

        <NFormItem label="备注">
          <NInput
            v-model:value="addRemarks"
            type="textarea"
            placeholder="请输入备注说明（可选）"
            :rows="3"
          />
        </NFormItem>

        <NFormItem label="是否公开">
          <NSwitch v-model:value="addIsPublic">
            <template #checked>是</template>
            <template #unchecked>否</template>
          </NSwitch>
          <span style="margin-left: 8px; color: #999;">公开后允许用户注册</span>
        </NFormItem>
      </NSpace>

      <template #footer>
        <NSpace :size="12">
          <NButton @click="addDomainModalVisible = false">取消</NButton>
          <NButton
            type="primary"
            :loading="adding"
            :disabled="selectedDomains.length === 0"
            @click="handleAddDomains"
          >
            添加 {{ selectedDomains.length }} 个域名
          </NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 修改域名模态框 -->
    <NModal
      v-model:show="editDomainModalVisible"
      preset="card"
      title="修改域名配置"
      :bordered="false"
      size="medium"
      style="max-width: 600px;"
    >
      <NSpace vertical :size="16">
        <NFormItem label="云平台账户">
          <NSelect
            v-model:value="editPlatformId"
            :loading="platformLoading"
            :options="platformSettings.map((p: Api.Admin.PlatformSetting) => ({ label: p.name, value: p.id }))"
            placeholder="请选择云平台账户"
          />
        </NFormItem>

        <NFormItem label="备注">
          <NInput
            v-model:value="editRemarks"
            type="textarea"
            placeholder="请输入备注说明（可选）"
            :rows="3"
          />
        </NFormItem>

        <NFormItem label="是否公开">
          <NSwitch v-model:value="editIsPublic">
            <template #checked>是</template>
            <template #unchecked>否</template>
          </NSwitch>
          <span style="margin-left: 8px; color: #999;">公开后允许用户注册</span>
        </NFormItem>

        <NFormItem label="是否启用">
          <NSwitch v-model:value="editIsActive">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </NSwitch>
        </NFormItem>
      </NSpace>

      <template #footer>
        <NSpace :size="12">
          <NButton @click="editDomainModalVisible = false">取消</NButton>
          <NButton
            type="primary"
            :loading="editing"
            @click="handleEditDomain"
          >
            保存
          </NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 解析记录模态框 -->
    <NModal
      v-model:show="recordModalVisible"
      preset="card"
      :title="`解析记录 - ${recordDomain?.domain || ''}`"
      :bordered="false"
      class="record-modal"
      style="width: 1300px; max-width: 95vw;"
    >
      <NSpace vertical :size="16">
        <!-- 搜索和过滤 -->
        <NSpace vertical :size="12">
          <NSpace :size="12">
            <NButton type="primary" @click="openAddRecordModal">
              <template #icon>
                <icon-mdi:plus />
              </template>
              添加解析记录
            </NButton>
          </NSpace>

          <NSpace :size="12">
            <NInput
              v-model:value="recordKeyword"
              placeholder="请输入子域名搜索"
              clearable
              style="width: 200px"
              @keyup.enter="handleRecordSearch"
            />
            <NSelect
              v-model:value="recordTypeFilter"
              placeholder="记录类型"
              clearable
              style="width: 120px"
              :options="[
                { label: 'A', value: 'A' },
                { label: 'AAAA', value: 'AAAA' },
                { label: 'CNAME', value: 'CNAME' },
                { label: 'MX', value: 'MX' },
                { label: 'TXT', value: 'TXT' },
                { label: 'NS', value: 'NS' }
              ]"
            />
            <NButton type="primary" @click="handleRecordSearch">搜索</NButton>
            <NButton @click="handleRecordReset">重置</NButton>
          </NSpace>
        </NSpace>

        <!-- 解析记录表格 -->
        <NDataTable
          :columns="[
            {
              title: '主机记录',
              key: 'rr',
              width: 150,
              ellipsis: { tooltip: true }
            },
            {
              title: '记录类型',
              key: 'type',
              width: 100,
              render: (row: Api.Admin.DnsRecord) => {
                const typeMap: Record<string, string> = {
                  A: 'success',
                  CNAME: 'info',
                  TXT: 'warning',
                  MX: 'error',
                  AAAA: 'default'
                };
                return h(NTag, { type: (typeMap[row.type] as any) || 'default' }, { default: () => row.type });
              }
            },
            {
              title: '记录值',
              key: 'value',
              width: 250,
              ellipsis: { tooltip: true },
              render: (row: Api.Admin.DnsRecord) => row.value
            },
            {
              title: 'TTL',
              key: 'ttl',
              width: 80,
              render: (row: Api.Admin.DnsRecord) => row.ttl
            },
            {
              title: '线路',
              key: 'line',
              width: 100,
              render: (row: Api.Admin.DnsRecord) => row.line
            },
            {
              title: '状态',
              key: 'status',
              width: 100,
              render: (row: Api.Admin.DnsRecord) => {
                return h(NTag, { type: row.status === 'ENABLE' ? 'success' : 'default' }, { default: () => row.status === 'ENABLE' ? '启用' : '禁用' });
              }
            },
            {
              title: '更新时间',
              key: 'updatedAt',
              width: 160,
              render: (row: Api.Admin.DnsRecord) => new Date(row.updatedAt).toLocaleString('zh-CN')
            },
            {
              title: '操作',
              key: 'actions',
              width: 180,
              fixed: 'right',
              render: (row: Api.Admin.DnsRecord) => {
                return h(
                  NSpace,
                  { size: 8 },
                  {
                    default: () => [
                      h(
                        NButton,
                        {
                          size: 'small',
                          type: 'warning',
                          onClick: () => openEditRecordModal(row)
                        },
                        { default: () => '修改' }
                      ),
                      h(
                        NPopconfirm,
                        {
                          onPositiveClick: () => handleDeleteRecord(row.recordId, row.rr)
                        },
                        {
                          default: () => `确认删除解析记录 '${row.rr}' 吗？`,
                          trigger: () =>
                            h(
                              NButton,
                              {
                                size: 'small',
                                type: 'error'
                              },
                              { default: () => '删除' }
                            )
                        }
                      )
                    ]
                  }
                );
              }
            }
          ]"
          :data="dnsRecords"
          :loading="recordLoading"
          :pagination="false"
          :bordered="false"
          scroll-x="1200"
          :max-height="350"
        />
      </NSpace>

      <template #footer>
        <NSpace :size="12">
          <NButton @click="recordModalVisible = false">关闭</NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 添加/修改解析记录模态框 -->
    <NModal
      v-model:show="recordFormModalVisible"
      preset="card"
      :title="recordFormMode === 'add' ? '添加解析记录' : '修改解析记录'"
      :bordered="false"
      size="medium"
      style="max-width: 600px;"
    >
      <NSpace vertical :size="16">
        <NFormItem label="主机记录" required>
          <NInput
            v-model:value="recordForm.rr"
            placeholder="如: @, www, api"
            style="width: 100%"
          />
          <span style="margin-left: 8px; color: #999; font-size: 12px;">@表示根域名</span>
        </NFormItem>

        <NFormItem label="记录类型" required>
          <NSelect
            v-model:value="recordForm.type"
            placeholder="请选择记录类型"
            style="width: 100%"
            :options="[
              { label: 'A', value: 'A' },
              { label: 'AAAA', value: 'AAAA' },
              { label: 'CNAME', value: 'CNAME' },
              { label: 'MX', value: 'MX' },
              { label: 'TXT', value: 'TXT' },
              { label: 'NS', value: 'NS' },
              { label: 'SRV', value: 'SRV' }
            ]"
          />
        </NFormItem>

        <NFormItem label="记录值" required>
          <NInput
            v-model:value="recordForm.value"
            placeholder="请输入记录值"
            style="width: 100%"
          />
        </NFormItem>

        <NFormItem label="TTL (秒)">
          <NInputNumber
            v-model:value="recordForm.ttl"
            :min="60"
            :max="86400"
            placeholder="默认600秒"
            style="width: 100%"
          />
        </NFormItem>

        <NFormItem label="线路">
          <NInput
            v-model:value="recordForm.line"
            placeholder="默认"
            style="width: 100%"
          />
        </NFormItem>
      </NSpace>

      <template #footer>
        <NSpace :size="12">
          <NButton @click="recordFormModalVisible = false">取消</NButton>
          <NButton
            type="primary"
            :loading="recordFormLoading"
            @click="handleSaveRecord"
          >
            保存
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </NSpace>
</template>

<style scoped>
.card-wrapper {
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.domain-list {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.domain-list-header {
  padding: 12px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.domain-list-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 12px 16px;
}

.domain-list-content label {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.domain-list-content label:last-child {
  border-bottom: none;
}

.domain-name {
  flex: 1;
  margin-left: 8px;
  font-weight: 500;
}

.record-modal :deep(.n-modal-container) {
  width: 600px !important;
  max-width: 95vw !important;
}

@media (max-width: 768px) {
  .record-modal :deep(.n-modal-container) {
    width: 95vw !important;
    max-width: 95vw !important;
  }
}

.record-modal :deep(.n-card) {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.record-modal :deep(.n-card__content) {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.record-modal :deep(.n-data-table) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.record-modal :deep(.n-data-table-wrapper) {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.record-modal :deep(.n-data-table-base-table-body) {
  overflow-y: auto !important;
  max-height: 350px !important;
}
</style>
