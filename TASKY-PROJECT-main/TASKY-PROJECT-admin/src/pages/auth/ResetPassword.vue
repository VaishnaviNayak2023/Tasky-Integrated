<template>
  <div class="reset-password-container">
    <div class="reset-password-header">
      <h2 class="reset-password-title">Reset Password</h2>
      <p class="reset-password-subtitle">Create a new secure password</p>
    </div>

    <q-form @submit="handleSubmit" class="reset-password-form">
      <div class="form-section">
        <label class="form-label">New Password</label>
        <q-input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          outlined
          dense
          bg-color="grey-1"
          placeholder="Enter your new password"
          @update:model-value="checkPasswordStrength"
          :rules="[
            (val: string | null) => !!val || 'Password is required',
            (val: string | null) =>
              (val && val.length >= 8) || 'Password must be at least 8 characters',
            (val: string | null) =>
              (val && hasUpperCase(val)) || 'Password must contain uppercase letter',
            (val: string | null) =>
              (val && hasLowerCase(val)) || 'Password must contain lowercase letter',
            (val: string | null) => (val && hasNumber(val)) || 'Password must contain a number',
            (val: string | null) =>
              (val && hasSpecialChar(val)) || 'Password must contain special character',
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="lock" color="grey-7" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
              color="grey-7"
            />
          </template>
        </q-input>

        <!-- Password Strength Indicator -->
        <div class="password-strength" v-if="form.password">
          <div class="strength-bar">
            <div
              class="strength-fill"
              :class="strengthClass"
              :style="{ width: strengthPercentage + '%' }"
            ></div>
          </div>
          <p class="strength-text" :class="strengthClass">{{ strengthText }}</p>
        </div>
      </div>

      <div class="form-section">
        <label class="form-label">Confirm Password</label>
        <q-input
          v-model="form.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          outlined
          dense
          bg-color="grey-1"
          placeholder="Confirm your new password"
          :rules="[
            (val: string | null) => !!val || 'Please confirm your password',
            (val: string | null) => val === form.password || 'Passwords do not match',
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="lock_outline" color="grey-7" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showConfirmPassword = !showConfirmPassword"
              color="grey-7"
            />
          </template>
        </q-input>
      </div>

      <q-btn
        type="submit"
        label="Reset Password"
        class="submit-button"
        :loading="loading"
        no-caps
      />

      <div class="form-footer">
        <q-btn
          flat
          no-caps
          dense
          color="grey-7"
          icon="arrow_back"
          label="Back to Login"
          class="back-link"
          @click="router.push('/auth/login')"
        />
      </div>
    </q-form>

    <!-- Success Dialog -->
    <q-dialog v-model="showSuccessDialog">
      <q-card class="success-dialog">
        <q-card-section class="success-content">
          <div class="success-icon">
            <q-icon name="check_circle" size="64px" color="positive" />
          </div>
          <h3 class="success-title">Password Reset Successful!</h3>
          <p class="success-message">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
        </q-card-section>

        <q-card-actions align="center" class="dialog-actions">
          <q-btn label="Go to Login" color="primary" @click="handleSuccessOk" no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordStrength = ref(0);
const showSuccessDialog = ref(false);

const form = reactive({
  password: '',
  confirmPassword: '',
});

const hasUpperCase = (password: string | null): boolean =>
  password ? /[A-Z]/.test(password) : false;
const hasLowerCase = (password: string | null): boolean =>
  password ? /[a-z]/.test(password) : false;
const hasNumber = (password: string | null): boolean => (password ? /\d/.test(password) : false);
const hasSpecialChar = (password: string | null): boolean =>
  password ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : false;

const checkPasswordStrength = () => {
  let strength = 0;
  if (form.password.length >= 8) strength++;
  if (hasUpperCase(form.password)) strength++;
  if (hasLowerCase(form.password)) strength++;
  if (hasNumber(form.password)) strength++;
  if (hasSpecialChar(form.password)) strength++;
  passwordStrength.value = strength;
};

const strengthPercentage = computed(() => (passwordStrength.value / 5) * 100);

const strengthClass = computed(() => {
  if (passwordStrength.value <= 2) return 'weak';
  if (passwordStrength.value <= 3) return 'medium';
  return 'strong';
});

const strengthText = computed(() => {
  if (passwordStrength.value <= 2) return 'Weak password';
  if (passwordStrength.value <= 3) return 'Medium strength';
  return 'Strong password';
});

const handleSubmit = async () => {
  loading.value = true;

  try {
    const result = await authStore.resetPassword();

    if (result.success) {
      showSuccessDialog.value = true;
    } else {
      alert('Failed to reset password: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Reset password error:', error);
    alert('An error occurred');
  } finally {
    loading.value = false;
  }
};

const handleSuccessOk = () => {
  showSuccessDialog.value = false;
  void router.push('/auth/login');
};
</script>

<style scoped>
.reset-password-container {
  width: 100%;
}

.reset-password-header {
  margin-bottom: 2rem;
  text-align: center;
}

.reset-password-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.reset-password-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.reset-password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-fill.weak {
  background: #ef4444;
}

.strength-fill.medium {
  background: #f59e0b;
}

.strength-fill.strong {
  background: #10b981;
}

.strength-text {
  font-size: 0.75rem;
  margin: 0;
  font-weight: 500;
}

.strength-text.weak {
  color: #ef4444;
}

.strength-text.medium {
  color: #f59e0b;
}

.strength-text.strong {
  color: #10b981;
}

.submit-button {
  background: linear-gradient(135deg, #c4f64f 0%, #9ae634 100%);
  color: #1a1a2e;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.875rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(196, 246, 79, 0.3);
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.back-link {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Dialog Styles */
.success-dialog {
  min-width: 400px;
  border-radius: 16px;
}

.success-content {
  text-align: center;
  padding: 2rem 1.5rem;
}

.success-icon {
  margin-bottom: 1rem;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.75rem 0;
}

.success-message {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.dialog-actions {
  padding: 0 1.5rem 1.5rem;
}

/* Responsive */
@media (max-width: 600px) {
  .success-dialog {
    min-width: auto;
    width: 90vw;
    max-width: 350px;
  }
}
</style>
