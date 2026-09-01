<template>
  <div class="landing-page">
    <div class="landing-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="logo-animation">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="logo-svg"
            >
              <rect x="2" y="3" width="20" height="18" rx="2" stroke="#C4F64F" stroke-width="2" />
              <path
                d="M7 8L10 12L7 16"
                stroke="#C4F64F"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path d="M13 16H17" stroke="#C4F64F" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          <h1 class="hero-title">
            <span class="title-word">Project</span>
            <span class="title-word title-accent">Management</span>
            <span class="title-word">Reimagined</span>
          </h1>
          <p class="hero-subtitle">
            Streamline your workflow, empower your team, and deliver projects on time with TASKY.
          </p>
          <div class="hero-buttons">
            <q-btn
              label="Get Started"
              class="cta-button primary"
              @click="navigateToAuth"
              no-caps
              size="lg"
            />
            <q-btn
              label="Learn More"
              class="cta-button secondary"
              @click="scrollToFeatures"
              no-caps
              size="lg"
              outline
            />
          </div>
        </div>

        <!-- Animated Background Elements -->
        <div class="background-elements">
          <div class="floating-element element-1"></div>
          <div class="floating-element element-2"></div>
          <div class="floating-element element-3"></div>
          <div class="floating-element element-4"></div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="features-section" ref="featuresSection">
        <div class="section-header">
          <h2 class="section-title">Why Choose TASKY?</h2>
          <p class="section-subtitle">Everything you need to manage projects efficiently</p>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon">
              <q-icon :name="feature.icon" size="48px" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-item" v-for="(stat, index) in stats" :key="index">
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="cta-section">
        <h2 class="cta-title">Ready to Transform Your Project Management?</h2>
        <p class="cta-subtitle">Join thousands of teams already using TASKY</p>
        <q-btn
          label="Start Free Trial"
          class="cta-button large"
          @click="navigateToAuth"
          no-caps
          size="xl"
        />
      </div>

      <!-- Footer -->
      <div class="landing-footer">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="footer-logo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="20" height="18" rx="2" stroke="#C4F64F" stroke-width="2" />
                <path
                  d="M7 8L10 12L7 16"
                  stroke="#C4F64F"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path d="M13 16H17" stroke="#C4F64F" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <span class="footer-brand-name">TASKY</span>
          </div>
          <p class="footer-text">© 2026 TASKY. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const featuresSection = ref<HTMLElement | null>(null);

const features = [
  {
    icon: 'dashboard',
    title: 'Real-time Analytics',
    description: 'Track progress with live dashboards and comprehensive reports',
  },
  {
    icon: 'groups',
    title: 'Team Collaboration',
    description: 'Work together seamlessly with integrated communication tools',
  },
  {
    icon: 'task_alt',
    title: 'Smart Task Management',
    description: 'Organize work efficiently with intelligent task prioritization',
  },
  {
    icon: 'schedule',
    title: 'Time Tracking',
    description: 'Monitor time spent on tasks and optimize productivity',
  },
  {
    icon: 'insights',
    title: 'Resource Planning',
    description: 'Allocate resources effectively based on workload analysis',
  },
  {
    icon: 'security',
    title: 'Enterprise Security',
    description: 'Bank-level security to protect your project data',
  },
];

const stats = [
  { number: '10K+', label: 'Active Users' },
  { number: '50K+', label: 'Projects Completed' },
  { number: '99.9%', label: 'Uptime' },
  { number: '24/7', label: 'Support' },
];

const navigateToAuth = () => {
  void router.push('/auth/login');
};

const scrollToFeatures = () => {
  if (featuresSection.value) {
    featuresSection.value.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  overflow-x: hidden;
}

.landing-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  position: relative;
  overflow: hidden;
}

.hero-content {
  text-align: center;
  z-index: 2;
  max-width: 900px;
  animation: fadeInUp 1s ease-out;
}

.logo-animation {
  margin-bottom: 2rem;
  animation: float 3s ease-in-out infinite;
}

.logo-svg {
  width: 80px;
  height: 80px;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 1.5rem 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.title-word {
  display: block;
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
}

.title-word:nth-child(1) {
  animation-delay: 0.2s;
}

.title-word:nth-child(2) {
  animation-delay: 0.4s;
}

.title-word:nth-child(3) {
  animation-delay: 0.6s;
}

.title-accent {
  color: #c4f64f;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 3rem 0;
  line-height: 1.6;
  opacity: 0;
  animation: fadeInUp 0.8s ease-out 0.8s forwards;
}

.hero-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  opacity: 0;
  animation: fadeInUp 0.8s ease-out 1s forwards;
}

.cta-button {
  font-weight: 600;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cta-button.primary {
  background: linear-gradient(135deg, #c4f64f 0%, #9ae634 100%);
  color: #1a1a2e;
}

.cta-button.primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(196, 246, 79, 0.4);
}

.cta-button.secondary {
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
}

.cta-button.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.cta-button.large {
  padding: 1.25rem 3rem;
  font-size: 1.125rem;
  background: linear-gradient(135deg, #c4f64f 0%, #9ae634 100%);
  color: #1a1a2e;
}

/* Background Elements */
.background-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(196, 246, 79, 0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.element-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.element-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.element-3 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.element-4 {
  width: 250px;
  height: 250px;
  top: 30%;
  right: 25%;
  animation-delay: 1s;
}

/* Features Section */
.features-section {
  padding: 6rem 2rem;
  background: rgba(255, 255, 255, 0.02);
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 1rem 0;
}

.section-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.feature-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(196, 246, 79, 0.3);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, rgba(196, 246, 79, 0.2) 0%, rgba(154, 230, 52, 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c4f64f;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.75rem 0;
}

.feature-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.5;
}

/* Stats Section */
.stats-section {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, rgba(196, 246, 79, 0.1) 0%, rgba(154, 230, 52, 0.05) 100%);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  max-width: 1000px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: 800;
  color: #c4f64f;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* CTA Section */
.cta-section {
  padding: 8rem 2rem;
  text-align: center;
  background: radial-gradient(circle at center, rgba(196, 246, 79, 0.1) 0%, transparent 70%);
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 1rem 0;
}

.cta-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 3rem 0;
}

/* Footer */
.landing-footer {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-logo {
  width: 40px;
  height: 40px;
}

.footer-brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #c4f64f;
}

.footer-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .cta-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 2rem 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
