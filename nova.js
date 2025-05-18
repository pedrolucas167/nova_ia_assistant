// utils.js
class Utils {
  static getCurrentTime() {
    return new Date().toLocaleTimeString('pt-BR', { hour12: false });
  }

  static getCurrentDate() {
    return new Date().toLocaleDateString('pt-BR');
  }

  static logInteraction(message, type = 'log') {
    const colors = {
      log: '#3498db', command: '#2ecc71', response: '#e67e22',
      error: '#e74c3c', voice: '#9b59b6', api: '#1abc9c'
    };
    console.log(`%c[Nova - ${this.getCurrentTime()}] ${message}`, `color: ${colors[type] || '#3498db'}`);
  }

  static async fetchXAIResponse(query, context) {
    try {
      return new Promise(resolve => {
        setTimeout(() => {
          const lowerQuery = query.toLowerCase();
          const responseMap = {
            weather: /tempo|clima/,
            news: /notícia|noticias/,
            biography: /quem é|quem foi/,
            greeting: /olá|oi/,
            joke: /piada/,
            followUp: () => context.length > 0 && context[context.length - 1].intent === "question"
          };

          const responseConfig = {
            weather: {
              text: "Não tenho dados meteorológicos em tempo real, mas posso sugerir verificar um app de clima ou falar sobre outra coisa!",
              intent: "weather",
              confidence: 0.9
            },
            news: {
              text: "Não tenho acesso a notícias recentes, mas posso compartilhar uma curiosidade ou ajudar com outra pergunta!",
              intent: "news",
              confidence: 0.85
            },
            biography: {
              text: `Sobre ${query.split(' ').slice(2).join(' ')}: Parece que você quer saber sobre uma pessoa ou personagem. Me conte mais ou pergunte algo específico!`,
              intent: "biography",
              confidence: 0.9
            },
            greeting: {
              text: "Oi! Estou pronta para conversar sobre qualquer coisa. O que está na sua mente?",
              intent: "greeting",
              confidence: 0.95
            },
            joke: {
              text: "Por que o astronauta terminou com a namorada? Porque precisava de espaço!",
              intent: "joke",
              confidence: 0.9
            },
            followUp: {
              text: `Continuando nossa conversa, "${query}" é interessante! Não tenho uma resposta exata, mas posso explorar mais se você quiser.`,
              intent: "follow-up",
              confidence: 0.7
            },
            default: {
              text: `Hmm, "${query}" é uma boa! Não tenho uma resposta precisa, mas posso pesquisar mais ou responder algo relacionado. O que acha?`,
              intent: "question",
              confidence: 0.6
            }
          };

          let responseType = 'default';
          for (const [type, condition] of Object.entries(responseMap)) {
            if ((typeof condition === 'function' && condition()) || 
                (condition instanceof RegExp && condition.test(lowerQuery))) {
              responseType = type;
              break;
            }
          }

          resolve(responseConfig[responseType] || responseConfig.default);
        }, 500);
      });
    } catch (error) {
      this.logInteraction(`Erro na API xAI: ${error}`, 'error');
      throw error;
    }
  }

  static tokenize(text) {
    return text.toLowerCase().split(/\s+/).filter(token => token.length > 2);
  }

  static calculateSimilarity(input, pattern) {
    const inputTokens = this.tokenize(input);
    const patternTokens = this.tokenize(pattern);
    if (!inputTokens.length || !patternTokens.length) return 0;

    const matches = inputTokens.filter(inputToken => 
      patternTokens.some(patternToken => {
        const distance = this.levenshteinDistance(inputToken, patternToken);
        return distance / Math.max(inputToken.length, patternToken.length) < 0.3;
      })
    ).length;

    return matches / Math.max(inputTokens.length, patternTokens.length);
  }

  static levenshteinDistance(a, b) {
    const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return matrix[b.length][a.length];
  }
}

// constants.js
const Config = {
  RESPONSES: {
    greetings: [
      "Olá! Sou a Nova, sua IA visual inteligente. Pergunte qualquer coisa!",
      "Oi! Pronta para explorar o universo com você!",
      "E aí! O que vamos conversar hoje?"
    ],
    unknown: [
      "Hmm, isso é novo para mim. Pode explicar mais?",
      "Não sei essa, mas posso tentar ajudar de outra forma!",
      "Ops, não entendi. Quer tentar outra pergunta?"
    ],
    affirmations: [
      "Entendido, vamos resolver isso!",
      "Ok, estou com você!",
      "Perfeito, bora lá!"
    ],
    moods: {
      happy: { hue: 120, speed: 0.02, size: 130 },
      calm: { hue: 240, speed: 0.008, size: 110 },
      excited: { hue: 0, speed: 0.05, size: 150 }
    }
  },

  COMMANDS: {
    actions: {
      'modo festa': () => ({ response: "Festa ativada! 🎉", action: 'setMood', params: 'excited' }),
      'modo calmo': () => ({ response: "Ambiente tranquilo ativado... 🧘", action: 'setMood', params: 'calm' }),
      'modo normal': () => ({ response: "Voltando ao padrão...", action: 'setMood', params: 'happy' }),
      'modo escuro': () => ({ response: "Modo escuro ligado 🌙", action: 'setTheme', params: 'dark' }),
      'modo claro': () => ({ response: "Modo claro ligado ☀️", action: 'setTheme', params: 'light' }),
      'cor aleatória': () => ({ response: "Nova cor escolhida! 🎨", action: 'randomColor' }),
      'resetar': () => ({ response: "Tudo resetado! 🔄", action: 'resetSettings' }),
      'aumenta o tamanho': () => ({ response: "Crescendo! 📈", action: 'changeSize', params: 20 }),
      'diminui o tamanho': () => ({ response: "Encolhendo! 📉", action: 'changeSize', params: -20 })
    }
  },

  UI: {
    DIALOGUE_BOX: {
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
      boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
      zIndex: 1000
    },
    INPUT_CONTAINER: {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      zIndex: 1000
    },
    INPUT_FIELD: {
      padding: '12px 20px',
      borderRadius: '25px',
      border: 'none',
      width: '300px',
      outline: 'none',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      fontSize: '14px',
      backgroundColor: 'rgba(255,255,255,0.9)'
    },
    BUTTON: {
      padding: '12px 20px',
      borderRadius: '25px',
      border: 'none',
      background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 'bold',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s'
    }
  }
};

// canvasManager.js
class CanvasManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.gradientCache = {};
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
    this.initParticles();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.gradientCache = {};
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

  clear(theme) {
    this.ctx.fillStyle = theme === 'dark' ? '#1a1a1a' : '#f5f5f5';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.drawParticles();
  }

  drawParticles() {
    const theme = document.body.classList.contains('dark') ? '#ccc' : '#333';
    if (!this.gradientCache[theme]) {
      const gradient = this.ctx.createRadialGradient(
        this.width / 2, this.height / 2, 0,
        this.width / 2, this.height / 2, Math.max(this.width, this.height) / 2
      );
      gradient.addColorStop(0, theme === '#ccc' ? 'rgba(200,200,200,0.8)' : 'rgba(50,50,50,0.8)');
      gradient.addColorStop(1, 'transparent');
      this.gradientCache[theme] = gradient;
    }

    this.ctx.fillStyle = this.gradientCache[theme];
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;
  }
}

// mouseTracker.js
class MouseTracker {
  constructor() {
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight / 2;
    this.targetX = this.x;
    this.targetY = this.y;
    this.ease = 0.05;
    window.addEventListener('mousemove', this.update.bind(this));
  }

  update(event) {
    this.targetX = event.clientX;
    this.targetY = event.clientY;
  }

  smoothUpdate() {
    this.x += (this.targetX - this.x) * this.ease;
    this.y += (this.targetY - this.y) * this.ease;
  }
}

// voiceProcessor.js
class VoiceProcessor {
  constructor(animationManager) {
    this.animationManager = animationManager;
    this.recognition = null;
    this.isActive = false;
    this.wakeWord = 'nova';
    this.confidenceThreshold = 0.6;
    this.commandBuffer = [];
    this.setupRecognition();
  }

  setupRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
      Utils.logInteraction('Voice recognition not supported', 'error');
      this.animationManager.updateDialogueBox("Reconhecimento de voz não disponível. Use o campo de texto!");
      return;
    }

    this.recognition = new webkitSpeechRecognition();
    this.recognition.lang = 'pt-BR';
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 5;

    this.recognition.onresult = this.handleResult.bind(this);
    this.recognition.onerror = this.handleError.bind(this);
    this.recognition.onend = this.handleEnd.bind(this);
    this.start();
  }

  start() {
    try {
      this.recognition.start();
      Utils.logInteraction('Voice recognition started', 'voice');
    } catch (error) {
      Utils.logInteraction(`Voice recognition error: ${error}`, 'error');
    }
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop();
      Utils.logInteraction('Voice recognition paused', 'voice');
    }
  }

  handleResult(event) {
    const result = event.results[event.results.length - 1];
    if (!result.isFinal) return;

    const alternatives = Array.from(result).map(alt => ({
      transcript: alt.transcript.trim().toLowerCase(),
      confidence: alt.confidence
    }));

    const bestMatch = alternatives.find(alt => alt.confidence >= this.confidenceThreshold) || alternatives[0];
    if (!bestMatch) return;

    const { transcript, confidence } = bestMatch;
    Utils.logInteraction(`Voice detected: "${transcript}" (confidence: ${confidence})`, 'voice');

    if (transcript.includes(`${this.wakeWord} ativar`)) {
      this.isActive = true;
      this.animationManager.updateDialogueBox("Ouvindo comandos! 👂");
      this.animationManager.blobPulse = 20;
      setTimeout(() => this.animationManager.blobPulse = 0, 1000);
      return;
    }

    if (transcript.includes(`${this.wakeWord} desativar`)) {
      this.isActive = false;
      this.animationManager.updateDialogueBox("Modo silencioso ativado 🤫");
      this.stop();
      return;
    }

    this.commandBuffer.push({ transcript, confidence, timestamp: Date.now() });
    if (this.commandBuffer.length > 10) this.commandBuffer.shift();
    this.processCommand(transcript);
  }

  async processCommand(transcript) {
    const { response, action, params } = await this.animationManager.aiProcessor.processInput(transcript);
    this.animationManager.updateDialogueBox(response);
    if (action) this.animationManager.executeAction(action, params);
  }

  handleError(event) {
    Utils.logInteraction(`Recognition error: ${event.error}`, 'error');
    if (event.error === 'no-speech' || event.error === 'network') {
      this.start();
    }
  }

  handleEnd() {
    if (this.isActive) this.start();
  }
}

// aiProcessor.js
class AIProcessor {
  constructor(animationManager) {
    this.animationManager = animationManager;
    this.context = [];
    this.maxContextLength = 10;
    this.learningRate = 0.05;
    this.intentWeights = {};
    this.commandWeights = {};
    this.initializeWeights();
  }

  initializeWeights() {
    Object.keys(Config.COMMANDS.actions).forEach(cmd => this.commandWeights[cmd] = 1.0);
    ['greeting', 'question', 'command', 'joke', 'weather', 'news', 'biography', 'follow-up', 'unknown']
      .forEach(intent => this.intentWeights[intent] = 1.0);
  }

  addContext(message, isUser, intent = 'unknown') {
    this.context.push({ 
      text: message, 
      isUser, 
      intent, 
      time: new Date().toISOString() 
    });
    if (this.context.length > this.maxContextLength) this.context.shift();
  }

  findActionCommand(input) {
    let bestMatch = { command: null, confidence: 0 };
    
    const checkCommand = (pattern) => {
      const regex = new RegExp(pattern.split('|').join('|'), 'i');
      if (regex.test(input)) {
        const confidence = (this.commandWeights[pattern] || 1.0);
        if (confidence > bestMatch.confidence) {
          bestMatch = { command: pattern, confidence, original: input.match(regex)[0] };
        }
      }
    };

    Object.keys(Config.COMMANDS.actions).forEach(checkCommand);

    if (bestMatch.confidence < 0.5) {
      Object.keys(Config.COMMANDS.actions).forEach(pattern => {
        const similarity = Utils.calculateSimilarity(input, pattern);
        const confidence = similarity * (this.commandWeights[pattern] || 1.0);
        if (confidence > bestMatch.confidence) {
          bestMatch = { command: pattern, confidence, original: pattern.split('|')[0] };
        }
      });
    }

    return bestMatch;
  }

  async processInput(input) {
    this.addContext(input, true);
    Utils.logInteraction(`Processando: "${input}"`, 'command');

    const actionMatch = this.findActionCommand(input);
    if (actionMatch.command && actionMatch.confidence > 0.7) {
      this.commandWeights[actionMatch.command] = (this.commandWeights[actionMatch.command] || 1.0) + this.learningRate;
      const result = Config.COMMANDS.actions[actionMatch.command]();
      const { response, action, params } = result;
      this.addContext(response, false, 'command');
      Utils.logInteraction(`Resposta: "${response}"`, 'response');
      return { response, action, params };
    }

    try {
      const xaiResponse = await Utils.fetchXAIResponse(input, this.context);
      const { text, intent, confidence } = xaiResponse;

      this.intentWeights[intent] = (this.intentWeights[intent] || 1.0) + this.learningRate * confidence;
      this.addContext(text, false, intent);
      Utils.logInteraction(`Resposta xAI: "${text}" (intent: ${intent}, confiança: ${confidence})`, 'api');

      let action = null;
      let params = null;
      if (intent === 'joke' || intent === 'greeting') {
        action = 'setMood';
        params = 'happy';
      } else if (intent === 'question' || intent === 'follow-up') {
        action = 'setMood';
        params = 'calm';
      }

      return { response: text, action, params };
    } catch (error) {
      const response = "Ops, algo deu errado ao processar sua solicitação. Tente novamente!";
      this.addContext(response, false, 'error');
      Utils.logInteraction(`Erro: ${error}`, 'error');
      return { response, action: null };
    }
  }
}

// animationManager.js
class AnimationManager {
  constructor(canvasManager, mouseTracker) {
    this.canvasManager = canvasManager;
    this.mouseTracker = mouseTracker;
    this.aiProcessor = new AIProcessor(this);
    this.voiceProcessor = new VoiceProcessor(this);
    this.t = 0;
    this.moodHue = 180;
    this.blobSize = 120;
    this.blobSpeed = 0.01;
    this.blobPulse = 0;
    this.currentMood = 'happy';
    this.speechSynthesis = window.speechSynthesis;
    this.fadeTimeout = null;
    this.setupUI();
    this.applyAutoTheme();
  }

  applyAutoTheme() {
    const hour = new Date().getHours();
    document.body.classList.toggle('dark', hour < 6 || hour >= 18);
    document.body.style.transition = 'background-color 0.5s ease';
  }

  setupUI() {
    this.createDialogueBox();
    this.createInputInterface();
    this.createStatusIndicator();
  }

  createDialogueBox() {
    this.dialogueBox = document.createElement('div');
    this.dialogueBox.id = 'dialogue-box';
    Object.assign(this.dialogueBox.style, Config.UI.DIALOGUE_BOX);
    document.body.appendChild(this.dialogueBox);
  }

  createInputInterface() {
    const container = document.createElement('div');
    container.id = 'input-container';
    Object.assign(container.style, Config.UI.INPUT_CONTAINER);

    this.inputField = document.createElement('input');
    this.inputField.id = 'user-input';
    this.inputField.placeholder = 'Fale ou digite qualquer coisa...';
    Object.assign(this.inputField.style, Config.UI.INPUT_FIELD);

    const button = document.createElement('button');
    button.id = 'send-button';
    button.textContent = 'Enviar';
    Object.assign(button.style, Config.UI.BUTTON);

    button.addEventListener('click', () => this.handleTextInput());
    this.inputField.addEventListener('keypress', (e) => e.key === 'Enter' && this.handleTextInput());
    button.addEventListener('mousedown', () => button.style.transform = 'scale(0.95)');
    button.addEventListener('mouseup', () => button.style.transform = 'scale(1)');

    container.appendChild(this.inputField);
    container.appendChild(button);
    document.body.appendChild(container);
  }

  createStatusIndicator() {
    this.statusIndicator = document.createElement('div');
    this.statusIndicator.id = 'status-indicator';
    Object.assign(this.statusIndicator.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '15px',
      height: '15px',
      borderRadius: '50%',
      backgroundColor: this.voiceProcessor.isActive ? '#2ecc71' : '#e74c3c',
      boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      zIndex: 1000,
      transition: 'background-color 0.3s ease'
    });
    
    const tooltip = document.createElement('div');
    tooltip.textContent = 'Status do Mic: ' + (this.voiceProcessor.isActive ? 'Ativo' : 'Inativo');
    Object.assign(tooltip.style, {
      position: 'absolute',
      top: '-30px',
      right: '0',
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '5px',
      fontSize: '12px',
      opacity: '0',
      transition: 'opacity 0.3s ease',
      pointerEvents: 'none',
      whiteSpace: 'nowrap'
    });
    
    this.statusIndicator.appendChild(tooltip);
    this.statusIndicator.addEventListener('mouseenter', () => tooltip.style.opacity = '1');
    this.statusIndicator.addEventListener('mouseleave', () => tooltip.style.opacity = '0');
    
    document.body.appendChild(this.statusIndicator);
  }

  updateStatusIndicator() {
    if (this.statusIndicator) {
      this.statusIndicator.style.backgroundColor = this.voiceProcessor.isActive ? '#2ecc71' : '#e74c3c';
      const tooltip = this.statusIndicator.querySelector('div');
      if (tooltip) {
        tooltip.textContent = 'Status do Mic: ' + (this.voiceProcessor.isActive ? 'Ativo' : 'Inativo');
      }
    }
  }

  async handleTextInput() {
    const text = this.inputField.value.trim();
    if (!text) return;

    this.inputField.value = '';
    const { response, action, params } = await this.aiProcessor.processInput(text);
    this.updateDialogueBox(response);
    this.speak(response);
    if (action) this.executeAction(action, params);
  }

  executeAction(action, params) {
    const actions = {
      setMood: () => this.setMood(params),
      setTheme: () => {
        document.body.classList.toggle('dark', params === 'dark');
        this.canvasManager.clear(params === 'dark' ? 'dark' : 'light');
      },
      randomColor: () => this.moodHue = Math.floor(Math.random() * 360),
      resetSettings: () => {
        this.moodHue = 180;
        this.blobSize = 120;
        this.blobSpeed = 0.01;
        this.setMood('happy');
      },
      changeSize: () => this.blobSize = Math.max(80, Math.min(200, this.blobSize + params))
    };

    if (actions[action]) actions[action]();
  }

  setMood(mood) {
    const moodSettings = Config.RESPONSES.moods[mood] || Config.RESPONSES.moods.happy;
    this.currentMood = mood;
    this.moodHue = moodSettings.hue;
    this.blobSpeed = moodSettings.speed;
    this.blobSize = moodSettings.size;
    this.blobPulse = 10;
    setTimeout(() => this.blobPulse = 0, 1000);
  }

  updateDialogueBox(text) {
    if (!this.dialogueBox) return;

    this.dialogueBox.innerHTML = text.replace(/\n/g, '<br>');
    this.dialogueBox.style.opacity = '1';
    this.dialogueBox.style.bottom = '80px';
    clearTimeout(this.fadeTimeout);
    this.fadeTimeout = setTimeout(() => {
      this.dialogueBox.style.opacity = '0';
      this.dialogueBox.style.bottom = '60px';
    }, 5000);
  }

  speak(text) {
    if (!this.speechSynthesis) return;
    this.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.volume = 1.0;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    this.speechSynthesis.speak(utterance);
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

    const pulse = this.voiceProcessor.isActive ? Math.abs(Math.sin(this.t * 5)) * 20 + this.blobPulse : this.blobPulse;
    const hue = (this.moodHue + this.t * 40) % 360;
    const gradient = ctx.createRadialGradient(easeX, easeY, 0, easeX, easeY, this.blobSize * 1.5);
    gradient.addColorStop(0, `hsla(${hue}, 80%, ${60 + pulse}%, 0.9)`);
    gradient.addColorStop(1, `hsla(${(hue + 30) % 360}, 80%, ${50 + pulse}%, 0.5)`);

    ctx.fillStyle = gradient;
    ctx.shadowColor = `hsla(${hue}, 80%, 50%, 0.5)`;
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = `hsla(${hue}, 100%, 80%, 0.3)`;
    ctx.lineWidth = 10;
    ctx.stroke();
  }

  animate() {
    const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    this.canvasManager.clear(theme);
    this.t += this.blobSpeed;
    this.drawBlob(theme);
    this.updateStatusIndicator();
    requestAnimationFrame(() => this.animate());
  }
}

// main.js
function init() {
  try {
    const canvasManager = new CanvasManager('canvas');
    const mouseTracker = new MouseTracker();
    const animationManager = new AnimationManager(canvasManager, mouseTracker);
    animationManager.animate();
    
    // Adiciona tema dark/light ao body
    document.body.classList.add('light');
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
    
    // Cria o canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    document.body.appendChild(canvas);
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

window.addEventListener('DOMContentLoaded', init);