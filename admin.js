<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Painel de Gestão Multi-Cliente | Review Funnel</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#f0f9ff',
              100: '#e0f2fe',
              500: '#0284c7',
              600: '#0369a1',
              700: '#075985',
            }
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
          }
        }
      }
    }
  </script>

  <!-- QRCode.js library for offline high-res QR Code generation -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <style>
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up {
      animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .glass-panel {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }
  </style>
</head>
<body class="bg-slate-900 min-h-screen text-slate-100 font-sans antialiased">

  <!-- Top Navigation Header -->
  <header class="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
        </div>
        <div>
          <span class="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Review Funnel Admin
            <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Multi-Cliente</span>
          </span>
          <span class="text-xs text-slate-400 block -mt-0.5">Triagem Inteligente de Avaliações Google</span>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <button id="btnExportJson" onclick="AdminApp.exportJson()" class="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 border border-slate-700">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Exportar JSON
        </button>
        <label for="importJsonFile" class="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer flex items-center gap-1.5 border border-slate-700">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          Importar
          <input type="file" id="importJsonFile" accept=".json" class="hidden">
        </label>
        <button id="btnNewClient" onclick="AdminApp.openClientModal()" class="text-xs sm:text-sm font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Cadastrar Cliente
        </button>
      </div>
    </div>
  </header>

  <!-- Main Body Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <!-- Hero / Stats Bar -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
        <span class="text-xs font-medium text-slate-400">Total de Estabelecimentos</span>
        <div class="text-2xl font-black text-white mt-1" id="statTotalClients">0</div>
      </div>
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
        <span class="text-xs font-medium text-slate-400">Modo WhatsApp Direto</span>
        <div class="text-2xl font-black text-emerald-400 mt-1" id="statWhatsAppMode">0</div>
      </div>
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
        <span class="text-xs font-medium text-slate-400">Modo Formulário Interno</span>
        <div class="text-2xl font-black text-blue-400 mt-1" id="statFormMode">0</div>
      </div>
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
        <span class="text-xs font-medium text-slate-400">Compliance Google</span>
        <div class="text-xs font-semibold text-emerald-300 mt-2 flex items-center gap-1.5">
          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          Gating com link de saída
        </div>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div class="relative w-full sm:w-96">
        <input type="text" id="searchInput" placeholder="Buscar por nome, slug ou WhatsApp..." class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>

      <div class="flex items-center space-x-2 text-xs text-slate-400">
        <span>Origem dos Dados:</span>
        <span id="dataStorageBadge" class="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono">
          Local / Memória
        </span>
      </div>
    </div>

    <!-- Clients Grid -->
    <div id="clientsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Injected dynamically by JS -->
    </div>

    <!-- Empty State -->
    <div id="emptyClientsState" class="hidden text-center py-16 bg-slate-800/40 border border-slate-800 rounded-3xl p-8">
      <div class="w-16 h-16 bg-slate-800 text-slate-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
      </div>
      <h3 class="text-lg font-bold text-slate-200 mb-1">Nenhum cliente cadastrado</h3>
      <p class="text-xs text-slate-400 max-w-sm mx-auto mb-6">
        Comece adicionando seu primeiro cliente para gerar o link e o QR Code de avaliação.
      </p>
      <button onclick="AdminApp.openClientModal()" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition">
        Cadastrar Primeiro Cliente
      </button>
    </div>

  </main>

  <!-- MODAL: ADD / EDIT CLIENT -->
  <div id="clientModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-slide-up">
      <div class="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        <h3 id="modalTitle" class="text-lg font-bold text-white">Cadastrar Novo Cliente</h3>
        <button type="button" onclick="AdminApp.closeClientModal()" class="text-slate-400 hover:text-white transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <form id="clientForm" class="p-6 space-y-4">
        <input type="hidden" id="editOriginalSlug" value="">

        <!-- Name & Slug -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Nome da Empresa <span class="text-rose-400">*</span></label>
            <input type="text" id="inputName" required placeholder="Ex: Pizzaria Bella Napoli" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Identificador / Slug da URL <span class="text-rose-400">*</span></label>
            <input type="text" id="inputSlug" required placeholder="pizzaria-bella-napoli" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-blue-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span class="text-[11px] text-slate-500 mt-1 block">Ficará: <code id="slugPreview" class="text-slate-400">?cliente=...</code></span>
          </div>
        </div>

        <!-- Logo Upload / URL -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Logotipo da Empresa</label>
          
          <div class="flex items-center gap-4 bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5">
            <!-- Preview Box -->
            <div id="logoPreviewBox" class="w-16 h-16 rounded-xl border border-dashed border-slate-600 bg-slate-900/60 flex items-center justify-center flex-shrink-0 overflow-hidden relative group">
              <img id="logoPreviewImg" src="" alt="Preview" class="w-full h-full object-cover hidden">
              <div id="logoPreviewEmpty" class="text-slate-500 text-center p-1">
                <svg class="w-6 h-6 mx-auto mb-0.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="text-[9px] block leading-none">Sem logo</span>
              </div>
            </div>

            <!-- Upload Controls -->
            <div class="flex-1 space-y-1.5">
              <div class="flex items-center gap-2">
                <label for="inputLogoFile" class="cursor-pointer inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition">
                  <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                  Escolher do Computador
                  <input type="file" id="inputLogoFile" accept="image/png, image/jpeg, image/webp, image/svg+xml" class="hidden">
                </label>
                <button type="button" id="btnRemoveLogo" class="hidden px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-rose-600/80 text-slate-300 hover:text-white text-xs transition">
                  Remover
                </button>
              </div>
              <p class="text-[11px] text-slate-400">
                Formatos aceitos: PNG, JPG, WebP ou SVG (otimizado automaticamente).
              </p>
              
              <!-- Toggle URL Option -->
              <details class="text-[11px] text-slate-400 pt-0.5">
                <summary class="cursor-pointer hover:text-blue-400 select-none">Ou colar link web direto (URL)</summary>
                <div class="mt-1.5">
                  <input type="url" id="inputLogo" placeholder="https://exemplo.com/logo.png" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500">
                </div>
              </details>
            </div>
          </div>
          <!-- Hidden storage for actual data/base64 -->
          <input type="hidden" id="currentLogoData" value="">
        </div>

        <!-- Google Review URL -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Link de Avaliação do Google (Google Review URL) <span class="text-rose-400">*</span></label>
          <input type="url" id="inputGoogleUrl" required placeholder="https://search.google.com/local/writereview?placeid=..." class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <span class="text-[11px] text-slate-500 mt-1 block">Link direto onde o Google abre o modal de 5 estrelas.</span>
        </div>

        <!-- WhatsApp & Email -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">WhatsApp do Gerente (com DDD) <span class="text-rose-400">*</span></label>
            <input type="text" id="inputWhatsApp" required placeholder="5511999998888" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span class="text-[11px] text-slate-500 mt-1 block">Ex: 55 + DDD + Número (sem traços/espaços)</span>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">E-mail do Gerente (opcional)</label>
            <input type="email" id="inputEmail" placeholder="gerente@estabelecimento.com" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
        </div>

        <!-- Contact Mode for 1-3 Stars -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Modo de Tratativa para Notas Críticas (1 a 3 estrelas) <span class="text-rose-400">*</span></label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
            <label class="flex items-center p-3 rounded-xl border border-slate-700 bg-slate-800/80 cursor-pointer hover:border-blue-500 transition">
              <input type="radio" name="contactMode" value="whatsapp" class="text-blue-500 focus:ring-blue-500 h-4 w-4">
              <div class="ml-3">
                <span class="text-xs font-bold text-slate-200 block">WhatsApp Direto</span>
                <span class="text-[11px] text-slate-400">Botão que abre conversa com texto pré-definido.</span>
              </div>
            </label>
            <label class="flex items-center p-3 rounded-xl border border-slate-700 bg-slate-800/80 cursor-pointer hover:border-blue-500 transition">
              <input type="radio" name="contactMode" value="form" checked class="text-blue-500 focus:ring-blue-500 h-4 w-4">
              <div class="ml-3">
                <span class="text-xs font-bold text-slate-200 block">Formulário Interno</span>
                <span class="text-[11px] text-slate-400">Coleta nome, telefone e relato na própria página.</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Optional: Webhook URL -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Webhook de Notificação (Opcional - n8n / Make / Zapier / CRM)</label>
          <input type="url" id="inputWebhook" placeholder="https://seu-servidor.com/webhook/reviews" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <!-- Optional: Custom Welcome Message -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Pergunta Inicial Customizada (Opcional)</label>
          <input type="text" id="inputWelcome" placeholder="Como foi sua experiência com a gente hoje?" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <!-- Modal Actions -->
        <div class="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button type="button" onclick="AdminApp.closeClientModal()" class="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition">
            Cancelar
          </button>
          <button type="submit" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition">
            Salvar Cliente
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: QR CODE DISPLAY & DOWNLOAD -->
  <div id="qrModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up text-center p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-base font-bold text-white" id="qrModalClientName">QR Code de Avaliação</h3>
        <button onclick="AdminApp.closeQrModal()" class="text-slate-400 hover:text-white transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- High Res QR Code Canvas Container -->
      <div class="bg-white p-5 rounded-2xl inline-block shadow-inner mb-4 mx-auto" id="qrCodeContainer">
        <!-- Rendered by QRCode.js -->
      </div>

      <div class="text-xs text-slate-400 mb-5 break-all font-mono px-2" id="qrCodeUrlDisplay">
        https://...
      </div>

      <div class="space-y-2">
        <button id="btnDownloadQr" onclick="AdminApp.downloadQrPng()" class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Baixar Imagem PNG (Alta Resolução)
        </button>
        <button onclick="AdminApp.copyCurrentQrLink()" class="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          Copiar Link Direto
        </button>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toast" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none">
    <div class="bg-slate-800 border border-slate-700 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
      <span id="toastIcon">✅</span>
      <span id="toastMsg">Operação realizada com sucesso</span>
    </div>
  </div>

  <!-- Inlined & Bulletproof Admin Script (Self-Contained) -->
  <script>
    const AdminApp = (() => {
      const DEFAULT_CLIENTS = [
        {
          "slug": "pizzaria-do-joao",
          "name": "Pizzaria do João & Forneria",
          "logo": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80",
          "googleReviewUrl": "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
          "whatsapp": "5511987654321",
          "email": "gerente@pizzariadojoao.com.br",
          "contactMode": "form",
          "webhookUrl": "",
          "welcomeMessage": "Como foi sua experiência com a nossa pizza hoje?",
          "active": true
        },
        {
          "slug": "dr-bruno-odontologia",
          "name": "Dr. Bruno - Odontologia Especializada",
          "logo": "",
          "googleReviewUrl": "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
          "whatsapp": "5519991234567",
          "email": "contato@drbruno.com.br",
          "contactMode": "whatsapp",
          "webhookUrl": "",
          "welcomeMessage": "Como foi seu atendimento na nossa clínica hoje?",
          "active": true
        }
      ];

      let clients = [];
      let currentQrData = { url: '', clientName: '', slug: '' };

      const slugify = (text) => {
        return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-');
      };

      const showToast = (message, icon = '✅') => {
        const toast = document.getElementById('toast');
        if (!toast) return;
        document.getElementById('toastMsg').textContent = message;
        document.getElementById('toastIcon').textContent = icon;
        toast.classList.remove('translate-y-20', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
        setTimeout(() => {
          toast.classList.remove('translate-y-0', 'opacity-100');
          toast.classList.add('translate-y-20', 'opacity-0');
        }, 3200);
      };

      const getCustomerUrlForSlug = (slug) => {
        const origin = window.location.origin;
        let path = window.location.pathname.replace('admin.html', '').replace('admin', '').replace(/\/+$/, '');
        return `${origin}${path}/?cliente=${encodeURIComponent(slug)}`;
      };

      const loadClients = async () => {
        let loaded = false;
        try {
          const stored = localStorage.getItem('review_funnel_clients');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              clients = parsed;
              loaded = true;
            }
          }
        } catch (e) {}

        if (!loaded) {
          try {
            const res = await fetch('data/clients.json');
            if (res.ok) {
              clients = await res.json();
              loaded = true;
            }
          } catch (fErr) {}
        }

        if (!loaded || clients.length === 0) {
          clients = DEFAULT_CLIENTS;
        }

        saveClients();
        renderClients();
        updateStats();
      };

      const saveClients = () => {
        try {
          localStorage.setItem('review_funnel_clients', JSON.stringify(clients));
        } catch (e) {}
      };

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

      const processLogoFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          if (file.type === 'image/svg+xml') {
            updateLogoPreview(dataUrl);
            return;
          }
          const img = new Image();
          img.onload = () => {
            const maxDim = 320;
            let w = img.width, h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
              else { w = Math.round((w * maxDim) / h); h = maxDim; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            updateLogoPreview(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.9));
            showToast('Logo carregada com sucesso!', '🖼️');
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      };

      const renderClients = (filterQuery = '') => {
        const grid = document.getElementById('clientsGrid');
        const emptyState = document.getElementById('emptyClientsState');
        grid.innerHTML = '';

        const q = filterQuery.toLowerCase().trim();
        const filtered = clients.filter(c => !q || (c.name && c.name.toLowerCase().includes(q)) || (c.slug && c.slug.toLowerCase().includes(q)));

        if (filtered.length === 0) {
          emptyState.classList.remove('hidden');
          return;
        }
        emptyState.classList.add('hidden');

        filtered.forEach(client => {
          const card = document.createElement('div');
          card.className = 'bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-3xl p-5 shadow-xl transition flex flex-col justify-between';
          const customerUrl = getCustomerUrlForSlug(client.slug);
          const isForm = client.contactMode === 'form';

          card.innerHTML = `
            <div>
              <div class="flex items-start justify-between gap-3 mb-4">
                <div class="flex items-center space-x-3 min-w-0">
                  ${client.logo 
                    ? `<img src="${client.logo}" class="w-12 h-12 object-cover rounded-xl border border-slate-700 shadow flex-shrink-0" onerror="this.outerHTML='<div class=\\'w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0\\'>${(client.name || 'C').charAt(0)}</div>'">`
                    : `<div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow">${(client.name || 'C').charAt(0).toUpperCase()}</div>`
                  }
                  <div class="min-w-0">
                    <h4 class="text-sm font-bold text-white truncate" title="${client.name}">${client.name}</h4>
                    <span class="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md truncate max-w-[150px] inline-block mt-0.5">${client.slug}</span>
                  </div>
                </div>
                <span class="text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${isForm ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'}">
                  ${isForm ? 'Formulário' : 'WhatsApp'}
                </span>
              </div>
              <div class="space-y-1.5 text-xs text-slate-300 py-3 border-y border-slate-700/60 mb-4">
                <div class="flex justify-between"><span class="text-slate-500">WhatsApp:</span><span class="font-mono text-slate-200">${client.whatsapp || 'Não inf.'}</span></div>
                <div class="flex justify-between"><span class="text-slate-500">Google Review:</span><a href="${client.googleReviewUrl}" target="_blank" class="text-blue-400 underline truncate max-w-[170px]">Verificar Link ↗</a></div>
              </div>
            </div>
            <div class="space-y-2">
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
              <div class="flex items-center justify-between pt-1">
                <a href="${customerUrl}" target="_blank" class="text-xs text-slate-400 hover:text-slate-200 transition">Testar Funil ↗</a>
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

      const updateStats = () => {
        document.getElementById('statTotalClients').textContent = clients.length;
        document.getElementById('statWhatsAppMode').textContent = clients.filter(c => c.contactMode === 'whatsapp').length;
        document.getElementById('statFormMode').textContent = clients.filter(c => c.contactMode === 'form').length;
      };

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

      const setupFormHandling = () => {
        const form = document.getElementById('clientForm');
        const inputName = document.getElementById('inputName');
        const inputSlug = document.getElementById('inputSlug');
        const inputLogoFile = document.getElementById('inputLogoFile');
        const btnRemoveLogo = document.getElementById('btnRemoveLogo');
        const inputLogo = document.getElementById('inputLogo');

        if (inputLogoFile) {
          inputLogoFile.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length) processLogoFile(e.target.files[0]);
          });
        }
        if (btnRemoveLogo) btnRemoveLogo.addEventListener('click', () => updateLogoPreview(''));
        if (inputLogo) inputLogo.addEventListener('input', (e) => updateLogoPreview(e.target.value.trim()));

        inputName.addEventListener('input', () => {
          if (!document.getElementById('editOriginalSlug').value) {
            const gen = slugify(inputName.value);
            inputSlug.value = gen;
            document.getElementById('slugPreview').textContent = `?cliente=${gen}`;
          }
        });

        inputSlug.addEventListener('input', () => {
          inputSlug.value = slugify(inputSlug.value);
          document.getElementById('slugPreview').textContent = `?cliente=${inputSlug.value}`;
        });

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const originalSlug = document.getElementById('editOriginalSlug').value;
          const slug = slugify(inputSlug.value);
          if (!slug) return alert('Por favor, informe um identificador/slug válido.');

          if ((!originalSlug || originalSlug !== slug) && clients.some(c => c.slug === slug)) {
            return alert(`O identificador "${slug}" já está em uso por outro cliente.`);
          }

          const currentLogo = document.getElementById('currentLogoData').value.trim() || inputLogo.value.trim();

          const clientData = {
            slug,
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
            const idx = clients.findIndex(c => c.slug === originalSlug);
            if (idx !== -1) clients[idx] = { ...clients[idx], ...clientData };
            showToast(`Cliente "${clientData.name}" atualizado!`);
          } else {
            clientData.createdAt = new Date().toISOString();
            clients.unshift(clientData);
            showToast(`Cliente "${clientData.name}" cadastrado!`);
          }

          saveClients();
          renderClients();
          updateStats();
          closeClientModal();
        });
      };

      const copyLink = async (url) => {
        try {
          await navigator.clipboard.writeText(url);
          showToast('Link copiado para a área de transferência!', '📋');
        } catch (err) {
          const input = document.createElement('input');
          input.value = url;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          showToast('Link copiado para a área de transferência!', '📋');
        }
      };

      const openQrModal = (slug) => {
        const client = clients.find(c => c.slug === slug);
        if (!client) return;
        const url = getCustomerUrlForSlug(client.slug);
        currentQrData = { url, clientName: client.name, slug: client.slug };
        document.getElementById('qrModalClientName').textContent = `QR Code: ${client.name}`;
        document.getElementById('qrCodeUrlDisplay').textContent = url;
        const container = document.getElementById('qrCodeContainer');
        container.innerHTML = '';
        new QRCode(container, {
          text: url, width: 240, height: 240, colorDark: '#0f172a', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H
        });
        document.getElementById('qrModal').classList.remove('hidden');
      };

      const closeQrModal = () => document.getElementById('qrModal').classList.add('hidden');

      const copyCurrentQrLink = () => {
        if (currentQrData.url) copyLink(currentQrData.url);
      };

      const downloadQrPng = () => {
        const canvas = document.querySelector('#qrCodeContainer canvas');
        let dataUrl = canvas ? canvas.toDataURL('image/png') : (document.querySelector('#qrCodeContainer img')?.src || '');
        if (!dataUrl) return alert('Não foi possível gerar a imagem.');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `qrcode-${currentQrData.slug}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('Download do QR Code iniciado!', '⬇️');
      };

      const exportJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clients, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `backup-clientes-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('Backup exportado com sucesso!', '💾');
      };

      const setupImportJson = () => {
        const fileInput = document.getElementById('importJsonFile');
        if (!fileInput) return;
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const imported = JSON.parse(event.target.result);
              if (Array.isArray(imported)) {
                clients = imported;
                saveClients();
                renderClients();
                updateStats();
                showToast(`${imported.length} clientes importados!`);
              }
            } catch (err) {
              alert('Arquivo JSON inválido.');
            }
          };
          reader.readAsText(file);
          fileInput.value = '';
        });
      };

      const init = async () => {
        setupFormHandling();
        setupImportJson();
        await loadClients();

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
          searchInput.addEventListener('input', (e) => renderClients(e.target.value));
        }
      };

      return {
        init,
        openClientModal,
        closeClientModal,
        openQrModal,
        closeQrModal,
        copyLink,
        copyCurrentQrLink,
        downloadQrPng,
        exportJson,
        editClient: (slug) => {
          const c = clients.find(item => item.slug === slug);
          if (c) openClientModal(c);
        },
        deleteClient: (slug) => {
          const c = clients.find(item => item.slug === slug);
          if (c && confirm(`Deseja excluir "${c.name}"?`)) {
            clients = clients.filter(item => item.slug !== slug);
            saveClients();
            renderClients();
            updateStats();
            showToast('Cliente removido!', '🗑️');
          }
        }
      };
    })();

    document.addEventListener('DOMContentLoaded', AdminApp.init);
  </script>
</body>
</html>
