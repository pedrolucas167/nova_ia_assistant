// utils.js
const Utils = {
  getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR');
  },

  getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString('pt-BR');
  },

  logInteraction(message, type = 'log') {
    const colors = {
      log: '#3498db',
      command: '#2ecc71',
      response: '#e67e22',
      error: '#e74c3c'
    };
    console.log(`%c[Nova - ${Utils.getCurrentTime()}] ${message}`, `color: ${colors[type] || '#3498db'}`);
  },

  async fetchKnowledgeBase(query) {
    try {
      // In a real implementation, this would connect to an actual knowledge base
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(`Informação sobre "${query}" não encontrada no banco de dados local.`);
        }, 500);
      });
    } catch (error) {
      Utils.logInteraction(`Erro ao acessar conhecimento: ${error}`, 'error');
      return null;
    }
  },

  levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= b.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }

    return matrix[b.length][a.length];
  }
};

// constants.js
const RESPONSES = {
  greetings: [
    "Olá! Sou a Nova, sua assistente visual inteligente. Como posso ajudar?",
    "Oi! Tudo bem com você hoje?",
    "Olá! Pronta para interagir com você!"
  ],
  unknown: [
    "Não entendi completamente. Poderia reformular?",
    "Desculpe, meu conhecimento ainda não cobre isso. Quer tentar outra coisa?",
    "Hmm, não tenho uma resposta para isso no momento. Que tal perguntar algo diferente?"
  ],
  affirmations: [
    "Claro, posso ajudar com isso!",
    "Entendi, vamos lá!",
    "Ótimo, aqui está o que você pediu."
  ],
  moods: {
    happy: { hue: 120, speed: 0.02, size: 130 },
    calm: { hue: 240, speed: 0.008, size: 110 },
    excited: { hue: 0, speed: 0.05, size: 150 }
  }
};

const COMMANDS = {
  basic: {
    'olá|oi|e aí': () => RESPONSES.greetings[Math.floor(Math.random() * RESPONSES.greetings.length)],
    'quem é você|se apresenta': () => "Sou a Nova, sua IA visual e interativa. Posso responder perguntas, ajudar com tarefas e interagir de forma dinâmica! 🤖",
    'hora|que horas são': () => `Agora são ${Utils.getCurrentTime()}.`,
    'data|que dia é hoje': () => `Hoje é ${Utils.getCurrentDate()}.`,
    'ajuda|comandos': () => "Aqui estão alguns comandos que conheço:\n- 'Nova ativar/desativar'\n- 'modo escuro/claro'\n- 'cor aleatória'\n- 'pesquise sobre X'\n- 'como está seu humor?'\n- 'conte uma piada'\n- 'modo festa/calmo'",
    'obrigado|valeu': () => "De nada! Estou aqui para ajudar. 😊"
  },
  actions: {
    'modo festa': () => { return { response: "Entrando no modo festa! 🎉", action: 'setMood', params: 'excited' }; },
    'modo calmo': () => { return { response: "Ativando ambiente calmo... 🧘", action: 'setMood', params: 'calm' }; },
    'modo normal': () => { return { response: "Voltando ao normal...", action: 'setMood', params: 'happy' }; },
    'modo escuro|ativa o modo escuro': () => { return { response: "Modo escuro ativado 🌙", action: 'setTheme', params: 'dark' }; },
    'modo claro|ativa o modo claro': () => { return { response: "Modo claro ativado ☀️", action: 'setTheme', params: 'light' }; },
    'cor aleatória|muda a cor': () => { return { response: "Mudando para uma cor aleatória 🎨", action: 'randomColor' }; },
    'resetar|voltar ao normal': () => { return { response: "Configurações resetadas 🔄", action: 'resetSettings' }; },
    'aumenta o tamanho|fica maior': () => { return { response: "Aumentando meu tamanho! 📈", action: 'changeSize', params: 20 }; },
    'diminui o tamanho|fica menor': () => { return { response: "Reduzindo meu tamanho! 📉", action: 'changeSize', params: -20 }; }
  },
  knowledge: {
    'pesquise sobre|quem é|o que é|onde fica': async (query) => {
      const topic = query.split(' ').slice(2).join(' ');
      const knowledge = await Utils.fetchKnowledgeBase(topic);
      return `Sobre ${topic}: ${knowledge}`;
    }
  },
  fun: {
    'conte uma piada|me faça rir': () => {
      const jokes = [
        "Por que o computador foi ao médico? Porque tinha um vírus!",
        "O que o zero disse para o oito? Belo cinto!",
        "Como transformar um giz em uma cobra? É só colocar 'S' na frente!"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    },
    'como está seu humor|como você está': () => {
      const moods = ["Estou ótima hoje!", "Me sentindo energética!", "Bem calminha...", "Pronta para ajudar!"];
      return moods[Math.floor(Math.random() * moods.length)];
    }
  }
};

// canvas manager
class CanvasManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.particles = [];
    this.initParticles(150);
    this.gradientCache = {};
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.gradientCache = {}; // Clear gradient cache on resize
  }

  clear(theme) {
    this.ctx.fillStyle = theme === 'dark' ? '#1a1a1a' : '#fff';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.drawParticles();
  }

  initParticles(count = 150) {
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 3 + 1,
      alpha: Math.random() * 0.5 + 0.1
    }));
  }

  drawParticles() {
    const theme = document.body.classList.contains('dark') ? '#ccc' : '#333';
    
    // Create gradient if not cached
    if (!this.gradientCache[theme]) {
      const gradient = this.ctx.createRadialGradient(
        this.width/2, this.height/2, 0,
        this.width/2, this.height/2, Math.max(this.width, this.height)/2
      );
      gradient.addColorStop(0, theme === '#ccc' ? 'rgba(200,200,200,0.8)' : 'rgba(50,50,50,0.8)');
      gradient.addColorStop(1, 'transparent');
      this.gradientCache[theme] = gradient;
    }

    this.ctx.fillStyle = this.gradientCache[theme];
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      // Bounce off edges
      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;
      
      // Draw with varying alpha
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;
  }
}

// mouse tracker
class MouseTracker {
  constructor() {
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight / 2;
    this.targetX = this.x;
    this.targetY = this.y;
    this.ease = 0.05;
    window.addEventListener('mousemove', (e) => this.update(e));
  }

  update(event) {
    this.targetX = event.clientX;
    this.targetY = event.clientY;
  }

  smoothUpdate() {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    this.x += dx * this.ease;
    this.y += dy * this.ease;
  }
}

// AI Processor
class AIProcessor {
  constructor(animationManager) {
    this.animationManager = animationManager;
    this.context = [];
    this.maxContextLength = 5;
    this.learningRate = 0.1;
    this.commandWeights = {};
    this.initializeWeights();
  }

  initializeWeights() {
    // Initialize weights for known commands
    Object.keys(COMMANDS.basic).forEach(cmd => this.commandWeights[cmd] = 1.0);
    Object.keys(COMMANDS.actions).forEach(cmd => this.commandWeights[cmd] = 1.0);
    Object.keys(COMMANDS.knowledge).forEach(cmd => this.commandWeights[cmd] = 1.0);
    Object.keys(COMMANDS.fun).forEach(cmd => this.commandWeights[cmd] = 1.0);
  }

  addContext(message, isUser = true) {
    this.context.push({
      text: message,
      isUser,
      time: new Date().toISOString()
    });
    
    if (this.context.length > this.maxContextLength) {
      this.context.shift();
    }
  }

  findBestMatch(input) {
    let bestMatch = { command: null, confidence: 0, type: null };
    
    // Check all command categories
    const categories = ['basic', 'actions', 'knowledge', 'fun'];
    categories.forEach(category => {
      Object.keys(COMMANDS[category]).forEach(pattern => {
        const regex = new RegExp(pattern.split('|').join('|'), 'i');
        if (regex.test(input)) {
          const confidence = this.commandWeights[pattern] || 1.0;
          if (confidence > bestMatch.confidence) {
            bestMatch = { 
              command: pattern, 
              confidence, 
              type: category,
              original: input.match(regex)[0]
            };
          }
        }
      });
    });

    // If no direct match, try fuzzy matching
    if (bestMatch.confidence === 0) {
      categories.forEach(category => {
        Object.keys(COMMANDS[category]).forEach(pattern => {
          const alternatives = pattern.split('|');
          for (const alt of alternatives) {
            const distance = Utils.levenshteinDistance(input.toLowerCase(), alt.toLowerCase());
            const similarity = 1 - (distance / Math.max(input.length, alt.length));
            
            if (similarity > 0.7 && similarity > bestMatch.confidence) {
              bestMatch = {
                command: pattern,
                confidence: similarity * (this.commandWeights[pattern] || 1.0),
                type: category,
                original: alt
              };
            }
          }
        });
      });
    }

    return bestMatch;
  }

  async processInput(input) {
    this.addContext(input, true);
    Utils.logInteraction(`Processando: "${input}"`, 'command');
    
    const { command, confidence, type, original } = this.findBestMatch(input);
    
    if (!command) {
      const response = RESPONSES.unknown[Math.floor(Math.random() * RESPONSES.unknown.length)];
      this.addContext(response, false);
      return { response, action: null };
    }

    // Update weights - reward correct matches
    this.commandWeights[command] = (this.commandWeights[command] || 1.0) + this.learningRate;
    
    try {
      let response;
      let action = null;
      let params = null;
      
      if (type === 'knowledge') {
        const query = input.replace(original, '').trim();
        response = await COMMANDS[type][command](query);
      } else {
        const result = COMMANDS[type][command]();
        if (typeof result === 'object') {
          response = result.response;
          action = result.action;
          params = result.params;
        } else {
          response = result;
        }
      }
      
      this.addContext(response, false);
      Utils.logInteraction(`Resposta: "${response}"`, 'response');
      
      return { response, action, params };
    } catch (error) {
      Utils.logInteraction(`Erro ao processar comando: ${error}`, 'error');
      const response = "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.";
      this.addContext(response, false);
      return { response, action: null };
    }
  }
}

// animation manager
class AnimationManager {
  constructor(canvasManager, mouseTracker) {
    this.canvasManager = canvasManager;
    this.mouseTracker = mouseTracker;
    this.t = 0;
    this.moodHue = 180;
    this.voiceActive = false;
    this.blobSize = 120;
    this.blobSpeed = 0.01;
    this.blobPulse = 0;
    this.aiProcessor = new AIProcessor(this);
    this.setupVoiceRecognition();
    this.createDialogueBox();
    this.createInputInterface();
    this.applyAutoTheme();
    this.currentMood = 'happy';
  }

  applyAutoTheme() {
    const hour = new Date().getHours();
    if (hour < 6 || hour >= 18) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  createDialogueBox() {
    const box = document.createElement('div');
    box.id = 'dialogue-box';
    Object.assign(box.style, {
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '15px 25px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      borderRadius: '25px',
      maxWidth: '80%',
      minWidth: '300px',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      opacity: '0',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      fontSize: '16px',
      pointerEvents: 'none',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
    });
    document.body.appendChild(box);
  }

  createInputInterface() {
    const container = document.createElement('div');
    container.id = 'input-container';
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    });

    const input = document.createElement('input');
    input.id = 'user-input';
    input.placeholder = 'Digite seu comando aqui...';
    Object.assign(input.style, {
      padding: '12px 20px',
      borderRadius: '25px',
      border: 'none',
      width: '300px',
      outline: 'none',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      fontSize: '14px'
    });

    const button = document.createElement('button');
    button.textContent = 'Enviar';
    Object.assign(button.style, {
      padding: '12px 20px',
      borderRadius: '25px',
      border: 'none',
      background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s'
    });

    button.addEventListener('click', () => this.handleTextInput());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleTextInput();
    });

    button.addEventListener('mousedown', () => {
      button.style.transform = 'scale(0.95)';
    });
    button.addEventListener('mouseup', () => {
      button.style.transform = 'scale(1)';
    });

    container.appendChild(input);
    container.appendChild(button);
    document.body.appendChild(container);
  }

  async handleTextInput() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    const { response, action, params } = await this.aiProcessor.processInput(text);
    this.updateDialogueBox(response);
    
    if (action) {
      this.executeAction(action, params);
    }
  }

  executeAction(action, params) {
    switch (action) {
      case 'setMood':
        this.setMood(params);
        break;
      case 'setTheme':
        document.body.classList.toggle('dark', params === 'dark');
        break;
      case 'randomColor':
        this.moodHue = Math.floor(Math.random() * 360);
        break;
      case 'resetSettings':
        this.moodHue = 180;
        this.blobSize = 120;
        this.blobSpeed = 0.01;
        this.setMood('happy');
        break;
      case 'changeSize':
        this.blobSize = Math.max(80, Math.min(200, this.blobSize + params));
        break;
    }
  }

  setMood(mood) {
    this.currentMood = mood;
    const moodSettings = RESPONSES.moods[mood] || RESPONSES.moods.happy;
    this.moodHue = moodSettings.hue;
    this.blobSpeed = moodSettings.speed;
    this.blobSize = moodSettings.size;
    this.blobPulse = 10;
    setTimeout(() => this.blobPulse = 0, 1000);
  }

  setupVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
      Utils.logInteraction('Reconhecimento de voz não suportado neste navegador', 'error');
      return;
    }

    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.recognition.lang = 'pt-BR';
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 3;

    this.recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      Utils.logInteraction(`Voz detectada: "${transcript}"`, 'command');

      if (transcript.toLowerCase().includes('nova ativar')) {
        this.voiceActive = true;
        this.updateDialogueBox("Ativada e ouvindo 👂");
        this.blobPulse = 20;
        setTimeout(() => this.blobPulse = 0, 1000);
        return;
      }

      if (transcript.toLowerCase().includes('nova desativar')) {
        this.voiceActive = false;
        this.updateDialogueBox("Em modo silencioso 🤫");
        return;
      }

      if (!this.voiceActive) return;

      const { response, action, params } = await this.aiProcessor.processInput(transcript);
      this.updateDialogueBox(response);
      
      if (action) {
        this.executeAction(action, params);
      }
    };

    this.recognition.onerror = (event) => {
      Utils.logInteraction(`Erro no reconhecimento de voz: ${event.error}`, 'error');
      if (event.error === 'no-speech') {
        this.recognition.start();
      }
    };

    this.recognition.onend = () => {
      if (this.voiceActive) {
        this.recognition.start();
      }
    };

    this.recognition.start();
  }

  updateDialogueBox(text) {
    const box = document.getElementById('dialogue-box');
    if (box) {
      box.innerHTML = text.replace(/\n/g, '<br>');
      box.style.opacity = '1';
      box.style.bottom = '80px';
      
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = setTimeout(() => {
        box.style.opacity = '0';
        box.style.bottom = '60px';
      }, 5000);
    }
  }

  noise(x) {
    return (Math.sin(x * 2.1) + Math.sin(x * 0.7) + Math.sin(x * 1.3)) / 3;
  }

  drawBlob(theme) {
    const { ctx } = this.canvasManager;
    this.mouseTracker.smoothUpdate();
    const easeX = this.canvasManager.width / 2 + (this.mouseTracker.x - this.canvasManager.width / 2) * 0.05;
    const easeY = this.canvasManager.height / 2 + (this.mouseTracker.y - this.canvasManager.height / 2) * 0.05;
    const segments = 120;

    // Create blob path
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const noiseFactor = this.noise(angle * 2 + this.t) * 0.5 + 0.5;
      const r = this.blobSize * (0.8 + noiseFactor * 0.4) + this.blobPulse;
      const px = easeX + Math.cos(angle) * r;
      const py = easeY + Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();

    // Create gradient
    const gradient = ctx.createRadialGradient(
      easeX, easeY, 0,
      easeX, easeY, this.blobSize * 1.5
    );
    const pulse = this.voiceActive ? Math.abs(Math.sin(this.t * 5)) * 20 + this.blobPulse : this.blobPulse;
    const hue = (this.moodHue + this.t * 40) % 360;
    gradient.addColorStop(0, `hsla(${hue}, 80%, ${60 + pulse}%, 0.9)`);
    gradient.addColorStop(1, `hsla(${(hue + 30) % 360}, 80%, ${50 + pulse}%, 0.5)`);

    // Draw blob with shadow
    ctx.fillStyle = gradient;
    ctx.shadowColor = `hsla(${hue}, 80%, 50%, 0.5)`;
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw inner glow
    ctx.strokeStyle = `hsla(${hue}, 100%, 80%, 0.3)`;
    ctx.lineWidth = 10;
    ctx.stroke();
  }

  animate() {
    const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    this.canvasManager.clear(theme);
    this.t += this.blobSpeed;
    this.drawBlob(theme);
    requestAnimationFrame(() => this.animate());
  }
}

// init
function init() {
  const canvasManager = new CanvasManager('canvas');
  const mouseTracker = new MouseTracker();
  const animationManager = new AnimationManager(canvasManager, mouseTracker);
  animationManager.animate();

  // Add style for dark mode transition
  const style = document.createElement('style');
  style.textContent = `
    body {
      transition: background-color 0.5s ease;
    }
    body.dark {
      background-color: #121212;
      color: #f0f0f0;
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', init);