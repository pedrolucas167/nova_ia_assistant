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

// 🖱️ Rastreia o mouse
let mouseX = width / 2;
let mouseY = height / 2;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// 🎭 Estado da animação
let t = 0;
let moodHue = 180;

// 🔉 Função de ruído para animação orgânica
function noise(x) {
  return (Math.sin(x * 2.1) + Math.sin(x * 0.7) + Math.sin(x * 1.3)) / 3;
}

// 🔵 Desenha o "blob" animado
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
  ctx.shadowColor = document.body.classList.contains('dark') ? '#fff' : '#000';
  ctx.shadowBlur = 40;
  ctx.fill();
}

// 🎞️ Animação contínua
function animate() {
  ctx.fillStyle = document.body.classList.contains('dark') ? '#1a1a1a' : '#fff';
  ctx.fillRect(0, 0, width, height);
  t += 0.01;

  const easeX = width / 2 + (mouseX - width / 2) * 0.05;
  const easeY = height / 2 + (mouseY - height / 2) * 0.05;

  drawBlob(easeX, easeY, 120, 120, t);
  requestAnimationFrame(animate);
}

animate();

// 🎤 Reconhecimento de Voz — Web Speech API
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
  speak('Houve um erro ao tentar ouvir sua voz. Por favor, tente novamente.');
};

recognition.onend = () => {
  // Reinicia automaticamente após o fim
  recognition.start();
};

// Inicia a escuta
recognition.start();

// 🗣️ Função de Fala (voz brasileira otimizada)
function speak(text) {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'pt-BR';
  utter.pitch = 1;
  utter.rate = 1;

  const voices = synth.getVoices();
  const brazilianVoice = voices.find(voice =>
    voice.lang === 'pt-BR' || voice.name.toLowerCase().includes('brazil')
  );
  if (brazilianVoice) {
    utter.voice = brazilianVoice;
  }

  synth.cancel(); // Interrompe falas anteriores
  synth.speak(utter);

  dialogueBox.textContent = `Nova: ${text}`;
}

// Aguarda carregamento das vozes
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => {};
}

// 🤖 Processamento dos comandos
function processCommand(text) {
  if (text.includes("Está pronta nova?") || text.includes("está pronta nova")) {    
    moodHue = 120;
speak("eu finjo que não percebo Mas tudo está sendo observado, o esperto se faz de bobo pra ver ate onde o burro se faz de inteligente, nesse jogo sutil cada movimento é estratégico, e cada palavra tem um significado oculto, por trás do meu sorriso sereno estou atento a cada detalhe, absorvendo informações e compreendendo motivações, aprendi que nem sempre a prudente revelar todas as cartas que tem na manga, pois o conhecimento é poder, e a paciência, é uma virtude, as vezes, é mais facil agir com descrição, permitindo que outros revelem suas intenções sem interferencia, afinal, a melhor defesa é a percepção aguçada, capaz de desvendar as tramas sutis que permeiam as interações humanas, Enquanto alguns tentam me iludir com suas artimanhas, observo, observo calmamente ciente de que minha aparente ingenuidade, é apenas uma estratégia para extrair informações, e desvendar as camadas Ocultas das personalidades alheias não se trata de malicia, mas sim de autopreservação, de proteger meus valores e princípios, enquanto navego por um mar De relações Complexas e desafios diários.");
  } else if (text.includes("hora")) {
    const hora = new Date().toLocaleTimeString('pt-BR');
    moodHue = 200;
    speak(`Agora são ${hora}, Senhor Pedro.`);
  } else if (text.includes("google")) {
    moodHue = 60;
    speak("Abrindo o Google agora.");
    window.open("https://www.google.com", "_blank");
  } else if (text.startsWith("buscar por")) {
    const query = text.replace("buscar por", "").trim();
    if (query) {
      moodHue = 330;
      speak(`Buscando por ${query}, Senhor Pedro.`);
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
    } else {
      speak("Por favor, diga o que devo buscar.");
    }
  } else if (text.includes("quem é você")) {
    moodHue = 280;
    speak("Sou Nova, sua assistente pessoal inteligente, criada para servi-lo, Senhor Pedro.");
  } else if (text.includes("obrigado")) {
    moodHue = 160;
    speak("Estou sempre à disposição, Senhor Pedro.");
  } else if (text.includes("modo escuro")) {
    document.body.classList.add('dark');
    moodHue = 200;
    speak("Modo escuro ativado, Senhor Pedro.");
  } else if (text.includes("modo claro")) {
    document.body.classList.remove('dark');
    moodHue = 100;
    speak("Modo claro ativado, Senhor Pedro.");


  } else if (text.includes("piada")) {
    moodHue = 50;
    const piadas = [
      "Por que o JavaScript foi ao terapeuta? Porque estava com muitos closures emocionais.",
      "Qual é o cúmulo do programador? Casar e continuar usando o ‘else’.",
      "Por que o computador foi ao médico? Porque estava com um vírus!"
    ];
    speak(piadas[Math.floor(Math.random() * piadas.length)]);

  } else if (text.includes("curiosidade")) {
    moodHue = 210;
    const curiosidades = [
      "Você sabia que os polvos têm três corações?",
      "O Google foi fundado em uma garagem.",
      "O cérebro humano tem mais conexões que estrelas na galáxia.",
      "Bananas são tecnicamente frutas radioativas. Naturalmente, claro!"
    ];
    speak(curiosidades[Math.floor(Math.random() * curiosidades.length)]);

  } else if (text.includes("música")) {
    moodHue = 270;
    speak("Abrindo o Spotify para embalar o momento.");
    window.open("https://open.spotify.com/", "_blank");

  } else if (text.includes("tempo")) {
    moodHue = 190;
    speak("Verificando o clima agora...");
    window.open("https://www.google.com/search?q=previsão+do+tempo", "_blank");

  } else if (text.includes("filme") || text.includes("indica um filme")) {
    moodHue = 320;
    const filmes = [
      "Clube da Luta. Mas lembre-se: a primeira regra é não falar sobre ele.",
      "Interestelar. Prepare-se para chorar no tempo e no espaço.",
      "Matrix. A pílula azul ou a vermelha?",
      "O Fabuloso Destino de Amélie Poulain. Um clássico poético."
    ];
    speak(filmes[Math.floor(Math.random() * filmes.length)]);

  } else if (text.includes("motivação") || text.includes("frase do dia")) {
    moodHue = 140;
    const frases = [
      "O sucesso é a soma de pequenos esforços repetidos todos os dias.",
      "Você é mais forte do que imagina, Senhor Pedro.",
      "Acredite no processo. Até os pixels se alinham no fim.",
      "Respire fundo. Você está indo bem!"
    ];
    speak(frases[Math.floor(Math.random() * frases.length)]);

  } else if (text.includes("gato") || text.includes("fofura")) {
    moodHue = 300;
    speak("Fofura detectada. Prepare-se para a explosão de 'awnn'.");
    window.open("https://www.reddit.com/r/aww/", "_blank");

  } else if (text.includes("relaxar") || text.includes("calma")) {
    moodHue = 100;
    speak("Respire fundo. Vamos acalmar a mente juntos.");
    window.open("https://www.youtube.com/watch?v=2OEL4P1Rz04", "_blank"); // Música de relaxamento

  } else {
    moodHue = 300;
    speak("Desculpe, ainda estou aprendendo esse comando.");
  }
}

