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
  NModal,
  NPopconfirm
} from 'naive-ui';
import {
  fetchGetPlatformSettings,
  fetchAddPlatformSetting,
  fetchUpdatePlatformSetting,
  fetchDeletePlatformSetting,
  fetchUpdatePlatformSettingStatus
} from '@/service/api/admin';

defineOptions({
  name: 'DomainManagementAccount'
});

const loading = ref(false);
const saving = ref(false);

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const domainAccounts = ref<Api.Admin.PlatformSetting[]>([]);

const modalVisible = ref(false);
const modalMode = ref<'add' | 'edit'>('add');
const editingId = ref<number>(0);

const formData = reactive({
  name: '',
  platform: 'aliyun' as 'aliyun' | 'tencent' | 'cloudflare',
  accessKeyId: '',
  accessKeySecret: '',
  isActive: true
});

onMounted(() => {
  loadDomainAccounts();
});

async function loadDomainAccounts() {
  try {
    loading.value = true;
    const { data, error } = await fetchGetPlatformSettings({
      page: pagination.page,
      pageSize: pagination.pageSize
    });

    if (!error && data) {
      domainAccounts.value = data.list;
      pagination.total = data.total;
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '加载域名账户列表失败',
      duration: 3000
    });
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page: number) {
  pagination.page = page;
  loadDomainAccounts();
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  loadDomainAccounts();
}

function openAddModal() {
  modalMode.value = 'add';
  editingId.value = 0;
  resetForm();
  modalVisible.value = true;
}

function openEditModal(account: Api.Admin.PlatformSetting) {
  modalMode.value = 'edit';
  editingId.value = account.id;
  Object.assign(formData, {
    name: account.name,
    platform: account.platform,
    accessKeyId: account.accessKeyId,
    accessKeySecret: account.accessKeySecret || '',
    isActive: account.isActive
  });
  modalVisible.value = true;
}

async function handleSave() {
  if (!formData.name || !formData.accessKeyId) {
    window.$notification?.error({
      title: '错误',
      content: '请填写完整信息',
      duration: 3000
    });
    return false;
  }

  if ((formData.platform === 'aliyun' || formData.platform === 'tencent') && !formData.accessKeySecret) {
    window.$notification?.error({
      title: '错误',
      content: '请填写 Access Key Secret',
      duration: 3000
    });
    return false;
  }

  try {
    saving.value = true;

    if (modalMode.value === 'add') {
      const { error } = await fetchAddPlatformSetting({
        name: formData.name,
        platform: formData.platform,
        accessKeyId: formData.accessKeyId,
        accessKeySecret: formData.accessKeySecret,
        isActive: formData.isActive
      });

      if (!error) {
        window.$notification?.success({
          title: '成功',
          content: '域名账户添加成功',
          duration: 3000
        });
        modalVisible.value = false;
        await loadDomainAccounts();
      }
    } else {
      const { error } = await fetchUpdatePlatformSetting(editingId.value, {
        name: formData.name,
        accessKeyId: formData.accessKeyId,
        accessKeySecret: formData.accessKeySecret,
        isActive: formData.isActive
      });

      if (!error) {
        window.$notification?.success({
          title: '成功',
          content: '域名账户更新成功',
          duration: 3000
        });
        modalVisible.value = false;
        await loadDomainAccounts();
      }
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: modalMode.value === 'add' ? '域名账户添加失败' : '域名账户更新失败',
      duration: 3000
    });
  } finally {
    saving.value = false;
  }
}

async function handleDelete(id: number) {
  try {
    const { error } = await fetchDeletePlatformSetting(id);

    if (!error) {
      window.$notification?.success({
        title: '成功',
        content: '域名账户删除成功',
        duration: 3000
      });
      await loadDomainAccounts();
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '域名账户删除失败',
      duration: 3000
    });
  }
}

async function handleToggleStatus(account: Api.Admin.PlatformSetting) {
  try {
    const { error } = await fetchUpdatePlatformSettingStatus(account.id, {
      isActive: !account.isActive
    });

    if (!error) {
      window.$notification?.success({
        title: '成功',
        content: '状态更新成功',
        duration: 3000
      });
      await loadDomainAccounts();
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '状态更新失败',
      duration: 3000
    });
  }
}

function resetForm() {
  Object.assign(formData, {
    name: '',
    platform: 'aliyun' as 'aliyun' | 'tencent' | 'cloudflare',
    accessKeyId: '',
    accessKeySecret: '',
    isActive: true
  });
}

function getProviderTag(provider: string) {
  const providerMap: Record<string, { type: string; label: string }> = {
    aliyun: { type: 'primary', label: '阿里云' },
    tencent: { type: 'success', label: '腾讯云' },
    cloudflare: { type: 'warning', label: 'Cloudflare' }
  };
  return providerMap[provider] || { type: 'default', label: provider };
}
</script>

<template>
  <NSpace vertical :size="16">
    <NCard :bordered="false" class="card-wrapper">
      <template #header>
        <span>{{ $t('route.domain-management_account') }}</span>
      </template>

      <NSpace vertical :size="16">
        <!-- 操作栏 -->
        <NSpace :size="12">
          <NButton type="primary" @click="openAddModal">
            <template #icon>
              <icon-mdi:plus />
            </template>
            添加账户
          </NButton>
        </NSpace>

        <!-- 域名账户列表表格 -->
        <NDataTable
          :columns="[
            {
              title: 'ID',
              key: 'id',
              width: 80,
              ellipsis: { tooltip: true }
            },
            {
              title: '账户名称',
              key: 'name',
              width: 150,
              ellipsis: { tooltip: true }
            },
            {
              title: '服务商',
              key: 'platform',
              width: 120,
              render: row => {
                const tag = getProviderTag(row.platform);
                return h(NTag, { type: tag.type }, { default: () => tag.label });
              }
            },
            {
              title: 'Access Key ID',
              key: 'accessKeyId',
              width: 200,
              ellipsis: { tooltip: true }
            },
            {
              title: '域名数量',
              key: 'domainCount',
              width: 100,
              render: row => row.domainCount || 0
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
              width: 200,
              fixed: 'right',
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
                          type: row.isActive ? 'warning' : 'success',
                          onClick: () => handleToggleStatus(row)
                        },
                        { default: () => (row.isActive ? '禁用' : '启用') }
                      ),
                      h(
                        NButton,
                        {
                          size: 'small',
                          type: 'primary',
                          onClick: () => openEditModal(row)
                        },
                        { default: () => '编辑' }
                      ),
                      h(
                        NPopconfirm,
                        {
                          onPositiveClick: () => handleDelete(row.id)
                        },
                        {
                          default: () => '确认删除此账户？',
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
          :data="domainAccounts"
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
          scroll-x="1200"
        />
      </NSpace>
    </NCard>

    <!-- 添加/编辑模态框 -->
    <NModal
      v-model:show="modalVisible"
      preset="dialog"
      :title="modalMode === 'add' ? '添加域名账户' : '编辑域名账户'"
      :positive-text="saving ? '保存中...' : '确认'"
      negative-text="取消"
      :loading="saving"
      @positive-click="handleSave"
    >
      <NSpace vertical :size="16" style="padding-top: 16px">
        <NFormItem label="账户名称" required>
          <NInput v-model:value="formData.name" placeholder="请输入账户名称" />
        </NFormItem>

        <NFormItem label="服务商" required>
          <NSelect
            v-model:value="formData.platform"
            :disabled="modalMode === 'edit'"
            :options="[
              { label: '阿里云', value: 'aliyun' },
              { label: '腾讯云', value: 'tencent' },
              { label: 'Cloudflare', value: 'cloudflare' }
            ]"
          />
        </NFormItem>

        <NFormItem v-if="formData.platform === 'aliyun' || formData.platform === 'tencent'" label="Access Key ID" required>
          <NInput v-model:value="formData.accessKeyId" placeholder="请输入 Access Key ID" />
        </NFormItem>

        <NFormItem
          v-if="formData.platform === 'aliyun' || formData.platform === 'tencent'"
          label="Access Key Secret"
          required
        >
          <NInput v-model:value="formData.accessKeySecret" type="password" placeholder="请输入 Access Key Secret" />
        </NFormItem>

        <NFormItem v-if="formData.platform === 'cloudflare'" label="API Token" required>
          <NInput v-model:value="formData.accessKeyId" type="password" placeholder="请输入 API Token" />
        </NFormItem>

        <NFormItem label="状态">
          <NSwitch v-model:value="formData.isActive">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </NSwitch>
        </NFormItem>
      </NSpace>
    </NModal>
  </NSpace>
</template>

<style scoped>
.card-wrapper {
  @apply rounded-8px shadow-sm;
}
</style>
