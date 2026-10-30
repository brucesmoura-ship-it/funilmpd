/**
 * Review Funnel - Admin Multi-Client Management Dashboard
 * Full CRUD, Auto-slugging, QR Code generation with PNG download, and JSON Sync.
 */

const AdminApp = (() => {
  // State
  let clients = [];
  let currentQrData = { url: '', clientName: '', slug: '' };
  let isServerApiAvailable = false;

  /**
   * Slugify helper
   */
  const slugify = (text) => {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  };

  /**
   * Toast helper
   */
  const showToast = (message, icon = '✅') => {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');

    toastMsg.textContent = message;
    toastIcon.textContent = icon;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 3200);
  };

  /**
   * Compute Base Customer URL for a client
   */
  const getCustomerUrlForSlug = (slug) => {
    // Determine path to index.html
    const origin = window.location.origin;
    let path = window.location.pathname;
    
    // Replace admin.html with index.html or root
    if (path.endsWith('admin.html')) {
      path = path.replace('admin.html', 'index.html');
    } else if (!path.endsWith('/')) {
      path = path + '/';
    }

    return `${origin}${path}?cliente=${encodeURIComponent(slug)}`;
  };

  /**
   * Load Clients from API or LocalStorage/clients.json
   */
  const loadClients = async () => {
    let loaded = false;

    // 1. Try local backend server API
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        clients = await res.json();
        isServerApiAvailable = true;
        document.getElementById('dataStorageBadge').textContent = 'Backend Ativo (API)';
        document.getElementById('dataStorageBadge').className = 'px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-xs';
        loaded = true;
      }
    } catch (e) {
      isServerApiAvailable = false;
    }

    // 2. If API is not available, check LocalStorage
    if (!loaded) {
      try {
        const stored = localStorage.getItem('review_funnel_clients');
        if (stored) {
          clients = JSON.parse(stored);
          loaded = true;
        }
      } catch (err) {
        console.warn('LocalStorage read error:', err);
      }
    }

    // 3. Fallback to data/clients.json file
    if (!loaded || clients.length === 0) {
      try {
        const res = await fetch('data/clients.json');
        if (res.ok) {
          clients = await res.json();
          localStorage.setItem('review_funnel_clients', JSON.stringify(clients));
        }
      } catch (fErr) {
        console.error('Could not load data/clients.json', fErr);
      }
    }

    renderClients();
    updateStats();
  };

  /**
   * Persist clients to storage / API
   */
  const saveClients = async () => {
    // Save to LocalStorage
    localStorage.setItem('review_funnel_clients', JSON.stringify(clients));

    // If backend API exists, sync with server
    if (isServerApiAvailable) {
      try {
        await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clients)
        });
      } catch (err) {
        console.warn('Could not sync to backend API:', err);
      }
    }
  };

  /**
   * Render clients cards
   */
  const renderClients = (filterQuery = '') => {
    const grid = document.getElementById('clientsGrid');
    const emptyState = document.getElementById('emptyClientsState');
    grid.innerHTML = '';

    const q = filterQuery.toLowerCase().trim();
    const filtered = clients.filter(c => {
      if (!q) return true;
      return (
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.slug && c.slug.toLowerCase().includes(q)) ||
        (c.whatsapp && c.whatsapp.includes(q))
      );
    });

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    filtered.forEach(client => {
      const card = document.createElement('div');
      card.className = 'bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-3xl p-5 shadow-xl transition flex flex-col justify-between';

      const customerUrl = getCustomerUrlForSlug(client.slug);
      const isFormMode = client.contactMode === 'form';

      card.innerHTML = `
        <div>
          <!-- Header: Logo, Name, Badge -->
          <div class="flex items-start justify-between gap-3 mb-4">
            <div class="flex items-center space-x-3 min-w-0">
              ${
                client.logo
                  ? `<img src="${client.logo}" alt="${client.name}" class="w-12 h-12 object-cover rounded-xl border border-slate-700 shadow flex-shrink-0" onerror="this.outerHTML='<div class=\\'w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0\\'>${(client.name || 'C').charAt(0)}</div>'">`
                  : `<div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow">${(client.name || 'C').charAt(0).toUpperCase()}</div>`
              }
              <div class="min-w-0">
                <h4 class="text-sm font-bold text-white truncate" title="${client.name}">${client.name}</h4>
                <div class="flex items-center space-x-1.5 mt-0.5">
                  <span class="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                    ${client.slug}
                  </span>
                </div>
              </div>
            </div>

            <!-- Mode badge -->
            <span class="text-[10px] font-semibold uppercase px-2 py-1 rounded-full flex-shrink-0 ${
              isFormMode ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
            }">
              ${isFormMode ? 'Formulário' : 'WhatsApp'}
            </span>
          </div>

          <!-- Client Details -->
          <div class="space-y-2 text-xs text-slate-300 py-3 border-y border-slate-700/60 mb-4">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">WhatsApp:</span>
              <span class="font-mono text-slate-200">${client.whatsapp || 'Não inf.'}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Google Link:</span>
              <a href="${client.googleReviewUrl}" target="_blank" class="text-blue-400 hover:text-blue-300 truncate max-w-[180px] underline">
                Verificar Link ↗
              </a>
            </div>
            ${client.email ? `
            <div class="flex items-center justify-between">
              <span class="text-slate-500">E-mail:</span>
              <span class="text-slate-300 truncate max-w-[180px]">${client.email}</span>
            </div>` : ''}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2">
          <!-- Primary: Copy Link + QR Code -->
          <div class="grid grid-cols-2 gap-2">
            <button onclick="AdminApp.copyLink('${customerUrl}')" class="py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs transition flex items-center justify-center gap-1.5 shadow">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              Copiar Link
            </button>
            <button onclick="AdminApp.openQrModal('${client.slug}')" class="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
              QR Code
            </button>
          </div>

          <!-- Secondary: Test, Edit, Delete -->
          <div class="flex items-center justify-between pt-1">
            <a href="${customerUrl}" target="_blank" class="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1">
              <span>Testar Funil</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
            
            <div class="flex items-center space-x-2">
              <button onclick="AdminApp.editClient('${client.slug}')" class="px-2.5 py-1 text-xs text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 rounded-lg transition flex items-center gap-1" title="Editar este estabelecimento">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                <span>Editar</span>
              </button>
              <button onclick="AdminApp.deleteClient('${client.slug}')" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition" title="Excluir estabelecimento">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  };

  /**
   * Update top statistic counters
   */
  const updateStats = () => {
    document.getElementById('statTotalClients').textContent = clients.length;
    document.getElementById('statWhatsAppMode').textContent = clients.filter(c => c.contactMode === 'whatsapp').length;
    document.getElementById('statFormMode').textContent = clients.filter(c => c.contactMode === 'form').length;
  };

  /**
   * Update Logo Preview box and hidden data field
   */
  const updateLogoPreview = (logoUrl) => {
    const previewImg = document.getElementById('logoPreviewImg');
    const previewEmpty = document.getElementById('logoPreviewEmpty');
    const btnRemove = document.getElementById('btnRemoveLogo');
    const hiddenData = document.getElementById('currentLogoData');

    const cleanUrl = (logoUrl || '').trim();
    hiddenData.value = cleanUrl;

    if (cleanUrl) {
      previewImg.src = cleanUrl;
      previewImg.classList.remove('hidden');
      previewEmpty.classList.add('hidden');
      btnRemove.classList.remove('hidden');
    } else {
      previewImg.src = '';
      previewImg.classList.add('hidden');
      previewEmpty.classList.remove('hidden');
      btnRemove.classList.add('hidden');
      document.getElementById('inputLogoFile').value = '';
      document.getElementById('inputLogo').value = '';
    }
  };

  /**
   * Compress and load image file from user's computer into Base64
   */
  const processLogoFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP ou SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;

      // If SVG, use directly
      if (file.type === 'image/svg+xml') {
        updateLogoPreview(dataUrl);
        showToast('Logo SVG carregado com sucesso!');
        return;
      }

      // Optimize & resize bitmap images to max 320x320 for lightning performance
      const img = new Image();
      img.onload = () => {
        const maxDim = 320;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Keep transparency if PNG, else JPEG 0.9
        const isPng = file.type === 'image/png';
        const compressedBase64 = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.9);
        
        updateLogoPreview(compressedBase64);
        showToast('Logo do computador carregado e otimizado!', '🖼️');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  /**
   * Open Client Modal (New or Edit)
   */
  const openClientModal = (clientToEdit = null) => {
    const modal = document.getElementById('clientModal');
    const form = document.getElementById('clientForm');
    form.reset();

    if (clientToEdit) {
      document.getElementById('modalTitle').textContent = 'Editar Estabelecimento';
      document.getElementById('editOriginalSlug').value = clientToEdit.slug;
      document.getElementById('inputName').value = clientToEdit.name || '';
      document.getElementById('inputSlug').value = clientToEdit.slug || '';
      document.getElementById('inputLogo').value = clientToEdit.logo || '';
      updateLogoPreview(clientToEdit.logo || '');
      document.getElementById('inputGoogleUrl').value = clientToEdit.googleReviewUrl || '';
      document.getElementById('inputWhatsApp').value = clientToEdit.whatsapp || '';
      document.getElementById('inputEmail').value = clientToEdit.email || '';
      document.getElementById('inputWebhook').value = clientToEdit.webhookUrl || '';
      document.getElementById('inputWelcome').value = clientToEdit.welcomeMessage || '';
      
      const modeRadio = form.querySelector(`input[name="contactMode"][value="${clientToEdit.contactMode || 'form'}"]`);
      if (modeRadio) modeRadio.checked = true;

      document.getElementById('slugPreview').textContent = `?cliente=${clientToEdit.slug}`;
    } else {
      document.getElementById('modalTitle').textContent = 'Cadastrar Novo Estabelecimento';
      document.getElementById('editOriginalSlug').value = '';
      updateLogoPreview('');
      document.getElementById('slugPreview').textContent = `?cliente=...`;
    }

    modal.classList.remove('hidden');
  };

  const closeClientModal = () => {
    document.getElementById('clientModal').classList.add('hidden');
  };

  /**
   * Setup Add/Edit form submission
   */
  const setupFormHandling = () => {
    const form = document.getElementById('clientForm');
    const inputName = document.getElementById('inputName');
    const inputSlug = document.getElementById('inputSlug');
    const inputLogoFile = document.getElementById('inputLogoFile');
    const btnRemoveLogo = document.getElementById('btnRemoveLogo');
    const inputLogo = document.getElementById('inputLogo');

    // Logo upload events
    if (inputLogoFile) {
      inputLogoFile.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          processLogoFile(e.target.files[0]);
        }
      });
    }

    if (btnRemoveLogo) {
      btnRemoveLogo.addEventListener('click', () => {
        updateLogoPreview('');
      });
    }

    if (inputLogo) {
      inputLogo.addEventListener('input', (e) => {
        updateLogoPreview(e.target.value.trim());
      });
    }

    // Auto slug generation on name change (if new client)
    inputName.addEventListener('input', () => {
      const originalSlug = document.getElementById('editOriginalSlug').value;
      if (!originalSlug) {
        const generated = slugify(inputName.value);
        inputSlug.value = generated;
        document.getElementById('slugPreview').textContent = `?cliente=${generated}`;
      }
    });

    inputSlug.addEventListener('input', () => {
      inputSlug.value = slugify(inputSlug.value);
      document.getElementById('slugPreview').textContent = `?cliente=${inputSlug.value}`;
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const originalSlug = document.getElementById('editOriginalSlug').value;
      const slug = slugify(inputSlug.value);

      if (!slug) {
        alert('Por favor, informe um identificador/slug válido.');
        return;
      }

      // Check unique slug on new clients or if slug changed
      if ((!originalSlug || originalSlug !== slug) && clients.some(c => c.slug === slug)) {
        alert(`O identificador "${slug}" já está em uso por outro cliente. Escolha outro slug.`);
        return;
      }

      const currentLogo = document.getElementById('currentLogoData').value.trim() || inputLogo.value.trim();

      const clientData = {
        slug: slug,
        name: inputName.value.trim(),
        logo: currentLogo,
        googleReviewUrl: document.getElementById('inputGoogleUrl').value.trim(),
        whatsapp: document.getElementById('inputWhatsApp').value.trim().replace(/\D/g, ''),
        email: document.getElementById('inputEmail').value.trim(),
        contactMode: form.querySelector('input[name="contactMode"]:checked').value,
        webhookUrl: document.getElementById('inputWebhook').value.trim(),
        welcomeMessage: document.getElementById('inputWelcome').value.trim() || 'Como foi sua experiência com a gente hoje?',
        active: true,
        updatedAt: new Date().toISOString()
      };

      if (originalSlug) {
        const index = clients.findIndex(c => c.slug === originalSlug);
        if (index !== -1) {
          clients[index] = { ...clients[index], ...clientData };
          showToast(`Cliente "${clientData.name}" atualizado!`);
        }
      } else {
        clientData.createdAt = new Date().toISOString();
        clients.unshift(clientData);
        showToast(`Cliente "${clientData.name}" cadastrado!`);
      }

      await saveClients();
      renderClients();
      updateStats();
      closeClientModal();
    });
  };

  /**
   * Delete Client
   */
  const deleteClient = async (slug) => {
    const client = clients.find(c => c.slug === slug);
    if (!client) return;

    if (confirm(`Tem certeza que deseja excluir o cliente "${client.name}"?\nOs links e QR Codes desse cliente deixarão de funcionar.`)) {
      clients = clients.filter(c => c.slug !== slug);
      await saveClients();
      renderClients();
      updateStats();
      showToast(`Cliente "${client.name}" removido!`, '🗑️');
    }
  };

  /**
   * Edit Client trigger
   */
  const editClient = (slug) => {
    const client = clients.find(c => c.slug === slug);
    if (client) {
      openClientModal(client);
    }
  };

  /**
   * Copy Customer Link to Clipboard
   */
  const copyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copiado para a área de transferência!', '📋');
    } catch (err) {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showToast('Link copiado para a área de transferência!', '📋');
    }
  };

  /**
   * QR Code Modal & Generation
   */
  const openQrModal = (slug) => {
    const client = clients.find(c => c.slug === slug);
    if (!client) return;

    const url = getCustomerUrlForSlug(client.slug);
    currentQrData = { url, clientName: client.name, slug: client.slug };

    document.getElementById('qrModalClientName').textContent = `QR Code: ${client.name}`;
    document.getElementById('qrCodeUrlDisplay').textContent = url;

    const container = document.getElementById('qrCodeContainer');
    container.innerHTML = '';

    // Generate high resolution QR Code using QRCode.js
    new QRCode(container, {
      text: url,
      width: 240,
      height: 240,
      colorDark: '#0f172a',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    document.getElementById('qrModal').classList.remove('hidden');
  };

  const closeQrModal = () => {
    document.getElementById('qrModal').classList.add('hidden');
  };

  const copyCurrentQrLink = () => {
    if (currentQrData.url) {
      copyLink(currentQrData.url);
    }
  };

  /**
   * Download QR Code as High-Res PNG
   */
  const downloadQrPng = () => {
    const container = document.getElementById('qrCodeContainer');
    const canvas = container.querySelector('canvas');
    let dataUrl = '';

    if (canvas) {
      dataUrl = canvas.toDataURL('image/png');
    } else {
      const img = container.querySelector('img');
      if (img) dataUrl = img.src;
    }

    if (!dataUrl) {
      alert('Não foi possível gerar a imagem para download.');
      return;
    }

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode-avaliacao-${currentQrData.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Download do QR Code iniciado!', '⬇️');
  };

  /**
   * Export JSON Backup
   */
  const exportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clients, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `clientes-review-funnel-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup JSON exportado com sucesso!', '💾');
  };

  /**
   * Import JSON File
   */
  const setupImportJson = () => {
    const fileInput = document.getElementById('importJsonFile');
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            if (confirm(`Deseja importar ${imported.length} clientes? Isso substituirá a lista atual.`)) {
              clients = imported;
              await saveClients();
              renderClients();
              updateStats();
              showToast(`${imported.length} clientes importados com sucesso!`);
            }
          } else {
            alert('Formato de arquivo inválido. O arquivo JSON deve conter um array de clientes.');
          }
        } catch (err) {
          alert('Erro ao processar arquivo JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
      fileInput.value = '';
    });
  };

  /**
   * Initialize Admin Dashboard
   */
  const init = async () => {
    await loadClients();
    setupFormHandling();
    setupImportJson();

    // Event listeners
    document.getElementById('btnNewClient').onclick = () => openClientModal();
    document.getElementById('btnExportJson').onclick = exportJson;
    document.getElementById('btnDownloadQr').onclick = downloadQrPng;

    // Search input
    document.getElementById('searchInput').addEventListener('input', (e) => {
      renderClients(e.target.value);
    });
  };

  return {
    init,
    openClientModal,
    closeClientModal,
    openQrModal,
    closeQrModal,
    copyLink,
    copyCurrentQrLink,
    editClient,
    deleteClient
  };
})();

// Boot admin app
document.addEventListener('DOMContentLoaded', AdminApp.init);
