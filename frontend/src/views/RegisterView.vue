<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-illustration">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
        <div class="illustration-content">
          <FeatherIcon type="users" :size="80" class="users-icon" />
          <h2>Tham gia cộng đồng</h2>
          <p>Bắt đầu hành trình học tiếng Anh của bạn</p>
        </div>
      </div>

      <div class="auth-card">
        <div class="auth-header">
          <router-link to="/" class="logo">
            <FeatherIcon type="book-open" :size="32" />
            <span>EngLearn</span>
          </router-link>
          <h1>Đăng ký</h1>
          <p>Tạo tài khoản miễn phí</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="displayName">
              <FeatherIcon type="user" :size="16" />
              Tên hiển thị
            </label>
            <input
              type="text"
              id="displayName"
              v-model="displayName"
              placeholder="Nhập tên của bạn"
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="email">
              <FeatherIcon type="mail" :size="16" />
              Email
            </label>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="email@example.com"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="password">
              <FeatherIcon type="lock" :size="16" />
              Mật khẩu
            </label>
            <div class="password-input">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                placeholder="Tối thiểu 6 ký tự"
                required
                minlength="6"
                :disabled="isLoading"
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                <FeatherIcon :type="showPassword ? 'eye-off' : 'eye'" :size="18" />
              </button>
            </div>
            <div class="password-strength" v-if="password">
              <div class="strength-bar" :class="passwordStrength"></div>
              <span class="strength-text">{{ passwordStrengthText }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">
              <FeatherIcon type="check-circle" :size="16" />
              Xác nhận mật khẩu
            </label>
            <div class="password-input">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                v-model="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                required
                :disabled="isLoading"
              />
              <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
                <FeatherIcon :type="showConfirmPassword ? 'eye-off' : 'eye'" :size="18" />
              </button>
            </div>
            <div v-if="confirmPassword && confirmPassword !== password" class="validation-error">
              <FeatherIcon type="x-circle" :size="14" />
              Mật khẩu không khớp
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            <FeatherIcon type="alert-circle" :size="16" />
            {{ errorMessage }}
          </div>

          <button 
            type="submit" 
            class="btn-primary" 
            :disabled="isLoading || !isFormValid"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else>
              <FeatherIcon type="user-plus" :size="18" />
              Đăng ký
            </span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import FeatherIcon from '../components/FeatherIcon.vue'

const router = useRouter()
const { register, isLoading } = useAuth()

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')

const passwordStrength = computed(() => {
  const p = password.value
  if (p.length < 6) return 'weak'
  if (p.length < 8) return 'medium'
  if (p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p)) return 'strong'
  return 'medium'
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength === 'weak') return 'Yếu'
  if (strength === 'medium') return 'Trung bình'
  return 'Mạnh'
})

const isFormValid = computed(() => {
  return email.value && 
         password.value.length >= 6 && 
         confirmPassword.value === password.value
})

async function handleRegister() {
  errorMessage.value = ''
  
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu không khớp'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự'
    return
  }
  
  const result = await register(email.value, password.value, displayName.value || null)
  
  if (result.success) {
    router.push('/')
  } else {
    errorMessage.value = result.error
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  padding: 2rem;
}

.auth-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1000px;
  width: 100%;
  background: var(--card-bg);
  border-radius: var(--radius-2xl);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.auth-card {
  padding: 3rem;
  display: flex;
  flex-direction: column;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--mint-500);
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 1.5rem;
}

.auth-header h1 {
  font-size: 1.75rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: var(--text-muted);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.form-group input {
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.form-group input:focus {
  outline: none;
  border-color: var(--mint-500);
  box-shadow: 0 0 0 3px rgba(21, 183, 158, 0.15);
}

.form-group input::placeholder {
  color: var(--text-muted);
}

.password-input {
  position: relative;
}

.password-input input {
  width: 100%;
  padding-right: 3rem;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: var(--text-primary);
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--border-color);
  position: relative;
  overflow: hidden;
}

.strength-bar::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.strength-bar.weak::after {
  width: 33%;
  background: #ef4444;
}

.strength-bar.medium::after {
  width: 66%;
  background: #f59e0b;
}

.strength-bar.strong::after {
  width: 100%;
  background: var(--mint-500);
}

.strength-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  min-width: 60px;
}

.validation-error {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-lg);
  color: #ef4444;
  font-size: 0.875rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, var(--mint-500) 0%, var(--mint-600) 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(21, 183, 158, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  color: var(--text-muted);
}

.auth-footer a {
  color: var(--mint-500);
  font-weight: 600;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* Illustration side */
.auth-illustration {
  background: linear-gradient(135deg, var(--mint-600) 0%, var(--mint-500) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.floating-shapes {
  position: absolute;
  inset: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation: float 6s ease-in-out infinite;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
  animation: float 8s ease-in-out infinite reverse;
}

.shape-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  right: 30%;
  animation: float 5s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.illustration-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  padding: 2rem;
}

.users-icon {
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.illustration-content h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.illustration-content p {
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .auth-container {
    grid-template-columns: 1fr;
  }

  .auth-illustration {
    display: none;
  }

  .auth-card {
    padding: 2rem;
  }
}
</style>
