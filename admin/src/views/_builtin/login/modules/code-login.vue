<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';
import { fetchGetCaptchaConfig, fetchValidateCaptcha } from '@/service/api/captcha';
import { fetchSendEmailCode } from '@/service/api/auth';

defineOptions({
  name: 'CodeLogin'
});

const authStore = useAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  email: string;
  code: string;
}

const model: FormModel = reactive({
  email: '',
  code: ''
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules } = useFormRules();

  return {
    email: formRules.email,
    code: formRules.code
  };
});

const captchaInstance = ref<any>(null);
const validateToken = ref('');
const isGeetestReady = ref(false);
const geetestId = ref('');
const countdown = ref(0);
const isSendingCode = ref(false);

const loginCaptchaInstance = ref<any>(null);
const loginValidateToken = ref('');
const isLoginGeetestReady = ref(false);

onMounted(async () => {
  await initGeetest();
  await initLoginGeetest();
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
                    console.log('验证token已获取，开始发送验证码');
                    await sendVerificationCode();
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

async function initLoginGeetest() {
  try {
    console.log('开始初始化登录极验...');
    const { data: config, error } = await fetchGetCaptchaConfig();
    
    if (!error && config) {
      console.log('获取登录极验配置成功:', config);
      loadGeetestScript(() => {
        console.log('登录极验脚本加载完成');
        if ((window as any).initGeetest4) {
          console.log('开始初始化登录极验实例...');
          (window as any).initGeetest4(
            {
              captchaId: config.captchaId,
              product: 'bind'
            },
            (captcha: any) => {
              console.log('登录极验实例创建成功');
              loginCaptchaInstance.value = captcha;
              captcha.onReady(() => {
                console.log('登录极验准备就绪');
                isLoginGeetestReady.value = true;
              });
              captcha.onSuccess(async () => {
                console.log('登录极验验证成功');
                const result = captcha.getValidate();
                if (result) {
                  const { data: validateData, error: validateError } = await fetchValidateCaptcha({
                    lot_number: result.lot_number,
                    captcha_output: result.captcha_output,
                    pass_token: result.pass_token,
                    gen_time: result.gen_time
                  });
                  
                  if (!validateError && validateData) {
                    loginValidateToken.value = validateData.validate_token;
                    console.log('登录验证token已获取，开始登录');
                    await performLogin();
                  }
                }
              });
              captcha.onError((err: any) => {
                console.error('登录Geetest error:', err);
              });
            }
          );
        } else {
          console.error('initGeetest4 函数不存在');
        }
      });
    } else {
      console.error('获取登录极验配置失败:', error);
    }
  } catch (error) {
    console.error('Failed to init login Geetest:', error);
  }
}

async function handleGetCode() {
  if (!model.email) {
    window.$notification?.error({
      title: '错误',
      content: '请输入邮箱地址',
      duration: 3000
    });
    return;
  }

  if (countdown.value > 0) {
    return;
  }

  if (!isGeetestReady.value || !captchaInstance.value) {
    window.$notification?.error({
      title: '错误',
      content: '极验验证未准备好，请稍后重试',
      duration: 3000
    });
    return;
  }

  captchaInstance.value.showCaptcha();
}

async function sendVerificationCode() {
  try {
    isSendingCode.value = true;
    const { error } = await fetchSendEmailCode(model.email, 'login', validateToken.value);

    if (error) {
      window.$notification?.error({
        title: '发送失败',
        content: error.message || '验证码发送失败',
        duration: 3000
      });
      return;
    }

    window.$notification?.success({
      title: '发送成功',
      content: '验证码已发送到您的邮箱',
      duration: 3000
    });

    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);

  } catch (error: any) {
    window.$notification?.error({
      title: '发送失败',
      content: error.message || '验证码发送失败',
      duration: 3000
    });
  } finally {
    isSendingCode.value = false;
  }
}

async function handleSubmit() {
  await validate();
  
  if (!model.code) {
    window.$notification?.error({
      title: '验证失败',
      content: '请输入验证码',
      duration: 3000
    });
    return;
  }

  if (!isLoginGeetestReady.value || !loginCaptchaInstance.value) {
    window.$notification?.error({
      title: '错误',
      content: '人机验证未准备好，请稍后重试',
      duration: 3000
    });
    return;
  }

  loginCaptchaInstance.value.showCaptcha();
}

async function performLogin() {
  await authStore.loginWithCode(model.email, model.code, loginValidateToken.value);
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem path="email">
      <NInput v-model:value="model.email" :placeholder="$t('form.email.required')" />
    </NFormItem>
    <NFormItem path="code">
      <div class="w-full flex-y-center gap-16px">
        <NInput v-model:value="model.code" :placeholder="$t('page.login.common.codePlaceholder')" />
        <NButton size="large" :disabled="countdown > 0" :loading="isSendingCode" @click="handleGetCode">
          {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
        </NButton>
      </div>
    </NFormItem>
    <NSpace vertical :size="18" class="w-full">
      <NButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
        {{ $t('common.confirm') }}
      </NButton>
      <NButton size="large" round block @click="toggleLoginModule('pwd-login')">
        {{ $t('page.login.common.back') }}
      </NButton>
    </NSpace>
  </NForm>
</template>

