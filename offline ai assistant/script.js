// ===== APP STATE =====
const state = {
  isListening: false,
  isSpeaking: false,
  audioContext: null,
  mediaRecorder: null,
  audioChunks: [],
  startTime: 0,
  currentTheme: 'dark',
  visualizerInterval: null,
  audioStream: null
};

// ===== DOM ELEMENTS =====
const elements = {
  listenBtn: document.getElementById('listenBtn'),
  statusDot: document.getElementById('statusDot'),
  statusText: document.getElementById('statusText'),
  transcript: document.getElementById('transcript'),
  response: document.getElementById('response'),
  sttTime: document.getElementById('sttTime'),
  apiTime: document.getElementById('apiTime'),
  ttsTime: document.getElementById('ttsTime'),
  totalTime: document.getElementById('totalTime'),
  visualizer: document.getElementById('visualizer'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsModal: document.getElementById('settingsModal'),
  closeBtn: document.querySelector('.close-btn'),
  themeToggle: document.getElementById('themeToggle'),
  responseAudio: document.getElementById('responseAudio')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  initServiceWorker();
  initEventListeners();
  initTheme();
  initParticles();
  
  try {
    await initAudioContext();
    await loadModels();
    updateStatus('Ready', 'var(--success)');
    console.log('AI Assistant initialized');
  } catch (error) {
    console.error('Initialization error:', error);
    updateStatus('Error', 'var(--error)');
  }
});

// ===== CORE FUNCTIONS =====
async function initAudioContext() {
  state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  console.log('Audio context initialized');
}

async function loadModels() {
  // In a real app, you would load Whisper and TTS models here
  console.log('Loading AI models...');
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
  console.log('Models loaded');
}

function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.error('SW registration failed:', err));
  }
}

function initParticles() {
  if (window.particlesJS) {
    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#00f0ff" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: "#00f0ff", opacity: 0.2, width: 1 },
        move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out" }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: true, mode: "push" }
        }
      }
    });
  }
}

// ===== AUDIO PROCESSING =====
async function startListening() {
  try {
    state.audioChunks = [];
    state.startTime = performance.now();
    
    // Get microphone access
    state.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Create media recorder
    state.mediaRecorder = new MediaRecorder(state.audioStream);
    
    // Setup event handlers
    state.mediaRecorder.ondataavailable = handleAudioData;
    state.mediaRecorder.onstop = handleAudioStop;
    
    // Start recording
    state.mediaRecorder.start(250); // Collect chunks every 250ms
    state.isListening = true;
    
    // Update UI
    updateStatus('Listening...', 'var(--primary)');
    elements.listenBtn.innerHTML = '<i class="fas fa-microphone-slash"></i><span>Stop Listening</span>';
    startVisualizer();
    
    console.log('Recording started');
  } catch (error) {
    console.error('Error starting recording:', error);
    updateStatus('Mic Error', 'var(--error)');
    stopListening();
  }
}

function stopListening() {
  if (state.mediaRecorder && state.isListening) {
    state.mediaRecorder.stop();
    state.audioStream.getTracks().forEach(track => track.stop());
    state.isListening = false;
    
    // Update UI
    updateStatus('Processing...', 'var(--warning)');
    elements.listenBtn.innerHTML = '<i class="fas fa-microphone"></i><span>Start Listening</span>';
    stopVisualizer();
    
    console.log('Recording stopped');
  }
}

function handleAudioData(event) {
  state.audioChunks.push(event.data);
  
  // In a real app, you would send chunks to Whisper worker
  simulateSTTProcessing();
}

async function handleAudioStop() {
  try {
    // Combine all audio chunks
    const audioBlob = new Blob(state.audioChunks, { type: 'audio/wav' });
    
    // Simulate STT processing
    const sttTime = performance.now() - state.startTime;
    elements.sttTime.textContent = `${Math.round(sttTime)}ms`;
    
    // Simulate OpenAI API call
    const apiStart = performance.now();
    const aiResponse = await callOpenAI("Simulated transcript");
    const apiTime = performance.now() - apiStart;
    elements.apiTime.textContent = `${Math.round(apiTime)}ms`;
    
    // Simulate TTS
    const ttsStart = performance.now();
    await synthesizeSpeech(aiResponse);
    const ttsTime = performance.now() - ttsStart;
    elements.ttsTime.textContent = `${Math.round(ttsTime)}ms`;
    
    // Update total time
    const totalTime = performance.now() - state.startTime;
    elements.totalTime.textContent = `${Math.round(totalTime)}ms`;
    
    updateStatus('Ready', 'var(--success)');
  } catch (error) {
    console.error('Processing error:', error);
    updateStatus('Error', 'var(--error)');
  }
}

// ===== AI INTEGRATION =====
async function callOpenAI(prompt) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
  
  // Simulated responses
  const responses = [
    "I've processed your request and here's what I found...",
    "Based on my analysis, I recommend considering these options...",
    "That's an interesting question! Here's what I know about that...",
    "I understand you're asking about this topic. Here's my response...",
    "After consulting my knowledge base, here's the information you requested..."
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Update UI
  elements.response.innerHTML = `<p>${randomResponse}</p>`;
  return randomResponse;
}

async function synthesizeSpeech(text) {
  // In a real app, you would use the TTS worker here
  console.log('Synthesizing speech:', text);
  
  // Simulate synthesis delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));
  
  // For demo purposes, we'll just play a silent audio
  state.isSpeaking = true;
  updateStatus('Speaking...', 'var(--accent)');
  
  // In a real app, you would play the actual TTS audio
  elements.responseAudio.src = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...";
  await elements.responseAudio.play();
  
  elements.responseAudio.onended = () => {
    state.isSpeaking = false;
    updateStatus('Ready', 'var(--success)');
  };
}

// ===== UI FUNCTIONS =====
function updateStatus(text, color) {
  elements.statusText.textContent = text;
  elements.statusDot.style.background = color;
  elements.statusDot.style.boxShadow = `0 0 10px ${color}`;
  
  // Update pulse ring if it exists
  const pulseRing = document.querySelector('.pulse-ring');
  if (pulseRing) {
    pulseRing.style.background = color;
  }
}

function startVisualizer() {
  stopVisualizer();
  
  const bars = elements.visualizer.querySelectorAll('.bar');
  state.visualizerInterval = setInterval(() => {
    bars.forEach(bar => {
      const randomHeight = Math.random() * 0.7 + 0.3;
      bar.style.transform = `scaleY(${randomHeight})`;
    });
  }, 100);
}

function stopVisualizer() {
  if (state.visualizerInterval) {
    clearInterval(state.visualizerInterval);
    state.visualizerInterval = null;
    
    // Reset bars
    const bars = elements.visualizer.querySelectorAll('.bar');
    bars.forEach(bar => {
      bar.style.transform = 'scaleY(0.3)';
    });
  }
}

// ===== THEME MANAGEMENT =====
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);
  elements.themeToggle.checked = savedTheme === 'light';
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  state.currentTheme = theme;
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
  // Main record button
  elements.listenBtn.addEventListener('click', () => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  });
  
  // Settings modal
  elements.settingsBtn.addEventListener('click', () => {
    elements.settingsModal.style.display = 'flex';
  });
  
  elements.closeBtn.addEventListener('click', () => {
    elements.settingsModal.style.display = 'none';
  });
  
  // Theme toggle
  elements.themeToggle.addEventListener('change', (e) => {
    setTheme(e.target.checked ? 'light' : 'dark');
  });
  
  // Click outside modal to close
  window.addEventListener('click', (e) => {
    if (e.target === elements.settingsModal) {
      elements.settingsModal.style.display = 'none';
    }
  });
}

// ===== SIMULATION FUNCTIONS (for demo) =====
function simulateSTTProcessing() {
  if (!state.isListening) return;
  
  // Simulate partial transcripts
  const phrases = [
    "I'm hearing...",
    "It sounds like...",
    "I think you said...",
    "Analyzing...",
    "Processing speech..."
  ];
  
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  elements.transcript.innerHTML = `<p>${randomPhrase}</p>`;
}

// ===== UTILITY FUNCTIONS =====
function formatTime(ms) {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}