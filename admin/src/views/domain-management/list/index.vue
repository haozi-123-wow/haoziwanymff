<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue';
import { $t } from '@/locales';
import {
  NButton,
  NCard,
  NDataTable,
  NFormItem,
  NInput,
  NSelect,
  NSpace,
  NSwitch,
  NTag,
  NDivider,
  NCheckbox,
  NModal
} from 'naive-ui';
import {
  fetchGetPlatformSettings,
  fetchGetDomains,
  fetchGetCloudDomains,
  fetchAddDomain
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
const addPlatformId = ref<number | null>(null);
const cloudDomains = ref<Api.Admin.CloudPlatformDomain[]>([]);
const selectedDomains = ref<string[]>([]);
const addRemarks = ref('');
const addIsPublic = ref(true);

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
    aliyun: { type: 'primary' as const, label: '阿里云' },
    tencent: { type: 'success' as const, label: '腾讯云' },
    cloudflare: { type: 'warning' as const, label: 'Cloudflare' }
  };
  return providerMap[platform] || { type: 'default' as const, label: platform };
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
      size="huge"
      class="add-domain-modal"
    >
      <NSpace vertical :size="16">
        <NFormItem label="选择云平台账户" required>
          <NSelect
            v-model:value="addPlatformId"
            :loading="platformLoading"
            :options="platformSettings.map(p => ({ label: p.name, value: p.id }))"
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
  </NSpace>
</template>

<style scoped>
.card-wrapper {
  @apply rounded-8px shadow-sm;
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
</style>
