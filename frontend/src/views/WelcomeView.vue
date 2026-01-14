<template>
  <div class="welcome-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">
          <FeatherIcon type="zap" :size="14" />
          <span>Miễn phí 100%</span>
        </div>
        <h1 class="hero-title">
          Học Tiếng Anh
          <span class="gradient-text">Thông Minh</span>
        </h1>
        <p class="hero-subtitle">
          Phương pháp học từ vựng hiệu quả với Spaced Repetition, AI Assistant, 
          và nhiều chế độ luyện tập thú vị.
        </p>
        <div class="hero-actions">
          <router-link to="/register" class="btn-primary-large">
            <FeatherIcon type="user-plus" :size="20" />
            <span>Bắt đầu miễn phí</span>
          </router-link>
          <router-link to="/login" class="btn-secondary-large">
            <FeatherIcon type="log-in" :size="20" />
            <span>Đăng nhập</span>
          </router-link>
        </div>
      </div>
      <div class="hero-visual">
        <div class="floating-cards">
          <div class="vocab-card card-1">
            <span class="word">Hello</span>
            <span class="meaning">Xin chào</span>
          </div>
          <div class="vocab-card card-2">
            <span class="word">Learn</span>
            <span class="meaning">Học</span>
          </div>
          <div class="vocab-card card-3">
            <span class="word">Success</span>
            <span class="meaning">Thành công</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <h2 class="section-title">Tại sao chọn EngLearn?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
            <FeatherIcon type="repeat" :size="28" />
          </div>
          <h3>Spaced Repetition</h3>
          <p>Thuật toán SM-2 giúp bạn nhớ từ vựng lâu hơn với lịch ôn tập thông minh</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
            <FeatherIcon type="cpu" :size="28" />
          </div>
          <h3>AI Assistant</h3>
          <p>Trợ lý AI giải thích từ vựng, tạo câu ví dụ và chấm điểm bài tập của bạn</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
            <FeatherIcon type="layers" :size="28" />
          </div>
          <h3>Nhiều chế độ học</h3>
          <p>FlashCard, Quiz, Learn Mode, Paragraph Practice - đa dạng phương pháp</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
            <FeatherIcon type="award" :size="28" />
          </div>
          <h3>Gamification</h3>
          <p>XP, Level, Streak, Achievement - học như chơi game, có động lực mỗi ngày</p>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="stat-item">
        <span class="stat-number">1000+</span>
        <span class="stat-label">Từ vựng</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">50+</span>
        <span class="stat-label">Chủ đề</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">8</span>
        <span class="stat-label">Loại từ</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">AI</span>
        <span class="stat-label">Trợ lý thông minh</span>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta-content">
        <h2>Sẵn sàng bắt đầu?</h2>
        <p>Đăng ký miễn phí và bắt đầu hành trình học tiếng Anh của bạn ngay hôm nay!</p>
        <router-link to="/register" class="btn-primary-large">
          <FeatherIcon type="arrow-right" :size="20" />
          <span>Tạo tài khoản miễn phí</span>
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <FeatherIcon type="book-open" :size="24" />
          <span>EngLearn</span>
        </div>
        <p>© 2026 EngLearn. Học tiếng Anh hiệu quả mỗi ngày.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import FeatherIcon from '../components/FeatherIcon.vue'
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Hero Section */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  align-items: center;
}

.hero-content {
  max-width: 560px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(21, 183, 158, 0.1), rgba(21, 183, 158, 0.05));
  border: 1px solid rgba(21, 183, 158, 0.3);
  border-radius: var(--radius-full);
  color: var(--mint-500);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: linear-gradient(135deg, var(--mint-400), var(--mint-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary-large {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--mint-500), var(--mint-600));
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: var(--radius-xl);
  text-decoration: none;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 20px rgba(21, 183, 158, 0.3);
}

.btn-primary-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(21, 183, 158, 0.4);
}

.btn-secondary-large {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: var(--radius-xl);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.btn-secondary-large:hover {
  border-color: var(--mint-500);
  color: var(--mint-500);
}

/* Hero Visual */
.hero-visual {
  position: relative;
  height: 400px;
}

.floating-cards {
  position: relative;
  width: 100%;
  height: 100%;
}

.vocab-card {
  position: absolute;
  padding: 1.5rem 2rem;
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: float 3s ease-in-out infinite;
}

.vocab-card .word {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--mint-500);
}

.vocab-card .meaning {
  font-size: 1rem;
  color: var(--text-muted);
}

.vocab-card.card-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.vocab-card.card-2 {
  top: 40%;
  right: 10%;
  animation-delay: 0.5s;
}

.vocab-card.card-3 {
  bottom: 10%;
  left: 30%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

/* Features Section */
.features {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.feature-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: 2rem;
  text-align: center;
  transition: all var(--transition-fast);
  border: 1px solid var(--border-color);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 1.5rem;
}

.feature-card h3 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.feature-card p {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Stats Section */
.stats {
  background: linear-gradient(135deg, var(--mint-500), var(--mint-600));
  padding: 4rem 2rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: var(--radius-2xl);
}

.stat-item {
  text-align: center;
  color: white;
}

.stat-number {
  display: block;
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

/* CTA Section */
.cta {
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 2rem;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.25rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
}

/* Footer */
.footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--mint-500);
}

.footer-content p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 2rem;
    gap: 2rem;
  }

  .hero-content {
    max-width: 100%;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-visual {
    height: 300px;
  }

  .hero-actions {
    justify-content: center;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
    padding: 2rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
