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

  logInteraction(message) {
    console.log(`[Nova Log - ${Utils.getCurrentTime()}] ${message}`);
  }
};

// constants.js
const RESPONSES = {
  greetings: [
    "Olá! Sou a Nova, sua assistente visual.",
    "Oi! Tudo bem?",
    "Olá! Como posso ajudar?"
  ],
  unknown: [
    "Não entendi, pode repetir?",
    "Desculpe, não reconheci esse comando.",
    "Hmm, não sei como responder a isso.",
    "Você pode tentar outro comando?"
  ]
};

// canvas manager
class CanvasManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.particles = [];
    this.initParticles();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  clear(theme) {
    this.ctx.fillStyle = theme === 'dark' ? '#1a1a1a' : '#fff';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.drawParticles();
  }

  initParticles(count = 100) {
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1
    }));
  }

  drawParticles() {
    const theme = document.body.classList.contains('dark') ? '#ccc' : '#333';
    this.ctx.fillStyle = theme;
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
}

// mouse tracker
class MouseTracker {
  constructor() {
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight / 2;
    window.addEventListener('mousemove', (e) => this.update(e));
  }

  update(event) {
    this.x = event.clientX;
    this.y = event.clientY;
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
    this.setupVoiceRecognition();
    this.createDialogueBox();
    this.applyAutoTheme();
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
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '10px 20px',
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: 'white',
      borderRadius: '20px',
      maxWidth: '80%',
      textAlign: 'center',
      transition: 'opacity 0.3s',
      opacity: '0',
      fontFamily: 'monospace'
    });
    document.body.appendChild(box);
  }

  setupVoiceRecognition() {
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.recognition.lang = 'pt-BR';
    this.recognition.continuous = true;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      this.processVoiceCommand(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Erro no reconhecimento:', event.error);
    };

    this.recognition.start();
  }

  processVoiceCommand(transcript) {
    Utils.logInteraction(`Comando recebido: "${transcript}"`);

    const say = msg => {
      this.updateDialogueBox(`Nova: ${msg}`);
      Utils.logInteraction(`Resposta: "${msg}"`);
    };

    if (transcript.includes('nova ativar')) {
      this.voiceActive = true;
      say("Ativada e ouvindo 👂");
      this.blobPulse = 20;
      setTimeout(() => this.blobPulse = 0, 1000);
      return;
    }

    if (transcript.includes('nova desativar')) {
      this.voiceActive = false;
      say("Em modo silencioso 🤫");
      return;
    }

    if (!this.voiceActive) return;

    // comandos fixos
    if (transcript.includes('olá') || transcript.includes('oi')) {
      const response = RESPONSES.greetings[Math.floor(Math.random() * RESPONSES.greetings.length)];
      say(`${response} 👋`);
      this.blobPulse = 30;
      setTimeout(() => this.blobPulse = 0, 1500);
      return;
    }

    if (transcript.includes('quem é você')) {
      say("Sou a Nova, sua IA visual e interativa. Pode me chamar quando quiser! 🤖");
      return;
    }

    if (transcript.includes('mostrar data')) {
      say(`Hoje é ${Utils.getCurrentDate()}.`);
      return;
    }

    if (transcript.includes('mostrar hora')) {
      say(`Agora são ${Utils.getCurrentTime()}.`);
      return;
    }

    if (transcript.includes('ajuda') || transcript.includes('comandos')) {
      say("Você pode dizer: 'Nova ativar', 'modo escuro', 'cor azul', 'dançar', 'mostrar hora'... e muito mais!");
      return;
    }

    if (transcript.includes('modo festa')) {
      say("Entrando no modo festa! 🎉");
      this.blobSpeed = 0.05;
      this.blobPulse = 40;
      this.moodHue = Math.floor(Math.random() * 360);
      return;
    }

    const commandSets = {
      'modo escuro': () => (document.body.classList.add('dark'), "Modo escuro ativado 🌙"),
      'modo claro': () => (document.body.classList.remove('dark'), "Modo claro ativado ☀️"),
      'cor aleatória': () => (this.moodHue = Math.floor(Math.random() * 360), "Cor aleatória aplicada 🎨"),
      'resetar': () => {
        this.moodHue = 180; this.blobSize = 120; this.blobSpeed = 0.01;
        return "Configurações resetadas 🔄";
      }
    };

    for (const [command, action] of Object.entries(commandSets)) {
      if (transcript.includes(command)) {
        say(action());
        return;
      }
    }

    const unknown = RESPONSES.unknown[Math.floor(Math.random() * RESPONSES.unknown.length)];
    say(unknown);
  }

  updateDialogueBox(text) {
    const box = document.getElementById('dialogue-box');
    if (box) {
      box.textContent = text;
      box.style.opacity = '1';
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = setTimeout(() => (box.style.opacity = '0'), 4000);
    }
  }

  noise(x) {
    return (Math.sin(x * 2.1) + Math.sin(x * 0.7) + Math.sin(x * 1.3)) / 3;
  }

  drawBlob(theme) {
    const { ctx } = this.canvasManager;
    const easeX = this.canvasManager.width / 2 + (this.mouseTracker.x - this.canvasManager.width / 2) * 0.05;
    const easeY = this.canvasManager.height / 2 + (this.mouseTracker.y - this.canvasManager.height / 2) * 0.05;
    const segments = 120;

    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const r = this.blobSize + this.noise(angle + this.t) * (this.blobSize / 2);
      const px = easeX + Math.cos(angle) * r;
      const py = easeY + Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();

    const pulse = this.voiceActive ? Math.abs(Math.sin(this.t * 5)) * 20 + this.blobPulse : this.blobPulse;
    ctx.fillStyle = `hsl(${(this.moodHue + this.t * 40) % 360}, 80%, ${60 + pulse}%)`;
    ctx.shadowColor = theme === 'dark' ? '#fff' : '#000';
    ctx.shadowBlur = 40;
    ctx.fill();
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
}

document.addEventListener('DOMContentLoaded', init);
