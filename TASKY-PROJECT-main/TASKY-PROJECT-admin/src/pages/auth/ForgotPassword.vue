<template>
  <div class="forgot-password-container">
    <div class="forgot-password-header">
      <h2 class="forgot-password-title">Forgot Password?</h2>
      <p class="forgot-password-subtitle">Enter your details to reset your password</p>
    </div>

    <q-form @submit="handleSubmit" class="forgot-password-form">
      <div class="form-section">
        <label class="form-label">Role</label>
        <q-select
          v-model="form.role"
          :options="roleOptions"
          outlined
          dense
          bg-color="grey-1"
          class="custom-select"
          :rules="[(val: string | null) => !!val || 'Role is required']"
        >
          <template v-slot:prepend>
            <q-icon name="person" color="grey-7" />
          </template>
        </q-select>
      </div>

      <div class="form-section">
        <label class="form-label">{{
          form.role === 'Project Manager' ? 'Manager ID' : 'Employee ID'
        }}</label>
        <q-input
          v-model="form.id"
          outlined
          dense
          bg-color="grey-1"
          placeholder="Enter your ID"
          :rules="[(val: string | null) => !!val || 'ID is required']"
        >
          <template v-slot:prepend>
            <q-icon name="badge" color="grey-7" />
          </template>
        </q-input>
      </div>

      <div class="form-section">
        <label class="form-label">Email</label>
        <q-input
          v-model="form.email"
          outlined
          dense
          bg-color="grey-1"
          placeholder="Enter your email"
          type="email"
          :rules="[
            (val: string | null) => !!val || 'Email is required',
            (val: string | null) => (val && isValidEmail(val)) || 'Invalid email format',
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="email" color="grey-7" />
          </template>
        </q-input>
      </div>

      <q-btn
        type="submit"
        label="Send Reset Link"
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
          <h3 class="success-title">Reset Link Sent!</h3>
          <p class="success-message">
            We've sent a password reset link to your email address. Please check your inbox and
            follow the instructions.
          </p>
        </q-card-section>

        <q-card-actions align="center" class="dialog-actions">
          <q-btn label="OK" color="primary" @click="handleSuccessOk" no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const showSuccessDialog = ref(false);

const form = reactive({
  role: 'Project Manager',
  id: '',
  email: '',
});

const roleOptions = ['Project Manager', 'Employee'];

const isValidEmail = (email: string | null): boolean => {
  if (!email) return false;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

const handleSubmit = async () => {
  loading.value = true;

  try {
    const role = form.role === 'Project Manager' ? 'pm' : 'employee';
    const result = await authStore.forgotPassword(role, form.id, form.email);

    if (result.success) {
      showSuccessDialog.value = true;
    } else {
      alert('Failed to send reset link: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    alert('An error occurred');
  } finally {
    loading.value = false;
  }
};

const handleSuccessOk = () => {
  showSuccessDialog.value = false;
  void router.push('/auth/reset-password');
};
</script>

<style scoped>
.forgot-password-container {
  width: 100%;
}

.forgot-password-header {
  margin-bottom: 2rem;
  text-align: center;
}

.forgot-password-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.forgot-password-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.forgot-password-form {
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

.custom-select :deep(.q-field__control) {
  border-radius: 8px;
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
