<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 class="dashboard-title">Bag Management</h1>
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
    <main class="dashboard-main">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading bags...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="bags.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3>No bags found</h3>
        <p>No bags have been submitted yet.</p>
      </div>

      <!-- Bags Grid -->
      <div v-else class="bags-grid">
        <div v-for="bag in bags" :key="bag._id" class="bag-card">
          <!-- Bag Image -->
          <div class="bag-image">
            <img
              v-if="bag.screenshot || bag.image"
              :src="bag.screenshot || bag.image"
              :alt="bag.name || bag.bagName"
              @error="handleImageError"
            />
            <div v-else class="image-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- Bag Details -->
          <div class="bag-details">
            <div class="bag-header">
              <h3 class="bag-name">{{ bag.name || bag.bagName }}</h3>
              <div
                class="bag-color"
                :style="{ backgroundColor: bag.color || bag.bagColor }"
                :title="`Color: ${bag.color || bag.bagColor}`"
              ></div>
            </div>

            <div class="bag-info">
              <div class="info-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{{ bag.user || 'Unknown User' }}</span>
              </div>
              <div class="info-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{{ formatDate(bag.createdAt) }}</span>
              </div>
              <div class="info-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h-2m2-4h-2m2 4l-2 2m2-2l2 2M9 6h6m-6 4h6m-6 4h6M6 10h.01M6 6h.01M6 14h.01" />
                </svg>
                <span>
                  {{ (voteCounts && voteCounts[bag._id]) ? voteCounts[bag._id] : 0 }} votes
                  — {{ voterSummaryFor(bag) }}
                </span>
              </div>
            </div>

            <!-- Delete Button -->
            <button
              @click="handleDelete(bag._id)"
              :disabled="deleting === bag._id"
              class="delete-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span v-if="deleting === bag._id">Deleting...</span>
              <span v-else>Delete</span>
            </button>
          </div>
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
import { getBags, deleteBag, getAllVotes } from '@/services/api'
import { logout as clearAuth } from '@/services/auth'

const router = useRouter()

const bags = ref([])
const loading = ref(true)
const error = ref('')
const deleting = ref(null)
const voteCounts = ref({})
const voteVoters = ref({})

const selectedBag = computed(() => null)

const fetchBags = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await getBags()
    console.log('API Response:', response)
    const bagData = response.data?.data || response.data || response || []
    console.log('Bag Data:', bagData)
    bags.value = bagData
  } catch (err) {
    console.error('Error fetching bags:', err)
    error.value = err.response?.data?.message || 'Failed to load bags. Please try again.'
  } finally {
    loading.value = false
  }
}

const fetchVoteCounts = async () => {
  try {
    const response = await getAllVotes()
    const votesRaw = response.data?.data || response.data || response || []
    const counts = {}
    const votersMap = {}
    if (Array.isArray(votesRaw)) {
      for (const v of votesRaw) {
        const id = (v.bagId && v.bagId._id) ? v.bagId._id : v.bagId
        const voter = v.userEmail || v.user || 'Anonymous'
        if (id) {
          counts[id] = (counts[id] || 0) + 1
          if (!votersMap[id]) votersMap[id] = new Set()
          if (voter) votersMap[id].add(voter)
        }
      }
    }
    voteCounts.value = counts
    const obj = {}
    for (const [k, set] of Object.entries(votersMap)) {
      obj[k] = Array.from(set)
    }
    voteVoters.value = obj
  } catch (err) {
    console.error('Error fetching all votes:', err)
  }
}

const voterSummaryFor = (bag) => {
  const id = bag._id
  const arr = voteVoters.value && voteVoters.value[id] ? voteVoters.value[id] : []
  if (!arr || arr.length === 0) return 'No votes'
  if (arr.length === 1) return arr[0]
  return `${arr[0]} and ${arr.length - 1} other(s)`
}

const handleDelete = async (id) => {
  if (!confirm('Are you sure you want to delete this bag?')) {
    return
  }

  deleting.value = id
  
  try {
    await deleteBag(id)
    bags.value = bags.value.filter(bag => bag._id !== id)
    // Refresh counts after deletion to keep list up to date
    fetchVoteCounts()
  } catch (err) {
    console.error('Error deleting bag:', err)
    alert(err.response?.data?.message || 'Failed to delete bag. Please try again.')
  } finally {
    deleting.value = null
  }
}

const handleLogout = () => {
  clearAuth()
  router.push('/login')
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleImageError = (e) => {
  e.target.src = ''
}

// Votes modal removed; counts shown inline under date

let votesIntervalId = null

onMounted(() => {
  fetchBags()
  fetchVoteCounts()
  votesIntervalId = setInterval(fetchVoteCounts, 30000)
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

.dashboard-container {
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
.dashboard-header {
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
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.logo-icon svg {
  width: 28px;
  height: 28px;
  color: white;
}

.dashboard-title {
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

.logout-btn:active {
  transform: translateY(0);
}

/* Main Content */
.dashboard-main {
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
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
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
  background: rgba(102, 126, 234, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-icon svg {
  width: 40px;
  height: 40px;
  color: #667eea;
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

/* Bags Grid */
.bags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  animation: fadeIn 0.6s ease-out;
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

/* Bag Card */
.bag-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.bag-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
}

.bag-image {
  height: 220px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  overflow: hidden;
  position: relative;
}

.bag-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.bag-card:hover .bag-image img {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.image-placeholder svg {
  width: 64px;
  height: 64px;
}

/* Bag Details */
.bag-details {
  padding: 24px;
}

.bag-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.bag-name {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.3px;
}

.bag-color {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.bag-card:hover .bag-color {
  transform: scale(1.1);
}

/* Bag Info */
.bag-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #6b7280;
}

.info-item svg {
  width: 18px;
  height: 18px;
  color: #667eea;
  flex-shrink: 0;
}

/* Delete Button */
.delete-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
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

.delete-btn svg {
  width: 20px;
  height: 20px;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.delete-btn:active {
  transform: translateY(0);
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Votes Button */
.votes-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  margin-bottom: 12px;
}

.votes-btn svg {
  width: 20px;
  height: 20px;
}

.votes-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.votes-btn:active {
  transform: translateY(0);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 8px;
}

.close-btn svg {
  width: 24px;
  height: 24px;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1f2937;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.votes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vote-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.vote-user {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.vote-date {
  font-size: 13px;
  color: #9ca3af;
}

/* Responsive Design */

@media (max-width: 768px) {
  .dashboard-title {
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

  .bags-grid {
    grid-template-columns: 1fr;
  }

  .header-content {
    padding: 16px 20px;
  }

  .dashboard-main {
    padding: 24px 20px;
  }
}

@media (max-width: 480px) {
  .bag-image {
    height: 180px;
  }

  .bag-details {
    padding: 20px;
  }
}
</style>
