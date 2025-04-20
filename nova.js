class CanvasManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  clear(theme) {
    this.ctx.fillStyle = theme === 'dark' ? '#1a1a1a' : '#fff';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

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
  }

  createDialogueBox() {
    const box = document.createElement('div');
    box.id = 'dialogue-box';
    box.style.position = 'fixed';
    box.style.bottom = '20px';
    box.style.left = '50%';
    box.style.transform = 'translateX(-50%)';
    box.style.padding = '10px 20px';
    box.style.backgroundColor = 'rgba(0,0,0,0.7)';
    box.style.color = 'white';
    box.style.borderRadius = '20px';
    box.style.maxWidth = '80%';
    box.style.textAlign = 'center';
    box.style.transition = 'opacity 0.3s';
    box.style.opacity = '0';
    document.body.appendChild(box);
  }

  setupVoiceRecognition() {
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.recognition.lang = 'pt-BR';
    this.recognition.continuous = true;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      this.processVoiceCommand(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Erro no reconhecimento:', event.error);
    };

    this.recognition.start();
  }

  processVoiceCommand(transcript) {
    // Comandos de ativação/desativação
    if (transcript.includes('nova ativar')) {
      this.voiceActive = true;
      this.updateDialogueBox("Nova: Ativada e ouvindo 👂");
      this.blobPulse = 20;
      setTimeout(() => this.blobPulse = 0, 1000);
      return;
    }

    if (transcript.includes('nova desativar')) {
      this.voiceActive = false;
      this.updateDialogueBox("Nova: Em modo silencioso 🤫");
      return;
    }

    if (!this.voiceActive) return;

    // Comandos de interação básica
    if (transcript.includes('olá') || transcript.includes('oi') || transcript.includes('ola')) {
      const greetings = ["Olá! Sou a Nova, sua assistente visual.", "Oi! Tudo bem?", "Olá! Como posso ajudar?"];
      const response = greetings[Math.floor(Math.random() * greetings.length)];
      this.updateDialogueBox(`Nova: ${response} 👋`);
      this.blobPulse = 30;
      setTimeout(() => this.blobPulse = 0, 1500);
      return;
    }

    if (transcript.includes('quem é você') || transcript.includes('quem e você')) {
      this.updateDialogueBox("Nova: Sou uma entidade visual interativa. Você pode me controlar por voz! 🎤");
      return;
    }

    // Comandos de aparência
    const appearanceCommands = {
      'modo escuro': () => {
        document.body.classList.add('dark');
        this.moodHue = 200;
        return "Modo escuro ativado 🌙";
      },
      'modo claro': () => {
        document.body.classList.remove('dark');
        this.moodHue = 100;
        return "Modo claro ativado ☀️";
      },
      'cor azul': () => {
        this.moodHue = 240;
        return "Cor alterada para azul 🔵";
      },
      'cor verde': () => {
        this.moodHue = 120;
        return "Cor alterada para verde 🟢";
      },
      'cor vermelha': () => {
        this.moodHue = 0;
        return "Cor alterada para vermelho 🔴";
      },
      'cor rosa': () => {
        this.moodHue = 300;
        return "Cor alterada para rosa 💖";
      },
      'cor aleatória': () => {
        this.moodHue = Math.floor(Math.random() * 360);
        return "Cor alterada aleatoriamente 🎨";
      }
    };

    // Comandos de comportamento
    const behaviorCommands = {
      'aumentar tamanho': () => {
        this.blobSize = Math.min(this.blobSize + 20, 200);
        return `Tamanho aumentado para ${this.blobSize} ⬆️`;
      },
      'diminuir tamanho': () => {
        this.blobSize = Math.max(this.blobSize - 20, 60);
        return `Tamanho diminuído para ${this.blobSize} ⬇️`;
      },
      'aumentar velocidade': () => {
        this.blobSpeed = Math.min(this.blobSpeed + 0.01, 0.05);
        return `Velocidade aumentada 🏃`;
      },
      'diminuir velocidade': () => {
        this.blobSpeed = Math.max(this.blobSpeed - 0.01, 0.005);
        return `Velocidade diminuída 🚶`;
      },
      'resetar': () => {
        this.moodHue = 180;
        this.blobSize = 120;
        this.blobSpeed = 0.01;
        return "Configurações resetadas 🔄";
      },
      'dançar': () => {
        this.blobSpeed = 0.03;
        setTimeout(() => this.blobSpeed = 0.01, 3000);
        return "Dançando! 💃";
      }
    };

    // Processar comandos de aparência
    for (const [command, action] of Object.entries(appearanceCommands)) {
      if (transcript.includes(command)) {
        const response = action();
        this.updateDialogueBox(`Nova: ${response}`);
        return;
      }
    }

    // Processar comandos de comportamento
    for (const [command, action] of Object.entries(behaviorCommands)) {
      if (transcript.includes(command)) {
        const response = action();
        this.updateDialogueBox(`Nova: ${response}`);
        return;
      }
    }

    
    const unknownResponses = [
      "Não entendi, pode repetir?",
      "Desculpe, não reconheci esse comando",
      "Hmm, não sei como responder a isso",
      "Você pode tentar outro comando?"
    ];
    const randomResponse = unknownResponses[Math.floor(Math.random() * unknownResponses.length)];
    this.updateDialogueBox(`Nova: ${randomResponse}`);
  }

  updateDialogueBox(text) {
    const box = document.getElementById('dialogue-box');
    if (box) {
      box.textContent = text;
      box.style.opacity = '1';
      setTimeout(() => box.style.opacity = '0', 3000);
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
      const r = this.blobSize + this.noise(angle + this.t) * (this.blobSize/2);
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

function init() {
  const canvasManager = new CanvasManager('canvas');
  const mouseTracker = new MouseTracker();
  const animationManager = new AnimationManager(canvasManager, mouseTracker);
  animationManager.animate();
}

document.addEventListener('DOMContentLoaded', init);