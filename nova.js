// === Variáveis principais ===
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const dialogueBox = document.getElementById('dialogue-box');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
let mouseX = width / 2;
let mouseY = height / 2;
let t = 0;
let moodHue = 180;

// === Ajuste automático do canvas ===
window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// === Movimento do mouse ===
window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// === Funções de desenho ===
function noise(x) {
  return (Math.sin(x * 2.1) + Math.sin(x * 0.7) + Math.sin(x * 1.3)) / 3;
}

function drawBlob(x, y, radius, segments, time) {
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const r = radius + noise(angle + time) * 50;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = `hsl(${(moodHue + time * 40) % 360}, 80%, 60%)`;
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 40;
  ctx.fill();
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  t += 0.01;
  const easeX = width / 2 + (mouseX - width / 2) * 0.05;
  const easeY = height / 2 + (mouseY - height / 2) * 0.05;
  drawBlob(easeX, easeY, 120, 120, t);
  requestAnimationFrame(animate);
}

animate();

// === Voz e reconhecimento ===
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'pt-BR';
recognition.continuous = false;  // Garantir que ele só capture uma fala de cada vez

// Ignorar falas vazias e reiniciar reconhecimento a cada nova fala
recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();

  if (transcript) {
    dialogueBox.textContent = `Você disse: ${transcript}`;
    processCommand(transcript);
  }
};

recognition.onend = () => {
  recognition.start(); // Reiniciar o reconhecimento após terminar
};

recognition.start();

// === Função de fala ===
function speak(text) {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);

  // === Procurar uma voz feminina brasileira ===
  const voices = synth.getVoices();
  const novaPtVoice = voices.find(v =>
    v.lang === 'pt-BR' &&
    v.name.toLowerCase().includes('female') &&
    v.name.toLowerCase().includes('brasil')
  );

  if (novaPtVoice) {
    utter.voice = novaPtVoice;
  }
  utter.lang = 'pt-BR';

  // === Estilo de voz ===
  utter.pitch = 0.7;     // tom mais grave
  utter.rate = 0.85;     // fala pausada e precisa
  utter.volume = 1;

  synth.speak(utter);
  dialogueBox.textContent = `Nova: ${text}`;
}

// === Comandos de voz ===
function processCommand(text) {
  const now = new Date();
  const hora = now.toLocaleTimeString('pt-BR');
  const horas = now.getHours();
  const saudacao = horas < 12 ? "Bom dia" : horas < 18 ? "Boa tarde" : "Boa noite";

  const comandos = [
    {
      palavras: ["olá", "oi"],
      acao: () => {
        moodHue = 120;
        speak(`${saudacao}, Senhor Pedro. Como posso te ajudar hoje?`);
      }
    },
    {
      palavras: ["hora"],
      acao: () => {
        moodHue = 200;
        speak(`${saudacao}, agora são ${hora}, Senhor Pedro.`);
      }
    },
    {
      palavras: ["quem é você"],
      acao: () => {
        moodHue = 280;
        speak("Sou a Nova, sua assistente pessoal. Estou aqui para facilitar sua vida, Senhor Pedro.");
      }
    },
    {
      palavras: ["qual é o seu nome"],
      acao: () => {
        moodHue = 210;
        speak("Sou a Nova, sua assistente em constante evolução. Sempre pronta para aprender com você e ajudá-lo no que for preciso, Pedro.");
      }
    },
    {
      palavras: ["google"],
      acao: () => {
        moodHue = 60;
        speak("Abrindo o Google para você, agora.");
        window.open("https://www.google.com", "_blank");
      }
    },
    {
      palavras: ["buscar por"],
      acao: () => {
        const query = text.split("buscar por")[1]?.trim();
        if (query) {
          moodHue = 330;
          speak(`Buscando por ${query}, Senhor Pedro.`);
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
        } else {
          speak("Por favor, diga o que devo buscar.");
        }
      }
    },
    {
      palavras: ["abra o youtube", "abrir youtube"],
      acao: () => {
        moodHue = 65;
        speak("Abrindo YouTube agora mesmo.");
        window.open("https://www.youtube.com", "_blank");
      }
    },
    {
      palavras: ["como está o tempo", "previsão do tempo"],
      acao: () => {
        moodHue = 195;
        speak("Consultando a previsão do tempo para você.");
        window.open("https://www.google.com/search?q=previsão+do+tempo", "_blank");
      }
    },
    {
      palavras: ["me conte uma curiosidade"],
      acao: () => {
        moodHue = 330;
        const curiosidades = [
          "Sabia que o polvo tem três corações?",
          "O coração de um camarão fica na cabeça.",
          "A Via Láctea pode colidir com Andrômeda em 4 bilhões de anos.",
          "A Terra já teve dois sóis, há bilhões de anos atrás, segundo teorias."
        ];
        const curiosidade = curiosidades[Math.floor(Math.random() * curiosidades.length)];
        speak(curiosidade);
      }
    },
    {
      palavras: ["modo escuro"],
      acao: () => {
        document.body.style.backgroundColor = "#111";
        dialogueBox.style.color = "#fff";
        moodHue = 250;
        speak("Modo escuro ativado.");
      }
    },
    {
      palavras: ["modo claro"],
      acao: () => {
        document.body.style.backgroundColor = "#fff";
        dialogueBox.style.color = "#000";
        moodHue = 50;
        speak("Modo claro ativado.");
      }
    },
    {
      palavras: ["obrigado", "valeu"],
      acao: () => {
        moodHue = 160;
        speak("Sempre à disposição, Senhor Pedro!");
      }
    },
    {
      palavras: ["como você está"],
      acao: () => {
        moodHue = 90;
        speak("Estou ótima, pronta para ajudá-lo. E você, está bem?");
      }
    },
    {
      palavras: ["cores do céu"],
      acao: () => {
        moodHue = 210;
        speak("As cores do céu desvanecem com o pôr do sol enquanto as estrelas começam a brilhar através da noite límpida.");
      }
    },
    {
      palavras: ["está pronta nova?"],
      acao: () => {
        moodHue = 160;
        speak("Sempre pronta para o senhor, Pedro.");
      }
    }
  ];

  const comando = comandos.find(c => c.palavras.some(p => text.includes(p)));
  if (comando) {
    comando.acao();
  } else {
    moodHue = 300;
    speak("Desculpe, ainda não aprendi esse comando. Mas estou em constante evolução!");
  }
}
// === Estilo do diálogo ===
dialogueBox.style.position = 'absolute';
dialogueBox.style.bottom = '20px';
dialogueBox.style.left = '50%';
dialogueBox.style.transform = 'translateX(-50%)';
dialogueBox.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
dialogueBox.style.padding = '10px';
dialogueBox.style.borderRadius = '10px';
dialogueBox.style.fontSize = '20px';
dialogueBox.style.fontFamily = 'Arial, sans-serif';
dialogueBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
dialogueBox.style.transition = 'background-color 0.5s, color 0.5s';
dialogueBox.style.zIndex = '1000'; // Para garantir que fique acima de outros elementos
dialogueBox.style.color = '#000'; // Cor inicial do texto
dialogueBox.style.textAlign = 'center';
dialogueBox.style.maxWidth = '80%'; // Limitar a largura do diálogo
dialogueBox.style.wordWrap = 'break-word'; // Quebrar palavras longas
dialogueBox.style.opacity = '0.9'; // Opacidade inicial
dialogueBox.style.fontWeight = 'bold'; // Negrito
dialogueBox.style.pointerEvents = 'none'; // Ignorar eventos de mouse
dialogueBox.style.lineHeight = '1.5'; // Espaçamento entre linhas
dialogueBox.style.textShadow = '0 0 5px rgba(0, 0, 0, 0.5)'; // Sombra do texto     