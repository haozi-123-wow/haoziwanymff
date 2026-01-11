<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'UserManagement'
});

const router = useRouter();

onMounted(() => {
  // 自动跳转到用户列表页面
  router.replace('/user-management/list');
});
</script>

<template>
  <div></div>
</template>