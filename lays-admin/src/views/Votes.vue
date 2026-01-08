<template>
  <div class="votes-container">
    <!-- Header -->
    <header class="votes-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h-2m2-4h-2m2 4l-2 2m2-2l2 2M9 6h6m-6 4h6m-6 4h6M6 10h.01M6 6h.01M6 14h.01" />
            </svg>
          </div>
          <h1 class="votes-title">All Votes</h1>
        </div>
        <button @click="handleLogout" class="logout-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="votes-main">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading votes...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="votes.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h-2m2-4h-2m2 4l-2 2m2-2l2 2M9 6h6m-6 4h6m-6 4h6M6 10h.01M6 6h.01M6 14h.01" />
          </svg>
        </div>
        <h3>No votes yet</h3>
        <p>No one has voted on any designs yet.</p>
      </div>

      <!-- Votes Table -->
      <div v-else class="votes-table-container">
        <table class="votes-table">
          <thead>
            <tr>
              <th>Bag Name</th>
              <th>Voter Email</th>
              <th>Vote Date</th>
              <th>Designer</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vote in votes" :key="vote._id" class="vote-row">
              <td class="bag-name-cell">
                <div class="bag-info">
                  <div v-if="vote.bagId?.color" class="bag-color-dot" :style="{ backgroundColor: vote.bagId?.color }"></div>
                  {{ vote.bagId?.name || vote.bagId?.bagName || 'Unknown' }}
                </div>
              </td>
              <td class="voter-email-cell">{{ vote.userEmail || vote.user || 'Anonymous' }}</td>
              <td class="vote-date-cell">{{ formatDate(vote.createdAt) }}</td>
              <td class="designer-cell">{{ vote.bagId?.user || 'Unknown' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Vote Stats -->
      <div v-if="votes.length > 0" class="vote-stats">
        <div class="stat-card">
          <div class="stat-number">{{ votes.length }}</div>
          <div class="stat-label">Total Votes</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ uniqueBags }}</div>
          <div class="stat-label">Designs Voted</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ uniqueVoters }}</div>
          <div class="stat-label">Unique Voters</div>
        </div>
      </div>
    </main>

    <!-- Background Decoration -->
    <div class="background-decoration">
      <div class="decoration-shape shape-1"></div>
      <div class="decoration-shape shape-2"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllVotes } from '@/services/api'
import { logout as clearAuth } from '@/services/auth'

const router = useRouter()

const votes = ref([])
const loading = ref(true)
const error = ref('')

const uniqueBags = computed(() => {
  const bagIds = new Set(votes.value.map(v => v.bagId?._id))
  return bagIds.size
})

const uniqueVoters = computed(() => {
  const voterEmails = new Set(votes.value.map(v => v.userEmail || v.user))
  return voterEmails.size
})

const fetchVotes = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await getAllVotes()
    console.log('All Votes Response:', response)
    votes.value = response.data || response || []
  } catch (err) {
    console.error('Error fetching votes:', err)
    error.value = err.response?.data?.message || 'Failed to load votes. Please try again.'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleLogout = () => {
  clearAuth()
  router.push('/login')
}

let votesIntervalId = null

onMounted(() => {
  fetchVotes()
  votesIntervalId = setInterval(fetchVotes, 30000)
})

onUnmounted(() => {
  if (votesIntervalId) {
    clearInterval(votesIntervalId)
    votesIntervalId = null
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.votes-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow-x: hidden;
}

.background-decoration {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.decoration-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: floatDecor 25s infinite ease-in-out;
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  top: -200px;
  right: -200px;
  animation-delay: 0s;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  bottom: -150px;
  left: -150px;
  animation-delay: -12s;
}

@keyframes floatDecor {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-30px, 30px) rotate(240deg); }
}

/* Header Styles */
.votes-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.logo-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.votes-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.5px;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.logout-btn svg {
  width: 20px;
  height: 20px;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

/* Main Content */
.votes-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
  position: relative;
  z-index: 1;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
}

/* Error State */
.error-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: rgba(254, 242, 242, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid #fecaca;
  border-radius: 16px;
  color: #dc2626;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
}

.error-state svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-icon svg {
  width: 40px;
  height: 40px;
  color: #3b82f6;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 15px;
  color: #6b7280;
}

/* Votes Table */
.votes-table-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  animation: fadeIn 0.6s ease-out;
  margin-bottom: 40px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.votes-table {
  width: 100%;
  border-collapse: collapse;
}

.votes-table thead {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-bottom: 2px solid #e5e7eb;
}

.votes-table th {
  padding: 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.votes-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.votes-table tbody tr:hover {
  background: rgba(59, 130, 246, 0.05);
}

.votes-table td {
  padding: 16px;
  font-size: 15px;
  color: #1f2937;
}

.bag-name-cell {
  font-weight: 600;
}

.bag-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bag-color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
}

.voter-email-cell {
  color: #6b7280;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.vote-date-cell {
  color: #9ca3af;
  font-size: 14px;
}

.designer-cell {
  color: #667eea;
  font-weight: 500;
}

/* Vote Stats */
.vote-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  animation: fadeIn 0.6s ease-out 0.2s backwards;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Responsive Design */
@media (max-width: 768px) {
  .votes-title {
    font-size: 20px;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
  }

  .logo-icon svg {
    width: 24px;
    height: 24px;
  }

  .logout-btn span {
    display: none;
  }

  .header-content {
    padding: 16px 20px;
  }

  .votes-main {
    padding: 24px 20px;
  }

  .votes-table th,
  .votes-table td {
    padding: 12px;
    font-size: 14px;
  }

  .votes-table th {
    font-size: 12px;
  }

  .stat-number {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .votes-table-container {
    overflow-x: auto;
  }

  .votes-table {
    min-width: 500px;
  }

  .vote-stats {
    grid-template-columns: 1fr;
  }
}
</style>