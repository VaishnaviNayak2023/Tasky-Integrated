<template>
  <div class="register-container">
    <div class="register-header">
      <h2 class="register-title">Create Account</h2>
      <p class="register-subtitle">Register as a Project Manager</p>
    </div>

    <div class="register-form">
      <div class="form-row">
        <div class="form-section">
          <label class="form-label">First Name</label>
          <q-input v-model="form.firstName" outlined dense bg-color="grey-1" placeholder="John">
            <template v-slot:prepend>
              <q-icon name="person" color="grey-7" />
            </template>
          </q-input>
        </div>

        <div class="form-section">
          <label class="form-label">Surname</label>
          <q-input v-model="form.surname" outlined dense bg-color="grey-1" placeholder="Doe">
            <template v-slot:prepend>
              <q-icon name="person_outline" color="grey-7" />
            </template>
          </q-input>
        </div>
      </div>

      <div class="form-section">
        <label class="form-label">Email</label>
        <q-input
          v-model="form.email"
          outlined
          dense
          bg-color="grey-1"
          placeholder="john.doe@example.com"
        >
          <template v-slot:prepend>
            <q-icon name="email" color="grey-7" />
          </template>
        </q-input>
      </div>

      <div class="form-section">
        <label class="form-label">Phone</label>
        <q-input
          v-model="form.phone"
          outlined
          dense
          bg-color="grey-1"
          placeholder="1234567890"
          type="tel"
          mask="##########"
        >
          <template v-slot:prepend>
            <q-icon name="phone" color="grey-7" />
          </template>
        </q-input>
      </div>

      <div class="form-section">
        <label class="form-label">Organisation Name (if creating a new organisation)</label>
        <q-input
          v-model="form.organisationName"
          outlined
          dense
          bg-color="grey-1"
          placeholder="Enter organisation name"
        >
          <template v-slot:prepend>
            <q-icon name="domain" color="grey-7" />
          </template>
        </q-input>
      </div>

      <div class="form-section">
        <label class="form-label">Invite Code (Optional - to join existing organisation)</label>
        <q-input
          v-model="form.inviteCode"
          outlined
          dense
          bg-color="grey-1"
          placeholder="Enter invite code"
        >
          <template v-slot:prepend>
            <q-icon name="key" color="grey-7" />
          </template>
        </q-input>
      </div>

      <div class="form-section">
        <label class="form-label">Manager ID</label>
        <q-input v-model="form.managerId" outlined dense bg-color="grey-1" placeholder="PM001">
          <template v-slot:prepend>
            <q-icon name="badge" color="grey-7" />
          </template>
        </q-input>
      </div>

      <div class="form-section">
        <label class="form-label">Password</label>
        <q-input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          outlined
          dense
          bg-color="grey-1"
          placeholder="Create a strong password"
          @update:model-value="checkPasswordStrength"
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
          placeholder="Confirm your password"
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

      <div class="form-section">
        <q-checkbox v-model="form.agreeTerms" dense color="green-7">
          <span class="terms-text">
            I agree to the <a href="#" class="terms-link">Terms of Service</a> and
            <a href="#" class="terms-link">Privacy Policy</a>
          </span>
        </q-checkbox>
      </div>

      <q-btn
        label="Create Account"
        class="register-button"
        :loading="loading"
        no-caps
        @click="handleRegister"
      />

      <div class="form-footer">
        <p class="footer-text">
          Already have an account?
          <q-btn
            flat
            no-caps
            dense
            color="primary"
            label="Sign In"
            class="signin-link"
            @click="router.push('/auth/login')"
          />
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordStrength = ref(0);

const form = reactive({
  firstName: '',
  surname: '',
  email: '',
  phone: '',
  organisationName: '',
  inviteCode: '',
  managerId: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
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

const handleRegister = async () => {
  if (!form.agreeTerms) {
    alert('You must agree to the Terms of Service and Privacy Policy');
    return;
  }

  if (form.password !== form.confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  loading.value = true;

  try {
    const response = await fetch('http://localhost:3001/api/auth/register/pm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: form.firstName,
        surname: form.surname,
        email: form.email,
        phone: form.phone,
        managerId: form.managerId,
        password: form.password,
      }),
    });

    const result = await response.json();

    if (result.success) {
      void router.push('/auth/login');
    } else {
      alert('Registration failed: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Error: ' + String(error));
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  width: 100%;
}

.register-header {
  margin-bottom: 2rem;
  text-align: center;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.register-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.terms-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.terms-link {
  color: #c4f64f;
  text-decoration: none;
  font-weight: 500;
}

.terms-link:hover {
  text-decoration: underline;
}

.register-button {
  background: linear-gradient(135deg, #c4f64f 0%, #9ae634 100%);
  color: #1a1a2e;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.875rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(196, 246, 79, 0.3);
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.footer-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.signin-link {
  font-weight: 600;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
