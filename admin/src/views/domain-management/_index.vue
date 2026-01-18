<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'DomainManagement'
});

const router = useRouter();

onMounted(() => {
  // 自动跳转到域名账户页面
  router.replace('/domain-management/account');
});
</script>

<template>
  <div></div>
</template>
