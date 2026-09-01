<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">Tasky</h1>
        <p class="login-subtitle">Sign in to your account</p>
      </div>

      <q-form @submit="handleLogin" class="login-form">
        <q-select
          v-model="form.role"
          :options="roleOptions"
          outlined
          label="Role"
          class="q-mb-md"
        />

        <q-input
          v-model="form.id"
          outlined
          :label="form.role === 'Project Manager' ? 'Manager ID' : 'Employee ID'"
          class="q-mb-md"
        />

        <q-input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          outlined
          label="Password"
          :disable="isLocked"
          class="q-mb-md"
        >
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">Security Check</div>
          <div class="row items-center q-gutter-sm">
            <q-chip color="primary" text-color="white" class="text-subtitle1">
              {{ captchaQuestion }}
            </q-chip>
            <q-input
              v-model="form.captchaAnswer"
              outlined
              dense
              label="Answer"
              style="width: 120px"
              :disable="isLocked"
            />
            <q-btn flat round dense icon="refresh" color="grey-7" @click="generateCaptcha" />
          </div>
        </div>

        <q-banner v-if="isLocked" class="q-mb-md bg-warning text-white">
          <template v-slot:avatar>
            <q-icon name="lock_clock" />
          </template>
          Too many failed attempts. Try again in {{ countdownDisplay }}
        </q-banner>

        <div class="row justify-between items-center q-mb-md">
          <q-checkbox v-model="form.rememberMe" label="Remember me" />
          <q-btn
            flat
            no-caps
            color="primary"
            label="Forgot Password?"
            @click="router.push('/auth/forgot-password')"
          />
        </div>

        <q-btn
          type="submit"
          label="Sign In"
          color="primary"
          class="full-width"
          :loading="loading"
          :disable="isLocked"
        />

        <div class="text-center q-mt-md">
          <span class="text-grey-7">Don't have an account?</span>
          <q-btn
            flat
            no-caps
            color="primary"
            label="Create Account"
            @click="showRegisterDialog = true"
          />
        </div>
      </q-form>

      <q-dialog v-model="showRegisterDialog">
        <q-card class="register-dialog">
          <q-card-section>
            <h3 class="text-h6">Choose Your Role</h3>
            <p class="text-grey-7">Select how you want to join TASKY</p>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-card
                  :class="selectedRegisterRole === 'pm' ? 'bg-primary text-white' : ''"
                  class="cursor-pointer"
                  @click="selectedRegisterRole = 'pm'"
                >
                  <q-card-section class="text-center">
                    <q-icon name="business_center" size="48px" class="q-mb-sm" />
                    <div class="text-subtitle1">Project Manager</div>
                    <div class="text-caption">Manage projects and lead teams</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-6">
                <q-card
                  :class="selectedRegisterRole === 'employee' ? 'bg-primary text-white' : ''"
                  class="cursor-pointer"
                  @click="selectedRegisterRole = 'employee'"
                >
                  <q-card-section class="text-center">
                    <q-icon name="engineering" size="48px" class="q-mb-sm" />
                    <div class="text-subtitle1">Employee</div>
                    <div class="text-caption">Join as a team member</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn
              label="Continue"
              color="primary"
              :disable="!selectedRegisterRole"
              @click="handleRegisterNavigation"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

defineOptions({
  name: 'LoginPage',
});

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const showPassword = ref(false);
const showRegisterDialog = ref(false);
const selectedRegisterRole = ref<'pm' | 'employee' | null>(null);

// Security state
const failedAttempts = ref(0);
const lockoutEndTime = ref<number | null>(null);
const countdownTimer = ref<number | null>(null);
const currentTime = ref(Date.now());
const isLocked = computed(() => lockoutEndTime.value !== null && lockoutEndTime.value > Date.now());

// Countdown display
const countdownDisplay = computed(() => {
  if (!lockoutEndTime.value) return '2:00';
  const remaining = Math.max(0, lockoutEndTime.value - currentTime.value);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const form = reactive({
  role: 'Project Manager',
  id: '',
  password: '',
  captchaAnswer: '',
  rememberMe: false,
});

const roleOptions = ['Project Manager', 'Employee'];

// CAPTCHA
const captchaQuestion = ref('');
const captchaAnswer = ref(0);

const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operators = ['+', '-', '*'];
  const operator = operators[Math.floor(Math.random() * operators.length)];

  let answer: number;
  if (operator === '+') {
    answer = num1 + num2;
  } else if (operator === '-') {
    answer = num1 - num2;
  } else {
    answer = num1 * num2;
  }

  captchaQuestion.value = `${num1} ${operator} ${num2} = ?`;
  captchaAnswer.value = answer;
  form.captchaAnswer = '';
};

// Generate initial CAPTCHA
generateCaptcha();

// Start lockout timer
const startLockout = () => {
  lockoutEndTime.value = Date.now() + 2 * 60 * 1000; // 2 minutes

  countdownTimer.value = window.setInterval(() => {
    currentTime.value = Date.now(); // Update current time to trigger reactivity

    if (!isLocked.value) {
      // Lockout expired
      lockoutEndTime.value = null;
      failedAttempts.value = 0;
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
        countdownTimer.value = null;
      }
    }
  }, 1000);
};

const handleLogin = async () => {
  if (isLocked.value) {
    return;
  }

  if (!form.id || !form.password) {
    return;
  }

  // Validate CAPTCHA
  if (parseInt(form.captchaAnswer) !== captchaAnswer.value) {
    alert('Incorrect security answer. Please try again.');
    generateCaptcha();
    return;
  }

  loading.value = true;

  try {
    // Call backend API directly
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: form.id,
        password: form.password,
      }),
    });

    const result = await response.json();
    console.log('Login result:', result);

    if (result.success && result.user) {
      // Reset failed attempts on successful login
      failedAttempts.value = 0;
      lockoutEndTime.value = null;
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
        countdownTimer.value = null;
      }

      // Store user data in authStore and localStorage
      authStore.user = result.user;
      authStore.token = 'token-' + Date.now();
      authStore.isAuthenticated = true;
      localStorage.setItem('tasky_user', JSON.stringify(result.user));
      localStorage.setItem('tasky_token', authStore.token);

      // Route based on role from database - all in same project
      if (result.user.role === 'pm') {
        void router.push('/dashboard');
      } else {
        void router.push('/employee/task-manager');
      }
    } else {
      // Increment failed attempts
      failedAttempts.value++;

      if (failedAttempts.value >= 3) {
        startLockout();
        alert('Too many failed attempts. Account locked for 2 minutes.');
      } else {
        const remainingAttempts = 3 - failedAttempts.value;
        alert(
          `Login failed: ${result.error || 'Unknown error'}. ${remainingAttempts} attempts remaining.`,
        );
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Error: ' + String(error));
  } finally {
    loading.value = false;
  }
};

const handleRegisterNavigation = () => {
  showRegisterDialog.value = false;

  if (selectedRegisterRole.value === 'pm') {
    void router.push('/auth/register/pm');
  } else if (selectedRegisterRole.value === 'employee') {
    void router.push('/auth/register/employee');
  }

  selectedRegisterRole.value = null;
};

// Lifecycle hooks
onBeforeUnmount(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }

  // Check for existing lockout from localStorage
  const savedLockout = localStorage.getItem('tasky_lockout_end');
  if (savedLockout) {
    const lockoutTime = parseInt(savedLockout);
    if (lockoutTime > Date.now()) {
      startLockout();
    } else {
      localStorage.removeItem('tasky_lockout_end');
    }
  }
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 1rem;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 600;
  color: #1976d2;
  margin: 0 0 0.5rem 0;
}

.login-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.register-dialog {
  min-width: 500px;
}
</style>
