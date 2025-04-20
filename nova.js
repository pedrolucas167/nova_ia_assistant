// Configuração do Canvas (mantida igual)
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

// Rastreamento do Mouse (mantido igual)
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

// AnimationManager com reconhecimento de voz integrado
class AnimationManager {
  constructor(canvasManager, mouseTracker) {
    this.canvasManager = canvasManager;
    this.mouseTracker = mouseTracker;
    this.t = 0;
    this.moodHue = 180;
    this.voiceActive = false;
    this.setupVoiceRecognition();
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
      this.updateDialogueBox("Nova: Ativada e ouvindo");
      return;
    }

    if (transcript.includes('nova desativar')) {
      this.voiceActive = false;
      this.updateDialogueBox("Nova: Em modo silencioso");
      return;
    }

    // Se não estiver ativa, ignora outros comandos
    if (!this.voiceActive) return;

    // Processa comandos específicos
    if (transcript.includes('modo escuro')) {
      document.body.classList.add('dark');
      this.updateDialogueBox("Nova: Modo escuro ativado");
      this.moodHue = 200;
    } 
    else if (transcript.includes('modo claro')) {
      document.body.classList.remove('dark');
      this.updateDialogueBox("Nova: Modo claro ativado");
      this.moodHue = 100;
    }
    else if (transcript.includes('cor azul')) {
      this.moodHue = 240;
      this.updateDialogueBox("Nova: Cor alterada para azul");
    }
    else if (transcript.includes('cor verde')) {
      this.moodHue = 120;
      this.updateDialogueBox("Nova: Cor alterada para verde");
    }
    else {
      this.updateDialogueBox(`Nova: Ouvi "${transcript}"`);
    }
  }

  updateDialogueBox(text) {
    const box = document.getElementById('dialogue-box');
    if (box) box.textContent = text;
  }

  noise(x) {
    return (Math.sin(x * 2.1) + Math.sin(x * 0.7) + Math.sin(x * 1.3)) / 3;
  }

  drawBlob(theme) {
    const { ctx } = this.canvasManager;
    const easeX = this.canvasManager.width / 2 + (this.mouseTracker.x - this.canvasManager.width / 2) * 0.05;
    const easeY = this.canvasManager.height / 2 + (this.mouseTracker.y - this.canvasManager.height / 2) * 0.05;
    const radius = 120;
    const segments = 120;

    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const r = radius + this.noise(angle + this.t) * 50;
      const px = easeX + Math.cos(angle) * r;
      const py = easeY + Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    
    // Efeito visual quando está ouvindo
    const pulse = this.voiceActive ? Math.abs(Math.sin(this.t * 5)) * 20 : 0;
    ctx.fillStyle = `hsl(${(this.moodHue + this.t * 40) % 360}, 80%, ${60 + pulse}%)`;
    ctx.shadowColor = theme === 'dark' ? '#fff' : '#000';
    ctx.shadowBlur = 40;
    ctx.fill();
  }

  animate() {
    const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    this.canvasManager.clear(theme);
    this.t += 0.01;
    this.drawBlob(theme);
    requestAnimationFrame(() => this.animate());
  }
}

// Inicialização simplificada
function init() {
  const canvasManager = new CanvasManager('canvas');
  const mouseTracker = new MouseTracker();
  const animationManager = new AnimationManager(canvasManager, mouseTracker);
  animationManager.animate();
}

document.addEventListener('DOMContentLoaded', init);