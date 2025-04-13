const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
let dialogueBox = document.getElementById('dialogue-box');

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

let t = 0;
let mouseX = width / 2;
let mouseY = height / 2;
let moodHue = 180;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// 🎨 Blob orgânico animado
function noise(x) {
  return (Math.sin(x * 2.1) + Math.sin(x * 0.7) + Math.sin(x * 1.3)) / 3;
}

function drawBlob(x, y, radius, segments, time) {
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const noiseFactor = noise(angle + time);
    const r = radius + noiseFactor * 50;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fillStyle = `hsl(${(moodHue + time * 40) % 360}, 80%, 60%)`;
  ctx.shadowColor = document.body.classList.contains('dark') ? '#ffffff' : '#000000';
  ctx.shadowBlur = 40;
  ctx.fill();
}

function animate() {
  ctx.fillStyle = document.body.classList.contains('dark') ? '#1a1a1a' : '#ffffff';
  ctx.fillRect(0, 0, width, height);
  t += 0.01;

  const easeX = width / 2 + (mouseX - width / 2) * 0.05;
  const easeY = height / 2 + (mouseY - height / 2) * 0.05;

  drawBlob(easeX, easeY, 120, 120, t);
  requestAnimationFrame(animate);
}

animate();

// 🎤 Voz e escuta — Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'pt-BR';
recognition.continuous = true;

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim();
  dialogueBox.textContent = `Você disse: ${transcript}`;
  processCommand(transcript.toLowerCase());
};

recognition.start();

// 🔊 Fala com voz sintetizada
function speak(text) {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'pt-BR';
  synth.speak(utter);
  dialogueBox.textContent = `Nova: ${text}`;
}

// 🤖 Comandos do assistente
function processCommand(text) {
  if (text.includes("olá") || text.includes("oi")) {
    moodHue = 120;
    speak("Olá, Senhor Pedro. Em que posso ajudar?");
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
  } else {
    moodHue = 300;
    speak("Desculpe, ainda estou aprendendo esse comando.");
  }
}