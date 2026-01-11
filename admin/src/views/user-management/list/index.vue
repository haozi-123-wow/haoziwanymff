<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue';
import { fetchGetUsers, fetchUpdateUserStatus } from '@/service/api/admin';
import { $t } from '@/locales';
import { NButton, NTag } from 'naive-ui';

defineOptions({
  name: 'UserManagementList'
});

const loading = ref(false);
const updating = ref(false);
const searchKeyword = ref('');

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const users = ref<Api.Admin.User[]>([]);

const statusModalVisible = ref(false);
const statusModalUserId = ref<string>('');
const statusModalForm = reactive({
  isActive: true,
  isBanned: false,
  banReason: ''
});

onMounted(() => {
  loadUsers();
});

async function loadUsers() {
  try {
    loading.value = true;
    const { data, error } = await fetchGetUsers({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value || undefined
    });

    if (!error && data) {
      users.value = data.list;
      pagination.total = data.total;
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '加载用户列表失败',
      duration: 3000
    });
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.page = 1;
  loadUsers();
}

function handleReset() {
  searchKeyword.value = '';
  pagination.page = 1;
  loadUsers();
}

function handlePageChange(page: number) {
  pagination.page = page;
  loadUsers();
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  loadUsers();
}

function openStatusModal(user: Api.Admin.User) {
  statusModalUserId.value = user.id;
  statusModalForm.isActive = user.isActive;
  statusModalForm.isBanned = user.isBanned;
  statusModalForm.banReason = user.banReason || '';
  statusModalVisible.value = true;
}

async function handleUpdateStatus() {
  if (statusModalForm.isBanned && !statusModalForm.banReason) {
    window.$notification?.error({
      title: '错误',
      content: '封禁用户时必须提供封禁原因',
      duration: 3000
    });
    return;
  }

  try {
    updating.value = true;
    const { error } = await fetchUpdateUserStatus(statusModalUserId.value, {
      isActive: statusModalForm.isActive,
      isBanned: statusModalForm.isBanned,
      banReason: statusModalForm.isBanned ? statusModalForm.banReason : ''
    });

    if (!error) {
      window.$notification?.success({
        title: '成功',
        content: '用户状态更新成功',
        duration: 3000
      });
      statusModalVisible.value = false;
      await loadUsers();
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '更新用户状态失败',
      duration: 3000
    });
  } finally {
    updating.value = false;
  }
}

function getStatusTag(user: Api.Admin.User) {
  if (user.isBanned) {
    return { type: 'error', label: '已封禁' };
  }
  if (user.isActive) {
    return { type: 'success', label: '已激活' };
  }
  return { type: 'warning', label: '未激活' };
}

function getRoleTag(role: string) {
  if (role === 'admin') {
    return { type: 'error', label: '管理员' };
  }
  return { type: 'default', label: '普通用户' };
}
</script>

<template>
  <NSpace vertical :size="16">
    <NCard :bordered="false" class="card-wrapper">
      <template #header>
        <span>{{ $t('route.user-management_list') }}</span>
      </template>

      <NSpace vertical :size="16">
        <!-- 搜索栏 -->
        <NSpace :size="12">
          <NInput
            v-model:value="searchKeyword"
            placeholder="请输入用户名或邮箱搜索"
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

        <!-- 用户列表表格 -->
        <NDataTable
          :columns="[
            {
              title: 'ID',
              key: 'id',
              width: 80,
              ellipsis: { tooltip: true }
            },
            {
              title: '用户名',
              key: 'username',
              width: 150,
              ellipsis: { tooltip: true }
            },
            {
              title: '邮箱',
              key: 'email',
              width: 200,
              ellipsis: { tooltip: true }
            },
            {
              title: '角色',
              key: 'role',
              width: 100,
              render: row => {
                const tag = getRoleTag(row.role);
                return h(NTag, { type: tag.type }, { default: () => tag.label });
              }
            },
            {
              title: '状态',
              key: 'status',
              width: 100,
              render: row => {
                const tag = getStatusTag(row);
                return h(NTag, { type: tag.type }, { default: () => tag.label });
              }
            },
            {
              title: '封禁原因',
              key: 'banReason',
              width: 200,
              ellipsis: { tooltip: true },
              render: row => row.banReason || '-'
            },
            {
              title: '注册时间',
              key: 'createdAt',
              width: 180,
              render: row => new Date(row.createdAt).toLocaleString('zh-CN')
            },
            {
              title: '操作',
              key: 'actions',
              width: 100,
              fixed: 'right',
              render: row => {
                return h(
                  NButton,
                  {
                    size: 'small',
                    type: 'primary',
                    onClick: () => openStatusModal(row)
                  },
                  { default: () => '编辑状态' }
                );
              }
            }
          ]"
          :data="users"
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

    <!-- 用户状态编辑模态框 -->
    <NModal
      v-model:show="statusModalVisible"
      preset="dialog"
      title="编辑用户状态"
      :positive-text="updating ? '更新中...' : '确认更新'"
      negative-text="取消"
      :loading="updating"
      @positive-click="handleUpdateStatus"
    >
      <NSpace vertical :size="16" style="padding-top: 16px">
        <NFormItem label="激活状态">
          <NSwitch v-model:value="statusModalForm.isActive">
            <template #checked>已激活</template>
            <template #unchecked>未激活</template>
          </NSwitch>
        </NFormItem>

        <NFormItem label="封禁状态">
          <NSwitch v-model:value="statusModalForm.isBanned">
            <template #checked>已封禁</template>
            <template #unchecked>未封禁</template>
          </NSwitch>
        </NFormItem>

        <NFormItem v-if="statusModalForm.isBanned" label="封禁原因" required>
          <NInput v-model:value="statusModalForm.banReason" type="textarea" placeholder="请输入封禁原因" :rows="3" />
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
