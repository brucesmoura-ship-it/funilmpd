/**
 * Review Funnel - Customer Gating Application
 * Handles star ratings, redirection logic, private channels, and Google compliance.
 */

const ReviewApp = (() => {
  // Application State
  const state = {
    client: null,
    currentRating: 0,
    redirectTimer: null,
    countdownSeconds: 4,
    clientsDatabase: []
  };

  // Star labels configuration
  const RATING_METADATA = {
    1: { label: '😡 Péssima experiência', color: 'text-rose-500' },
    2: { label: '🙁 Ruim, esperava mais', color: 'text-amber-500' },
    3: { label: '😐 Regular / Mediana', color: 'text-amber-500' },
    4: { label: '😊 Boa experiência!', color: 'text-emerald-500' },
    5: { label: '🤩 Excelente! Adorei!', color: 'text-gold-500' }
  };

  /**
   * Extract client slug from URL (query param ?cliente= or ?c= or path/hash)
   */
  const getClientSlugFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    let slug = params.get('cliente') || params.get('c');
    
    if (!slug && window.location.hash) {
      slug = window.location.hash.replace('#', '').trim();
    }

    if (!slug) {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      // Handles /avaliar/pizzaria-do-joao or /pizzaria-do-joao
      if (pathParts.length > 0) {
        const last = pathParts[pathParts.length - 1];
        if (last !== 'index.html' && last !== 'avaliar' && last !== 'admin.html') {
          slug = last;
        }
      }
    }

    return slug ? slug.toLowerCase().trim() : null;
  };

  /**
   * Load client database from Server API / clients.json or LocalStorage
   */
  const loadClientsData = async () => {
    let clients = [];

    // 1. Try LocalStorage (gives admin instant live preview when editing)
    try {
      const stored = localStorage.getItem('review_funnel_clients');
      if (stored) {
        clients = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }

    // 2. If empty, fetch from data/clients.json or /api/clients
    if (!clients || clients.length === 0) {
      try {
        const res = await fetch('data/clients.json');
        if (res.ok) {
          clients = await res.json();
          // Seed localStorage for fast offline caching
          localStorage.setItem('review_funnel_clients', JSON.stringify(clients));
        }
      } catch (err) {
        console.warn('Could not fetch data/clients.json, checking API...', err);
        try {
          const apiRes = await fetch('/api/clients');
          if (apiRes.ok) {
            clients = await apiRes.json();
          }
        } catch (apiErr) {
          console.error('Failed to load clients database', apiErr);
        }
      }
    }

    state.clientsDatabase = clients || [];
    return state.clientsDatabase;
  };

  /**
   * Initialize UI and verify client
   */
  const init = async () => {
    const slug = getClientSlugFromUrl();
    await loadClientsData();

    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const stepRating = document.getElementById('stepRating');

    if (!slug) {
      // If no slug, look for first active client or show error / admin guide
      if (state.clientsDatabase.length > 0) {
        // Fallback to first client for quick preview
        const firstClient = state.clientsDatabase[0];
        console.info(`No slug in URL. Auto-loading preview for: ${firstClient.slug}`);
        state.client = firstClient;
        renderClient(state.client);
      } else {
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
        return;
      }
    } else {
      const matchedClient = state.clientsDatabase.find(c => c.slug.toLowerCase() === slug.toLowerCase());
      if (!matchedClient) {
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
        return;
      }
      state.client = matchedClient;
      renderClient(state.client);
    }

    loadingState.classList.add('hidden');
    stepRating.classList.remove('hidden');
    setupStarEvents();
    setupFormEvents();
  };

  /**
   * Populate DOM with client branding
   */
  const renderClient = (client) => {
    document.title = `Avaliação - ${client.name}`;
    document.getElementById('headerCompanyBadge').textContent = client.name;
    document.getElementById('clientName').textContent = client.name;

    if (client.welcomeMessage) {
      document.getElementById('clientWelcome').textContent = client.welcomeMessage;
    }

    const clientLogo = document.getElementById('clientLogo');
    const logoPlaceholder = document.getElementById('logoPlaceholder');

    if (client.logo && client.logo.trim() !== '') {
      clientLogo.src = client.logo;
      clientLogo.alt = client.name;
      clientLogo.classList.remove('hidden');
      logoPlaceholder.classList.add('hidden');
      clientLogo.onerror = () => {
        clientLogo.classList.add('hidden');
        logoPlaceholder.classList.remove('hidden');
        logoPlaceholder.textContent = client.name.charAt(0).toUpperCase();
      };
    } else {
      clientLogo.classList.add('hidden');
      logoPlaceholder.classList.remove('hidden');
      logoPlaceholder.textContent = client.name.charAt(0).toUpperCase();
    }

    // Google review links setup
    const btnGoogle = document.getElementById('btnGoogleReview');
    const complianceLink = document.getElementById('complianceGoogleLink');
    const targetUrl = client.googleReviewUrl || '#';
    btnGoogle.href = targetUrl;
    complianceLink.href = targetUrl;
  };

  /**
   * Star buttons interaction setup
   */
  const setupStarEvents = () => {
    const starButtons = document.querySelectorAll('.star-btn');
    const ratingLabel = document.getElementById('ratingLabel');

    starButtons.forEach(btn => {
      const rating = parseInt(btn.getAttribute('data-star'), 10);

      // Hover / Touch interaction
      btn.addEventListener('mouseenter', () => highlightStars(rating));
      btn.addEventListener('mouseleave', () => highlightStars(state.currentRating));

      // Click / Touch select
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        selectRating(rating);
      });
    });
  };

  const highlightStars = (rating) => {
    const starButtons = document.querySelectorAll('.star-btn');
    const ratingLabel = document.getElementById('ratingLabel');

    starButtons.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-star'), 10);
      if (val <= rating) {
        btn.classList.add('text-gold-500');
        btn.classList.remove('text-slate-300');
      } else {
        btn.classList.remove('text-gold-500');
        btn.classList.add('text-slate-300');
      }
    });

    if (rating > 0 && RATING_METADATA[rating]) {
      ratingLabel.textContent = RATING_METADATA[rating].label;
      ratingLabel.className = `h-6 text-sm font-semibold mt-2 transition-all ${RATING_METADATA[rating].color}`;
    } else {
      ratingLabel.textContent = 'Toque nas estrelas acima';
      ratingLabel.className = 'h-6 text-sm font-semibold text-slate-400 mt-2 transition-all';
    }
  };

  /**
   * Handle user selection of rating
   */
  const selectRating = (score) => {
    state.currentRating = score;
    highlightStars(score);

    // Micro-delay for haptic feel
    setTimeout(() => {
      document.getElementById('stepRating').classList.add('hidden');

      if (score >= 4) {
        handlePositiveFlow(score);
      } else {
        handleCriticalFlow(score);
      }
    }, 280);
  };

  /**
   * Flow 4 or 5 stars: Celebration + Google Review Redirection
   */
  const handlePositiveFlow = (score) => {
    const stepPositive = document.getElementById('stepPositive');
    stepPositive.classList.remove('hidden');

    // Trigger celebratory confetti burst
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#3b82f6', '#10b981', '#6366f1']
      });
    }

    // Set countdown timer
    state.countdownSeconds = 4;
    const counterEl = document.getElementById('countdownSeconds');
    const redirectBox = document.getElementById('redirectCounterBox');
    const cancelBtn = document.getElementById('btnCancelRedirect');
    
    counterEl.textContent = state.countdownSeconds;
    redirectBox.classList.remove('hidden');

    if (state.redirectTimer) clearInterval(state.redirectTimer);

    state.redirectTimer = setInterval(() => {
      state.countdownSeconds--;
      counterEl.textContent = state.countdownSeconds;

      if (state.countdownSeconds <= 0) {
        clearInterval(state.redirectTimer);
        // Automatic redirect to Google Review
        if (state.client && state.client.googleReviewUrl) {
          window.location.href = state.client.googleReviewUrl;
        }
      }
    }, 1000);

    cancelBtn.onclick = (e) => {
      e.preventDefault();
      clearInterval(state.redirectTimer);
      redirectBox.innerHTML = '<span class="text-xs text-slate-400">Redirecionamento automático pausado. Clique no botão acima para avaliar!</span>';
    };
  };

  /**
   * Flow 1 to 3 stars: Private resolution to shield public reputation
   */
  const handleCriticalFlow = (score) => {
    const stepCritical = document.getElementById('stepCritical');
    stepCritical.classList.remove('hidden');

    const modeWhatsApp = document.getElementById('modeWhatsApp');
    const modeForm = document.getElementById('modeForm');
    const btnWhatsAppDirect = document.getElementById('btnWhatsAppDirect');

    const client = state.client;
    const cleanPhone = (client.whatsapp || '').replace(/\D/g, '');

    // Pre-formatted message for Manager WhatsApp
    const starsEmoji = '⭐'.repeat(score);
    const textMsg = encodeURIComponent(
      `Olá! Estive no estabelecimento *${client.name}* e gostaria de relatar uma insatisfação para a gerência.\n` +
      `Minha avaliação foi: ${starsEmoji} (${score}/5).\n` +
      `Gostaria de falar sobre o que aconteceu.`
    );
    const waUrl = `https://wa.me/${cleanPhone}?text=${textMsg}`;
    btnWhatsAppDirect.href = waUrl;

    if (client.contactMode === 'form') {
      modeWhatsApp.classList.add('hidden');
      modeForm.classList.remove('hidden');
    } else {
      modeWhatsApp.classList.remove('hidden');
      modeForm.classList.add('hidden');
    }
  };

  /**
   * Setup feedback form submit event (Webhook + WhatsApp fallback)
   */
  const setupFormEvents = () => {
    const form = document.getElementById('modeForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = document.getElementById('btnSubmitFeedback');
      btn.disabled = true;
      btn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Enviando...`;

      const client = state.client;
      const feedbackData = {
        clientSlug: client.slug,
        clientName: client.name,
        rating: state.currentRating,
        customerName: document.getElementById('feedbackName').value.trim() || 'Anônimo',
        customerPhone: document.getElementById('feedbackPhone').value.trim(),
        message: document.getElementById('feedbackMessage').value.trim(),
        timestamp: new Date().toISOString()
      };

      // 1. Send to Webhook if client configured one (e.g. n8n, Make, Zapier, Discord)
      if (client.webhookUrl && client.webhookUrl.startsWith('http')) {
        try {
          await fetch(client.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedbackData),
            mode: 'no-cors' // Allows cross-origin webhooks safely
          });
        } catch (webhookErr) {
          console.warn('Webhook delivery notice:', webhookErr);
        }
      }

      // 2. Also prepare direct WhatsApp dispatch for instant manager notification
      const cleanPhone = (client.whatsapp || '').replace(/\D/g, '');
      const waMsg = encodeURIComponent(
        `🚨 *Novo Relato de Insatisfação Privado*\n\n` +
        `*Cliente:* ${client.name}\n` +
        `*Nota do Consumidor:* ${'⭐'.repeat(state.currentRating)} (${state.currentRating}/5)\n` +
        `*Nome do Consumidor:* ${feedbackData.customerName}\n` +
        `*Telefone de Contato:* ${feedbackData.customerPhone}\n\n` +
        `*Mensagem:* "${feedbackData.message}"\n\n` +
        `_Mensagem gerada via Sistema de Filtragem de Avaliações_`
      );

      // Show success message
      form.classList.add('hidden');
      const successCard = document.getElementById('feedbackSuccess');
      successCard.classList.remove('hidden');

      // Add WhatsApp redirect option in success card
      if (cleanPhone) {
        const waLink = document.createElement('a');
        waLink.href = `https://wa.me/${cleanPhone}?text=${waMsg}`;
        waLink.target = '_blank';
        waLink.rel = 'noopener noreferrer';
        waLink.className = 'mt-3 inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition';
        waLink.innerHTML = `
          <svg class="w-3.5 h-3.5 mr-1 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.076-2.115-.512-1.815-.752-2.973-2.613-3.063-2.733-.09-.12-0.736-.98-0.736-1.868 0-.888.465-1.325.63-1.505.165-.18.36-.225.48-.225.12 0 .24.001.345.006.111.005.259-.042.405.309.15.36.51 1.246.555 1.336.045.09.075.195.015.315-.06.12-.09.195-.18.3-.09.105-.19.234-.27.315-.09.09-.185.188-.08.368.105.18.468.772 1.004 1.25.69.615 1.272.805 1.452.895.18.09.285.075.39-.045.105-.12.45-.525.57-.705.12-.18.24-.15.405-.09.165.06 1.05.495 1.23.585.18.09.3.135.345.21.045.075.045.435-.099.84zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.436 5.176L2 22l4.981-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
          Abrir conversa direta no WhatsApp do Gerente
        `;
        successCard.appendChild(waLink);
      }
    });
  };

  /**
   * Reset funnel back to step 1
   */
  const resetRating = () => {
    if (state.redirectTimer) clearInterval(state.redirectTimer);
    state.currentRating = 0;

    document.getElementById('stepPositive').classList.add('hidden');
    document.getElementById('stepCritical').classList.add('hidden');
    document.getElementById('stepRating').classList.remove('hidden');

    highlightStars(0);

    // Reset form fields
    const form = document.getElementById('modeForm');
    if (form) {
      form.reset();
      form.classList.remove('hidden');
      const submitBtn = document.getElementById('btnSubmitFeedback');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Enviar Mensagem à Gerência</span><svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;
      }
    }
    const successCard = document.getElementById('feedbackSuccess');
    if (successCard) successCard.classList.add('hidden');
  };

  return {
    init,
    resetRating
  };
})();

// Start application upon DOM load
document.addEventListener('DOMContentLoaded', ReviewApp.init);
