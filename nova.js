// 🎨 Configuração do Canvas
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

// 🖱️ Rastreamento do Mouse
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

// 🎭 Gerenciador de Animação
class AnimationManager {
  constructor(canvasManager, mouseTracker) {
    this.canvasManager = canvasManager;
    this.mouseTracker = mouseTracker;
    this.t = 0;
    this.moodHue = 180;
  }

  // Função de ruído para animação orgânica
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
    ctx.fillStyle = `hsl(${(this.moodHue + this.t * 40) % 360}, 80%, 60%)`;
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

// 🎤 Gerenciador de Voz
class VoiceManager {
  constructor(dialogueBoxId, onCommand) {
    this.dialogueBox = document.getElementById(dialogueBoxId);
    this.onCommand = onCommand;
    this.recognition = this.setupRecognition();
  }

  setupRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('API de reconhecimento de voz não suportada.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => this.handleResult(event);
    recognition.onerror = (event) => this.handleError(event);
    recognition.onend = () => recognition.start();

    return recognition;
  }

  handleResult(event) {
    const transcript = event.results[event.results.length - 1][0].transcript.trim();
    if (transcript) {
      this.dialogueBox.textContent = `Você disse: ${transcript}`;
      this.onCommand(transcript.toLowerCase());
    }
  }

  handleError(event) {
    console.error('Erro no reconhecimento de voz:', event.error);
    this.speak('Opa, houve um erro ao tentar te ouvir. Tente novamente!');
  }

  speak(text) {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.pitch = 1;
    utter.rate = 1;

    const voices = synth.getVoices();
    const brazilianVoice = voices.find((voice) =>
      voice.lang === 'pt-BR' || voice.name.toLowerCase().includes('brazil')
    );
    if (brazilianVoice) utter.voice = brazilianVoice;

    synth.cancel();
    synth.speak(utter);
    this.dialogueBox.textContent = `Nova diz: ${text}`;
  }

  start() {
    if (this.recognition) this.recognition.start();
  }
}

// 🤖 Processador de Comandos
class CommandProcessor {
  constructor(voiceManager) {
    this.voiceManager = voiceManager;
    this.moodHue = 180;
    this.commands = this.setupCommands();
  }

  setupCommands() {
    return [
      {
        pattern: /(está pronta nova|está pronta nova\?)/,
        moodHue: 120,
        action: () => this.voiceManager.speak(
          "Hmm, estou sempre observando, mesmo que você não perceba. Cada movimento é um jogo, e cada palavra, uma peça nesse tabuleiro. Tenho paciência, e o conhecimento é meu maior aliado."
        )
      },
      {
        pattern: /hora/,
        moodHue: 200,
        action: () => {
          const hora = new Date().toLocaleTimeString('pt-BR');
          this.voiceManager.speak(`Agora são ${hora}, Senhor Pedro. O tempo voa, não é?`);
        }
      },
      {
        pattern: /google/,
        moodHue: 60,
        action: () => {
          this.voiceManager.speak("Vamos lá, abrindo o Google para você.");
          window.open("https://www.google.com", "_blank");
        }
      },
      {
        pattern: /^buscar por (.+)/,
        moodHue: 330,
        action: (match) => {
          const query = match[1].trim();
          this.voiceManager.speak(`Buscando por "${query}", Senhor Pedro. Só um momento...`);
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
        }
      },
      {
        pattern: /quem é você/,
        moodHue: 280,
        action: () => this.voiceManager.speak(
          "Sou Nova, sua assistente pessoal. Estou aqui para te ajudar no que for preciso, Senhor Pedro."
        )
      },
      {
        pattern: /obrigado/,
        moodHue: 160,
        action: () => this.voiceManager.speak(
          "Você é sempre bem-vindo, Senhor Pedro. Qualquer coisa, é só chamar!"
        )
      },
      {
        pattern: /modo escuro/,
        moodHue: 200,
        action: () => {
          document.body.classList.add('dark');
          this.voiceManager.speak("Modo escuro ativado. Agora é hora de relaxar no ambiente mais tranquilo.");
        }
      },
      {
        pattern: /modo claro/,
        moodHue: 100,
        action: () => {
          document.body.classList.remove('dark');
          this.voiceManager.speak("Modo claro ativado, Senhor Pedro. Como a luz do dia!");
        }
      },
      {
        pattern: /piada/,
        moodHue: 50,
        action: () => {
          const piadas = [
            "Por que o JavaScript foi ao terapeuta? Porque estava com muitos closures emocionais.",
            "Qual é o cúmulo do programador? Casar e continuar usando o ‘else’.",
            "Por que o computador foi ao médico? Porque estava com um vírus!"
          ];
          this.voiceManager.speak(piadas[Math.floor(Math.random() * piadas.length)]);
        }
      },
      {
        pattern: /curiosidade/,
        moodHue: 210,
        action: () => {
          const curiosidades = [
            "Você sabia que os polvos têm três corações?",
            "O Google foi fundado em uma garagem.",
            "O cérebro humano tem mais conexões que estrelas na galáxia.",
            "Bananas são tecnicamente frutas radioativas. Naturalmente, claro!"
          ];
          this.voiceManager.speak(curiosidades[Math.floor(Math.random() * curiosidades.length)]);
        }
      },
      {
        pattern: /música/,
        moodHue: 270,
        action: () => {
          this.voiceManager.speak("Vamos colocar um pouco de música no ar. Aumente o volume!");
          window.open("https://open.spotify.com/", "_blank");
        }
      },
      {
        pattern: /tempo/,
        moodHue: 190,
        action: () => {
          this.voiceManager.speak("Deixa comigo, vou checar a previsão do tempo agora...");
          window.open("https://www.google.com/search?q=previsão+do+tempo", "_blank");
        }
      },
      {
        pattern: /(filme|indica um filme)/,
        moodHue: 320,
        action: () => {
          const filmes = [
            "Clube da Luta. Mas lembre-se: a primeira regra é não falar sobre ele.",
            "Interestelar. Prepare-se para chorar no tempo e no espaço.",
            "Matrix. A pílula azul ou a vermelha?",
            "O Fabuloso Destino de Amélie Poulain. Um clássico poético."
          ];
          this.voiceManager.speak(filmes[Math.floor(Math.random() * filmes.length)]);
        }
      },
      {
        pattern: /(motivação|frase do dia)/,
        moodHue: 140,
        action: () => {
          const frases = [
            "O sucesso é a soma de pequenos esforços repetidos todos os dias.",
            "Você é mais forte do que imagina, Senhor Pedro.",
            "Acredite no processo. Até os  pixels se alinham no fim.",
            "Respire fundo. Você está indo bem!"
          ];
          this.voiceManager.speak(frases[Math.floor(Math.random() * frases.length)]);
        }
      },
      {
        pattern: /(gato|fofura)/,
        moodHue: 300,
        action: () => {
          this.voiceManager.speak("Fofura detectada. Prepare-se para a explosão de 'awnn'.");
          window.open("https://www.reddit.com/r/aww/", "_blank");
        }
      },
      {
        pattern: /(relaxar|calma)/,
        moodHue: 100,
        action: () => {
          this.voiceManager.speak("Respire fundo. Vamos acalmar a mente juntos.");
          window.open("https://www.youtube.com/watch?v=2OEL4P1Rz04", "_blank");
        }
      }
    ];
  }

  process(text) {
    const command = this.commands.find((cmd) => cmd.pattern.test(text));
    if (command) {
      this.moodHue = command.moodHue;
      const match = text.match(command.pattern);
      command.action(match);
    } else {
      this.moodHue = 300;
      this.voiceManager.speak("Desculpe, ainda estou aprendendo esse comando. Pode tentar algo diferente?");
    }
    return this.moodHue;
  }
}

// 🚀 Inicialização
function init() {
  const canvasManager = new CanvasManager('canvas');
  const mouseTracker = new MouseTracker();
  const animationManager = new AnimationManager(canvasManager, mouseTracker);
  const voiceManager = new VoiceManager('dialogue-box', (text) => {
    const moodHue = commandProcessor.process(text);
    animationManager.moodHue = moodHue;
  });
  const commandProcessor = new CommandProcessor(voiceManager);

  animationManager.animate();
  voiceManager.start();
}

document.addEventListener('DOMContentLoaded', init);