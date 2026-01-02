<script setup lang="ts">
defineOptions({
  name: 'SystemSettingsBasic'
});
</script>

<template>
  <NSpace vertical :size="16">
    <NCard :bordered="false" class="card-wrapper">
      <template #header>
        <span>{{ $t('route.system-settings_basic') }}</span>
      </template>
      <NSpace vertical :size="16">
        <NAlert type="info" :title="$t('common.tip')">
          {{ $t('page.system-settings.basic.description') }}
        </NAlert>
        <NEmpty :description="$t('common.lookForward')" />
      </NSpace>
    </NCard>
  </NSpace>
</template>

<style scoped></style>
