<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container class="auth-container">
      <q-page class="auth-page">
        <div class="auth-split">
          <!-- Left Panel - Visual -->
          <div class="auth-visual-panel">
            <div class="visual-content">
              <div class="brand-section">
                <div class="brand-logo">
                  <div class="logo-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect
                        x="2"
                        y="3"
                        width="20"
                        height="18"
                        rx="2"
                        stroke="#C4F64F"
                        stroke-width="2"
                      />
                      <path
                        d="M7 8L10 12L7 16"
                        stroke="#C4F64F"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M13 16H17"
                        stroke="#C4F64F"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </div>
                  <h1 class="brand-name">TASKY</h1>
                </div>
                <p class="brand-tagline">Project Management Reimagined</p>
              </div>

              <div class="features-section">
                <div class="feature-item">
                  <div class="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="3" stroke="#C4F64F" stroke-width="2" />
                      <path
                        d="M12 1V5M12 19V23M1 12H5M19 12H23M4.22 4.22L7.05 7.05M16.95 16.95L19.78 19.78M4.22 19.78L7.05 16.95M16.95 7.05L19.78 4.22"
                        stroke="#C4F64F"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </div>
                  <div class="feature-text">
                    <h3>Real-time Analytics</h3>
                    <p>Track progress with live dashboards</p>
                  </div>
                </div>

                <div class="feature-item">
                  <div class="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                        stroke="#C4F64F"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <circle cx="9" cy="7" r="4" stroke="#C4F64F" stroke-width="2" />
                      <path
                        d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
                        stroke="#C4F64F"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
                        stroke="#C4F64F"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                  <div class="feature-text">
                    <h3>Team Collaboration</h3>
                    <p>Work together seamlessly</p>
                  </div>
                </div>

                <div class="feature-item">
                  <div class="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 2L2 7L12 12L22 7L12 2Z"
                        stroke="#C4F64F"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M2 17L12 22L22 17"
                        stroke="#C4F64F"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M2 12L12 17L22 12"
                        stroke="#C4F64F"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                  <div class="feature-text">
                    <h3>Smart Task Management</h3>
                    <p>Organize work efficiently</p>
                  </div>
                </div>
              </div>

              <div class="visual-footer">
                <p>© 2026 TASKY. All rights reserved.</p>
              </div>
            </div>
          </div>

          <!-- Right Panel - Form -->
          <div class="auth-form-panel">
            <div class="form-content">
              <router-view />
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// No additional logic needed for the layout
</script>

<style scoped>
.auth-container {
  height: 100vh;
  min-height: 100vh;
  background: #f8f9fa;
  overflow: hidden;
}

.auth-page {
  height: 100vh;
  min-height: 0;
  padding: 0;
  overflow: hidden;
}

.auth-split {
  display: flex;
  width: 100%;
  height: 100vh;
  min-height: 0;
  overflow: hidden;
}

.auth-visual-panel {
  flex: 1;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 2.5rem 3rem 2rem;
  position: relative;
  overflow: hidden;
  min-height: 0;
}

.auth-visual-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(196, 246, 79, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.visual-content {
  max-width: 480px;
  width: 100%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 2rem;
}

.brand-section {
  margin-bottom: 2.5rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.logo-icon {
  width: 56px;
  height: 56px;
}

.brand-name {
  font-size: 3rem;
  font-weight: 800;
  color: #c4f64f;
  margin: 0;
  letter-spacing: 0.1em;
}

.brand-tagline {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-weight: 300;
  letter-spacing: 0.05em;
}

.features-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(196, 246, 79, 0.1);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(196, 246, 79, 0.2);
  transform: translateX(8px);
}

.feature-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.feature-text h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
}

.feature-text p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.visual-footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.visual-footer p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.auth-form-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #ffffff;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.form-content {
  width: 100%;
  max-width: 480px;
  padding: 1rem;
  min-height: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .auth-visual-panel {
    padding: 2rem;
  }

  .brand-name {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .auth-split {
    flex-direction: column;
  }

  .auth-visual-panel {
    flex: none;
    padding: 2rem;
    min-height: auto;
  }

  .features-section {
    display: none;
  }

  .auth-form-panel {
    flex: 1;
    padding: 1.5rem;
  }

  .brand-name {
    font-size: 2rem;
  }

  .visual-footer {
    display: none;
  }
}

@media (max-width: 480px) {
  .auth-form-panel {
    padding: 1rem;
  }

  .brand-name {
    font-size: 1.75rem;
  }
}
</style>
