// 🎨 Inicialização do Canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const dialogueBox = document.getElementById('dialogue-box');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// 🖱️ Mouse Tracking
let mouseX = width / 2;
let mouseY = height / 2;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// 🎭 Animação
let t = 0;
let moodHue = 180;
let pulseScale = 1; // Nova variável para pulsar o blob

function noise(x) {
  return (Math.sin(x * 2.1) + Math.sin(x * 0.7) + Math.sin(x * 1.3)) / 3;
}

function drawBlob(x, y, radius, segments, time) {
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const r = radius * pulseScale + noise(angle + time) * 50; // Aplica pulsação
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = `hsl(${(moodHue + time * 40) % 360}, 80%, 60%)`;
  ctx.shadowColor = isDarkMode() ? '#fff' : '#000';
  ctx.shadowBlur = 40;
  ctx.fill();

  // Novo: Adiciona partículas ao redor do blob
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 3;
    const dist = radius + Math.random() * 20 *  pulseScale + noise(angle + time) * 20;
    ctx.beginPath();    
    ctx.arc(
      x + Math.cos(angle) * dist,
      y + Math.sin(angle) * dist,
      2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = `hsl(${(moodHue + 180) % 360}, 90%, 70%)`;
    ctx.fill();
  }
}

function animate() {
  ctx.fillStyle = isDarkMode() ? '#1a1a1a' : '#fff';
  ctx.fillRect(0, 0, width, height);
  t += 0.01;
  pulseScale = 1 + Math.sin(t * 3) * 0.1; // Pulsação suave

  const easeX = width / 2 + (mouseX - width / 2) * 0.05;
  const easeY = height / 2 + (mouseY - height / 2) * 0.05;

  drawBlob(easeX, easeY, 120, 120, t);
  requestAnimationFrame(animate);
}

animate();

function isDarkMode() {
  return document.body.classList.contains('dark');
}

// 🗣️ Função de fala
function speak(text) {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'pt-BR';
  utter.pitch = 1 + Math.random() * 0.2; // Variação leve no tom
  utter.rate = 1;

  const brazilianVoice = synth.getVoices().find(
    voice => voice.lang === 'pt-BR' || voice.name.toLowerCase().includes('brazil')
  );
  if (brazilianVoice) utter.voice = brazilianVoice;

  synth.cancel();
  synth.speak(utter);
  dialogueBox.textContent = `Nova diz: ${text}`;
}

// 🆕 Função para salvar lembretes no localStorage
function saveReminder(reminder) {
  let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
  reminders.push({ text: reminder, timestamp: new Date().toISOString() });
  localStorage.setItem('reminders', JSON.stringify(reminders));
}

// 🆕 Função para listar lembretes
function listReminders() {
  let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
  if (reminders.length === 0) {
    speak("Você não tem nenhum lembrete salvo.");
    return;
  }
  let text = "Seus lembretes são: ";
  reminders.forEach((r, i) => {
    text += `${i + 1}. ${r.text}, criado em ${new Date(r.timestamp).toLocaleString('pt-BR')}. `;
  });
  speak(text);
}

// 🧠 Processa comandos por voz
function processCommand(text) {
  const comandos = [
    { match: ["olá", "está pronta nova", " ativar Macário"], action: () => {
      moodHue = 120;
      speak("Para o senhor sempre.");
    }},
    { match: ["hora"], action: () => {
      const hora = new Date().toLocaleTimeString('pt-BR');
      moodHue = 200;
      speak(`São ${hora}, Senhor Pedro. Algum plano para agora?`);
    }},
    { match: ["google"], action: () => {
      moodHue = 60;
      speak("Abrindo o Google, vamos explorar!");
      window.open("https://www.google.com", "_blank");
    }},
    { match: ["quem é você"], action: () => {
      moodHue = 280;
      speak("Eu sou Nova, sua assistente virtual, criada para ajudar o Senhor Pedro Marques!");
    }},
    { match: ["modo escuro"], action: () => {
      document.body.classList.add('dark');
      moodHue = 200;
      speak("Modo escuro ativado. Bem mais estiloso!");
    }},
    { match: ["modo claro"], action: () => {
      document.body.classList.remove('dark');
      moodHue = 100;
      speak("Modo claro ativado. Tudo brilhante!");
    }},
    { match: ["piada"], action: () => {
      moodHue = 50;
      const piadas = [
        "Por que o astronauta terminou com a namorada? Porque ele precisava de espaço!",
        "O que o código disse para o programador? 'Você é meu tipo!'",
        "Por que o programador prefere o modo escuro? Porque a luz atrai bugs."
      ];
      speak(randomItem(piadas));
    }},
    { match: ["curiosidade"], action: () => {
      moodHue = 210;
      const curiosidades = [
        "A menor unidade de tempo já medida é o tempo de Planck, cerca de 10^-43 segundos!",
        "O primeiro bug de programação foi uma mariposa presa em um relé.",
        "O cheiro de chuva é causado por uma bactéria chamada actinomiceto.",
        "O Wi-Fi foi inventado por acidente durante estudos sobre buracos negros."
      ];
      speak(randomItem(curiosidades));
    }},
    { match: ["música"], action: () => {
      moodHue = 270;
      speak("Hora de curtir uma música! Abrindo Spotify.");
      window.open("https://open.spotify.com/", "_blank");
    }},
    { match: ["tempo"], action: () => {
      moodHue = 190;
      speak("Verificando o clima para você...");
      window.open("https://www.google.com/search?q=previsão+do+tempo", "_blank");
    }},
    { match: ["abrir youtube"], action: () => {
      moodHue = 300;
      speak("YouTube aberto! Qual vídeo vamos assistir?");
      window.open("https://www.youtube.com", "_blank");
    }},
    { match: ["modo hacker"], action: () => {
      document.body.classList.add('dark');
      document.body.style.fontFamily = "'Courier New', monospace";
      moodHue = 90;
      speak("Modo hacker ativado. Vamos invadir a Matrix?");
    
    }},
    { match: ["desligar modo hacker"], action: () => {
      document.body.classList.remove('dark');
      document.body.style.fontFamily = "";
      moodHue = 0;
      speak("Modo hacker desativado. De volta ao normal!");
    }},
    { match: ["obrigado"], action: () => {
      moodHue = 160;
      speak("De nada, Senhor Pedro! Sempre um prazer ajudar.");
    }},
    // 🆕 Novos comandos
    { match: ["calculadora"], action: () => {
      moodHue = 150;
      speak("Abrindo a calculadora do Google.");
      window.open("https://www.google.com/search?q=calculadora", "_blank");
    }},
    { match: ["notícias"], action: () => {
      moodHue = 220;
      speak("Buscando as últimas notícias para você.");
      window.open("https://news.google.com", "_blank");
    }},
    { match: ["definir alarme"], action: () => {
      moodHue = 170;
      speak("Desculpe, ainda não posso definir alarmes diretamente, mas posso abrir o Google para você configurar!");
      window.open("https://www.google.com/search?q=definir+alarme", "_blank");
    }},
    { match: ["listar lembretes"], action: () => {
      moodHue = 180;
      listReminders();
    }},
    { match: ["limpar lembretes"], action: () => {
      localStorage.removeItem('reminders');
      moodHue = 140;
      speak("Todos os lembretes foram apagados.");
    }},
    { match: ["como estou"], action: () => {
      moodHue = 250;
      const respostas = [
        "Você parece estar de bom humor, Senhor Pedro!",
        "Tudo certo por aí? Estou sentindo uma vibe positiva!",
        "Hmm, parece que você está pronto para conquistar o mundo!"
      ];
      speak(randomItem(respostas));
    }},
  ];

  // Comando personalizado: buscar por
  if (text.startsWith("buscar por")) {
    const query = text.replace("buscar por", "").trim();
    if (query) {
      moodHue = 330;
      speak(`Buscando por "${query}".`);
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
    } else {
      speak("Diga o que quer buscar, Senhor Pedro!");
    }
    return;
  }

  // Comando personalizado: me lembre de
  if (text.startsWith("me lembre de")) {
    const lembrete = text.replace("me lembre de", "").trim();
    if (lembrete) {
      moodHue = 180;
      saveReminder(lembrete);
      speak(`Lembrete salvo: ${lembrete}. Quer que eu liste seus lembretes?`);
    } else {
      speak("Você esqueceu de me dizer o que lembrar!");
    }
    return;
  }

  // 🆕 Comando personalizado: calcular
  if (text.startsWith("calcular")) {
    const expressao = text.replace("calcular", "").trim();
    if (expressao) {
      try {
        const resultado = eval(expressao); // Cuidado: eval pode ser perigoso, considerar math.js para produção
        moodHue = 160;
        speak(`O resultado de ${expressao} é ${resultado}.`);
      } catch (e) {
        speak("Desculpe, não consegui calcular isso. Tente algo como 'calcular 2 mais 2'.");
      }
    } else {
      speak("Diga uma expressão para calcular, como '2 mais 2'.");
    }
    return;
  }

  // Checagem de comandos
  for (const cmd of comandos) {
    if (cmd.match.some(keyword => text.includes(keyword))) {
      cmd.action();
      return;
    }
  }

  // Se nenhum comando reconhecido
  moodHue = 10;
  speak("Não entendi, Senhor Pedro. Pode repetir ou tentar outro comando?");
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🎤 Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'pt-BR';
recognition.continuous = true;
recognition.interimResults = false;

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim();
  if (transcript) {
    dialogueBox.textContent = `Você disse: ${transcript}`;
    processCommand(transcript.toLowerCase());
  }
};

recognition.onerror = (event) => {
  console.error('Erro no reconhecimento de voz:', event.error);
  speak("Houve um erro no reconhecimento de voz. Tente novamente, Senhor Pedro.");
};

recognition.onend = () => recognition.start();
recognition.start();

// Aguarda vozes carregarem
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => {};
}