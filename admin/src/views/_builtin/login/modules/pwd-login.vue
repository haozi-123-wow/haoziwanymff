<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { loginModuleRecord } from '@/constants/app';
import { fetchGetCaptchaConfig, fetchValidateCaptcha } from '@/service/api/captcha';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'PwdLogin'
});

const authStore = useAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  email: string;
  password: string;
}

const model: FormModel = reactive({
  email: 'admin@haoziwan.cn',
  password: 'SecurePass123'
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules } = useFormRules();

  return {
    email: formRules.email,
    password: formRules.pwd
  };
});

const captchaInstance = ref<any>(null);
const validateToken = ref('');
const isGeetestReady = ref(false);
const geetestId = ref('');

onMounted(async () => {
  await initGeetest();
});

async function initGeetest() {
  try {
    console.log('开始初始化极验...');
    const { data: config, error } = await fetchGetCaptchaConfig();

    if (!error && config) {
      console.log('获取极验配置成功:', config);
      geetestId.value = config.captchaId;
      loadGeetestScript(() => {
        console.log('极验脚本加载完成');
        if ((window as any).initGeetest4) {
          console.log('开始初始化极验实例...');
          (window as any).initGeetest4(
            {
              captchaId: config.captchaId,
              product: 'bind'
            },
            (captcha: any) => {
              console.log('极验实例创建成功');
              captchaInstance.value = captcha;
              captcha.onReady(() => {
                console.log('极验准备就绪');
                isGeetestReady.value = true;
              });
              captcha.onSuccess(async () => {
                console.log('极验验证成功');
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
                    console.log('验证token已获取');
                    await performLogin();
                  }
                }
              });
              captcha.onError((err: any) => {
                console.error('Geetest error:', err);
              });
            }
          );
        } else {
          console.error('initGeetest4 函数不存在');
        }
      });
    } else {
      console.error('获取极验配置失败:', error);
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

async function performLogin() {
  await authStore.login(model.email, model.password, true, validateToken.value);
}

async function handleSubmit() {
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

type AccountKey = 'super' | 'admin' | 'user';

interface Account {
  key: AccountKey;
  label: string;
  email: string;
  password: string;
}

const accounts = computed<Account[]>(() => [
  {
    key: 'super',
    label: $t('page.login.pwdLogin.superAdmin'),
    email: 'super@example.com',
    password: '123456'
  },
  {
    key: 'admin',
    label: $t('page.login.pwdLogin.admin'),
    email: 'admin@haoziwan.cn',
    password: 'SecurePass123'
  },
  {
    key: 'user',
    label: $t('page.login.pwdLogin.user'),
    email: 'user@example.com',
    password: '123456'
  }
]);

async function handleAccountLogin(account: Account) {
  model.email = account.email;
  model.password = account.password;

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
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
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
    <NSpace vertical :size="24">
      <div class="flex-y-center justify-between">
        <NCheckbox>{{ $t('page.login.pwdLogin.rememberMe') }}</NCheckbox>
        <NButton quaternary @click="toggleLoginModule('reset-pwd')">
          {{ $t('page.login.pwdLogin.forgetPassword') }}
        </NButton>
      </div>
      <NButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
      <div class="flex-y-center justify-between gap-12px">
        <NButton class="flex-1" block @click="toggleLoginModule('code-login')">
          {{ $t(loginModuleRecord['code-login']) }}
        </NButton>
        <NButton class="flex-1" block @click="toggleLoginModule('register')">
          {{ $t(loginModuleRecord.register) }}
        </NButton>
      </div>
      <NDivider class="text-14px text-#666 !m-0">{{ $t('page.login.pwdLogin.otherAccountLogin') }}</NDivider>
      <div class="flex-center gap-12px">
        <NButton v-for="item in accounts" :key="item.key" type="primary" @click="handleAccountLogin(item)">
          {{ item.label }}
        </NButton>
      </div>
    </NSpace>
  </NForm>
</template>
