<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchGetAdminSettings, fetchUpdateAdminSettings } from '@/service/api/admin';

defineOptions({
  name: 'SystemSettingsBasic'
});

const authStore = useAuthStore();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  siteAnnouncement: string;
  siteLogo: string;
  siteFavicon: string;
  loginLogo: string;
  adminQQ: string;
  qqGroupLink: string;
}

const model: FormModel = reactive({
  siteName: '',
  siteTitle: '',
  siteDescription: '',
  siteKeywords: '',
  siteAnnouncement: '',
  siteLogo: '',
  siteFavicon: '',
  loginLogo: '',
  adminQQ: '',
  qqGroupLink: ''
});

const loading = ref(false);
const saving = ref(false);
const uploadRef = ref<any>(null);

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules } = useFormRules();

  return {
    siteName: [
      { required: true, message: '请输入网站名称', trigger: 'blur' },
      { max: 100, message: '网站名称不能超过100个字符', trigger: 'blur' }
    ],
    siteTitle: [
      { required: true, message: '请输入网站标题', trigger: 'blur' },
      { max: 200, message: '网站标题不能超过200个字符', trigger: 'blur' }
    ],
    siteDescription: [
      { max: 500, message: '网站描述不能超过500个字符', trigger: 'blur' }
    ],
    siteKeywords: [
      { max: 200, message: '网站关键词不能超过200个字符', trigger: 'blur' }
    ],
    siteAnnouncement: [
      { max: 1000, message: '网站公告不能超过1000个字符', trigger: 'blur' }
    ],
    adminQQ: [
      { pattern: /^[1-9][0-9]{4,10}$/, message: '请输入正确的QQ号码', trigger: 'blur' }
    ],
    qqGroupLink: [
      { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }
    ]
  };
});

onMounted(async () => {
  await loadSettings();
});

async function loadSettings() {
  try {
    loading.value = true;
    const { data, error } = await fetchGetAdminSettings();
    
    if (!error && data) {
      Object.assign(model, data);
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '加载设置失败',
      duration: 3000
    });
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  await validate();
  
  try {
    saving.value = true;
    
    const formData = new FormData();
    formData.append('siteName', model.siteName);
    formData.append('siteTitle', model.siteTitle);
    formData.append('siteDescription', model.siteDescription);
    formData.append('siteKeywords', model.siteKeywords);
    formData.append('siteAnnouncement', model.siteAnnouncement);
    formData.append('adminQQ', model.adminQQ);
    formData.append('qqGroupLink', model.qqGroupLink);
    
    const { error } = await fetchUpdateAdminSettings(formData);
    
    if (!error) {
      window.$notification?.success({
        title: '成功',
        content: '设置保存成功',
        duration: 3000
      });
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '保存设置失败',
      duration: 3000
    });
  } finally {
    saving.value = false;
  }
}

function beforeUpload(data: { file: File }) {
  const file = data.file;
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    window.$notification?.error({
      title: '错误',
      content: '只能上传图片文件',
      duration: 3000
    });
    return false;
  }
  if (!isLt2M) {
    window.$notification?.error({
      title: '错误',
      content: '图片大小不能超过2MB',
      duration: 3000
    });
    return false;
  }
  return true;
}

async function handleSiteLogoUpload({ file }: { file: File }) {
  try {
    const formData = new FormData();
    formData.append('siteLogo', file);
    
    const { error } = await fetchUpdateAdminSettings(formData);
    
    if (!error) {
      window.$notification?.success({
        title: '成功',
        content: '网站LOGO上传成功',
        duration: 3000
      });
      await loadSettings();
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '网站LOGO上传失败',
      duration: 3000
    });
  }
}

async function handleSiteFaviconUpload({ file }: { file: File }) {
  try {
    const formData = new FormData();
    formData.append('siteFavicon', file);
    
    const { error } = await fetchUpdateAdminSettings(formData);
    
    if (!error) {
      window.$notification?.success({
        title: '成功',
        content: '网站图标上传成功',
        duration: 3000
      });
      await loadSettings();
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '网站图标上传失败',
      duration: 3000
    });
  }
}

async function handleLoginLogoUpload({ file }: { file: File }) {
  try {
    const formData = new FormData();
    formData.append('loginLogo', file);
    
    const { error } = await fetchUpdateAdminSettings(formData);
    
    if (!error) {
      window.$notification?.success({
        title: '成功',
        content: '登录页LOGO上传成功',
        duration: 3000
      });
      await loadSettings();
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '登录页LOGO上传失败',
      duration: 3000
    });
  }
}
</script>

<template>
  <NSpace vertical :size="16">
    <NCard :bordered="false" class="card-wrapper">
      <template #header>
        <span>{{ $t('route.system-settings_basic') }}</span>
      </template>
      <NSpin :show="loading">
        <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" label-width="120px">
          <NGrid :x-gap="24" :y-gap="24" :cols="2" responsive="screen">
            <NFormItemGi :span="2" label="网站名称" path="siteName">
              <NInput v-model:value="model.siteName" placeholder="请输入网站名称" />
            </NFormItemGi>
            
            <NFormItemGi :span="2" label="网站标题" path="siteTitle">
              <NInput v-model:value="model.siteTitle" placeholder="请输入网站标题" />
            </NFormItemGi>
            
            <NFormItemGi :span="2" label="网站描述" path="siteDescription">
              <NInput
                v-model:value="model.siteDescription"
                type="textarea"
                :rows="3"
                placeholder="请输入网站描述"
              />
            </NFormItemGi>
            
            <NFormItemGi :span="2" label="网站关键词" path="siteKeywords">
              <NInput v-model:value="model.siteKeywords" placeholder="请输入网站关键词，多个关键词用逗号分隔" />
            </NFormItemGi>
            
            <NFormItemGi :span="2" label="网站公告" path="siteAnnouncement">
              <NInput
                v-model:value="model.siteAnnouncement"
                type="textarea"
                :rows="4"
                placeholder="请输入网站公告"
              />
            </NFormItemGi>
            
            <NFormItemGi :span="1" label="网站LOGO">
              <NSpace vertical :size="8">
                <NUpload
                  :max="1"
                  accept="image/*"
                  :before-upload="beforeUpload"
                  @change="handleSiteLogoUpload"
                >
                  <NButton>选择图片</NButton>
                </NUpload>
                <NImage
                  v-if="model.siteLogo"
                  :src="model.siteLogo"
                  width="200"
                  height="80"
                  object-fit="contain"
                  preview-disabled
                />
              </NSpace>
            </NFormItemGi>
            
            <NFormItemGi :span="1" label="网站图标">
              <NSpace vertical :size="8">
                <NUpload
                  :max="1"
                  accept="image/*"
                  :before-upload="beforeUpload"
                  @change="handleSiteFaviconUpload"
                >
                  <NButton>选择图片</NButton>
                </NUpload>
                <NImage
                  v-if="model.siteFavicon"
                  :src="model.siteFavicon"
                  width="32"
                  height="32"
                  object-fit="contain"
                  preview-disabled
                />
              </NSpace>
            </NFormItemGi>
            
            <NFormItemGi :span="2" label="登录页LOGO">
              <NSpace vertical :size="8">
                <NUpload
                  :max="1"
                  accept="image/*"
                  :before-upload="beforeUpload"
                  @change="handleLoginLogoUpload"
                >
                  <NButton>选择图片</NButton>
                </NUpload>
                <NImage
                  v-if="model.loginLogo"
                  :src="model.loginLogo"
                  width="200"
                  height="80"
                  object-fit="contain"
                  preview-disabled
                />
              </NSpace>
            </NFormItemGi>
            
            <NFormItemGi label="站长QQ" path="adminQQ">
              <NInput v-model:value="model.adminQQ" placeholder="请输入站长QQ" />
            </NFormItemGi>
            
            <NFormItemGi label="QQ群链接" path="qqGroupLink">
              <NInput v-model:value="model.qqGroupLink" placeholder="请输入QQ群链接" />
            </NFormItemGi>
          </NGrid>
          
          <NFormItem :show-label="false" class="mt-16px">
            <NSpace :size="12">
              <NButton type="primary" :loading="saving" @click="handleSubmit">
                保存设置
              </NButton>
              <NButton @click="loadSettings">
                重置
              </NButton>
            </NSpace>
          </NFormItem>
        </NForm>
      </NSpin>
    </NCard>
  </NSpace>
</template>

<style scoped>
.card-wrapper {
  @apply rounded-8px shadow-sm;
}
</style>
