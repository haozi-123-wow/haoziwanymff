<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchRegister } from '@/service/api/auth';
import { fetchGetCaptchaConfig, fetchValidateCaptcha } from '@/service/api/captcha';

defineOptions({
  name: 'Register'
});

const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  username: string;
  email: string;
  password: string;
}

const model: FormModel = reactive({
  username: '',
  email: '',
  password: ''
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules } = useFormRules();

  return {
    username: [
      { required: true, message: $t('form.username.required'), trigger: 'blur' },
      { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: $t('form.username.pattern'), trigger: 'blur' }
    ],
    email: formRules.email,
    password: formRules.pwd
  };
});

const geetestContainer = ref<HTMLElement | null>(null);
const captchaInstance = ref<any>(null);
const validateToken = ref('');
const isGeetestReady = ref(false);

onMounted(async () => {
  await initGeetest();
});

async function initGeetest() {
  try {
    const { data: config, error } = await fetchGetCaptchaConfig();
    
    if (!error && config) {
      loadGeetestScript(() => {
        if ((window as any).initGeetest4) {
          (window as any).initGeetest4(
            {
              captchaId: config.captchaId,
              product: 'float'
            },
            (captcha: any) => {
              captchaInstance.value = captcha;
              captcha.onReady(() => {
                isGeetestReady.value = true;
                nextTick(() => {
                  if (geetestContainer.value) {
                    captcha.appendTo(geetestContainer.value);
                  }
                });
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
                    validateToken.value = validateData.validate_token;
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

function loadGeetestScript(callback: () => void) {
  const script = document.createElement('script');
  script.src = 'https://static.geetest.com/v4/gt4.js';
  script.async = true;
  script.onload = callback;
  document.head.appendChild(script);
}

async function handleSubmit() {
  await validate();
  
  if (!validateToken.value) {
    window.$notification?.error({
      title: '验证失败',
      content: '请先完成人机验证',
      duration: 3000
    });
    return;
  }
  
  const { error } = await fetchRegister(model.username, model.email, model.password, validateToken.value);
  
  if (!error) {
    window.$message?.success($t('page.login.common.validateSuccess'));
  }
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem path="username">
      <NInput v-model:value="model.username" :placeholder="$t('form.username.required')" />
    </NFormItem>
    <NFormItem path="email">
      <NInput v-model:value="model.email" :placeholder="$t('form.email.required')" />
    </NFormItem>
    <NFormItem path="password">
      <NInput
        v-model:value="model.password"
        type="password"
        show-password-on="click"
        :placeholder="$t('page.login.common.passwordPlaceholder')"
      />
    </NFormItem>
    <NFormItem>
      <div ref="geetestContainer" id="geetest-captcha" class="geetest-container"></div>
    </NFormItem>
    <NSpace vertical :size="18" class="w-full">
      <NButton type="primary" size="large" round block @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
      <NButton size="large" round block @click="toggleLoginModule('pwd-login')">
        {{ $t('page.login.common.back') }}
      </NButton>
    </NSpace>
  </NForm>
</template>

<style scoped>
.geetest-container {
  width: 100%;
  min-height: 44px;
}
</style>
