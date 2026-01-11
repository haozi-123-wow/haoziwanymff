<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { fetchGetAdminSettings, fetchTestEmail, fetchUpdateAdminSettings } from '@/service/api/admin';
import { fetchGetCaptchaConfig, fetchValidateCaptcha } from '@/service/api/captcha';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'SystemSettingsEmail'
});

const { formRef, validate } = useNaiveForm();

interface FormModel {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
}

const model: FormModel = reactive({
  smtpHost: '',
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: ''
});

const loading = ref(false);
const saving = ref(false);
const testing = ref(false);

const captchaInstance = ref<any>(null);
const geetestId = ref('');
const isGeetestReady = ref(false);
const validate_token = ref('');

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules } = useFormRules();

  return {
    smtpHost: [{ required: true, message: '请输入SMTP服务器地址', trigger: 'blur' }],
    smtpPort: [
      {
        validator: (_rule: any, value: number) => {
          if (value === null || value === undefined || value === 0) {
            return new Error('请输入SMTP端口');
          }
          if (value < 1 || value > 65535) {
            return new Error('端口号必须在1-65535之间');
          }
          return true;
        },
        trigger: ['blur', 'change']
      }
    ],
    smtpUser: [{ required: true, message: '请输入SMTP用户名', trigger: 'blur' }],
    smtpPass: [{ required: true, message: '请输入SMTP密码', trigger: 'blur' }],
    smtpFrom: [
      { required: true, message: '请输入发件人邮箱地址', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ]
  };
});

onMounted(async () => {
  await loadSettings();
  await initGeetest();
});

function loadGeetestScript(callback: () => void) {
  const script = document.createElement('script');
  script.src = 'https://static.geetest.com/v4/gt4.js';
  script.async = true;
  script.onload = callback;
  document.head.appendChild(script);
}

async function initGeetest() {
  try {
    const { data: config, error } = await fetchGetCaptchaConfig();

    if (!error && config) {
      geetestId.value = config.captchaId;
      loadGeetestScript(() => {
        if ((window as any).initGeetest4) {
          (window as any).initGeetest4(
            {
              captchaId: config.captchaId,
              product: 'bind'
            },
            (captcha: any) => {
              captchaInstance.value = captcha;
              captcha.onReady(() => {
                isGeetestReady.value = true;
              });
              captcha.onSuccess(async () => {
                const result = captcha.getValidate();
                if (result) {
                  const { data: validateData, error: validateError } = await fetchValidateCaptcha({
                    lot_number: result.lot_number,
                    captcha_output: result.captcha_output,
                    pass_token: result.pass_token,
                    gen_time: result.gen_time
                  });

                  if (!validateError && validateData) {
                    validate_token.value = validateData.validate_token;
                    await performTestEmail();
                  }
                }
              });
              captcha.onError((err: any) => {
                console.error('Geetest error:', err);
              });
            }
          );
        }
      });
    }
  } catch (error) {
    console.error('Failed to init Geetest:', error);
  }
}

async function loadSettings() {
  try {
    loading.value = true;
    const { data, error } = await fetchGetAdminSettings();

    if (!error && data && data.smtpConfig) {
      model.smtpHost = data.smtpConfig.host || '';
      model.smtpPort = data.smtpConfig.port || 465;
      model.smtpSecure = data.smtpConfig.secure !== undefined ? data.smtpConfig.secure : true;
      model.smtpUser = data.smtpConfig.user || '';
      model.smtpPass = data.smtpConfig.pass || '';
      model.smtpFrom = data.smtpConfig.from || '';
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
    formData.append('smtpConfig[host]', model.smtpHost);
    formData.append('smtpConfig[port]', model.smtpPort.toString());
    formData.append('smtpConfig[secure]', model.smtpSecure.toString());
    formData.append('smtpConfig[user]', model.smtpUser);
    formData.append('smtpConfig[pass]', model.smtpPass);
    formData.append('smtpConfig[from]', model.smtpFrom);

    const { error } = await fetchUpdateAdminSettings(formData);

    if (!error) {
      window.$notification?.success({
        title: '成功',
        content: '邮箱设置保存成功',
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

async function handleTestEmail() {
  await validate();

  if (!isGeetestReady.value || !captchaInstance.value) {
    window.$notification?.error({
      title: '错误',
      content: '人机验证未准备好，请稍后重试',
      duration: 3000
    });
    return;
  }

  captchaInstance.value.showCaptcha();
}

async function performTestEmail() {
  try {
    testing.value = true;

    const { error } = await fetchTestEmail({
      to: model.smtpFrom,
      validate_token: validate_token.value
    });

    if (!error) {
      window.$notification?.success({
        title: '成功',
        content: '测试邮件已发送，请检查邮箱',
        duration: 3000
      });
    }
  } catch (error) {
    window.$notification?.error({
      title: '错误',
      content: '发送测试邮件失败',
      duration: 3000
    });
  } finally {
    testing.value = false;
    validate_token.value = '';
  }
}
</script>

<template>
  <NSpace vertical :size="16">
    <NCard :bordered="false" class="card-wrapper">
      <template #header>
        <span>{{ $t('route.system-settings_email') }}</span>
      </template>
      <NSpin :show="loading">
        <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" label-width="140px">
          <NFormItem label="SMTP服务器" path="smtpHost">
            <NInput v-model:value="model.smtpHost" placeholder="例如: smtp.qq.com" />
          </NFormItem>

          <NFormItem label="SMTP端口" path="smtpPort">
            <NInputNumber
              v-model:value="model.smtpPort"
              :min="1"
              :max="65535"
              :precision="0"
              :show-button="false"
              placeholder="请输入SMTP端口"
              style="width: 200px"
            />
            <template #feedback>常用端口: 25(非加密), 465(SSL), 587(TLS)</template>
          </NFormItem>

          <NFormItem label="启用SSL/TLS" path="smtpSecure">
            <NSwitch v-model:value="model.smtpSecure" />
            <template #feedback>使用SSL加密连接，建议开启</template>
          </NFormItem>

          <NFormItem label="SMTP用户名" path="smtpUser">
            <NInput v-model:value="model.smtpUser" placeholder="请输入邮箱地址" />
          </NFormItem>

          <NFormItem label="SMTP密码" path="smtpPass">
            <NInput
              v-model:value="model.smtpPass"
              type="password"
              show-password-on="click"
              placeholder="请输入邮箱密码或授权码"
            />
          </NFormItem>

          <NFormItem label="发件人邮箱" path="smtpFrom">
            <NInput v-model:value="model.smtpFrom" placeholder="请输入发件人邮箱地址" />
          </NFormItem>

          <NFormItem :show-label="false" class="mt-16px">
            <NSpace :size="12">
              <NButton type="primary" :loading="saving" @click="handleSubmit">保存设置</NButton>
              <NButton :loading="testing" @click="handleTestEmail">发送测试邮件</NButton>
              <NButton @click="loadSettings">重置</NButton>
            </NSpace>
          </NFormItem>

          <NFormItem :show-label="false">
            <div id="geetest-captcha"></div>
          </NFormItem>
        </NForm>
      </NSpin>
    </NCard>

    <NCard :bordered="false" class="card-wrapper">
      <template #header>
        <span>邮箱配置说明</span>
      </template>
      <NSpace vertical :size="12">
        <NAlert type="info" title="QQ邮箱配置">
          <div>
            <p>SMTP服务器: smtp.qq.com</p>
            <p>端口: 465 (SSL) 或 587 (TLS)</p>
            <p>需要在QQ邮箱设置中开启SMTP服务并获取授权码</p>
          </div>
        </NAlert>
        <NAlert type="info" title="163邮箱配置">
          <div>
            <p>SMTP服务器: smtp.163.com</p>
            <p>端口: 465 (SSL) 或 994 (SSL)</p>
            <p>需要在163邮箱设置中开启SMTP服务并获取授权码</p>
          </div>
        </NAlert>
        <NAlert type="info" title="Gmail配置">
          <div>
            <p>SMTP服务器: smtp.gmail.com</p>
            <p>端口: 465 (SSL) 或 587 (TLS)</p>
            <p>需要在Google账户设置中开启两步验证并生成应用专用密码</p>
          </div>
        </NAlert>
      </NSpace>
    </NCard>
  </NSpace>
</template>

<style scoped>
.card-wrapper {
  @apply rounded-8px shadow-sm;
}
</style>
