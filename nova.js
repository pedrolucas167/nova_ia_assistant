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

// 🎤 Voz e escuta — Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'pt-BR';  // Inicialmente em português
recognition.continuous = true;

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim();
  dialogueBox.textContent = `Você disse: ${transcript}`;
  processCommand(transcript.toLowerCase());
};

recognition.start();

// 🔊 Fala com voz sintetizada
function speak(text, lang = 'pt-BR') {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;

  // Ajustando a voz para uma mais interessante
  utter.pitch = 1.2; // Aumenta o tom da voz
  utter.rate = 1.1; // Aumenta um pouco a velocidade da fala
  utter.volume = 1; // Volume máximo

  synth.speak(utter);
  dialogueBox.textContent = `Nova: ${text}`;
}

// 🤖 Comandos do assistente
function processCommand(text) {
  if (text.includes("olá") || text.includes("oi")) {
    moodHue = 120;
    speak("Olá, Senhor Pedro. Como posso ser útil para você hoje?");
  } else if (text.includes("hora")) {
    const hora = new Date().toLocaleTimeString('pt-BR');
    const period = new Date().getHours();
    let greeting = "Boa noite";

    if (period < 12) greeting = "Bom dia";
    else if (period < 18) greeting = "Boa tarde";

    moodHue = 200;
    speak(`${greeting}, Senhor Pedro. Agora são ${hora}.`);
  } else if (text.includes("google")) {
    moodHue = 60;
    speak("Estou abrindo o Google para você agora.");
    window.open("https://www.google.com", "_blank");
  } else if (text.includes("buscar por")) {
    const query = text.replace("buscar por", "").trim();
    if (query) {
      moodHue = 330;
      speak(`Procurando por ${query}, Senhor Pedro.`);
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
    } else {
      speak("Por favor, diga o que devo buscar para você.");
    }
  } else if (text.includes("quem é você")) {
    moodHue = 280;
    speak("Eu sou Nova, sua assistente pessoal, Senhor Pedro. Fui projetada para ajudá-lo em tudo o que precisar.");
  } else if (text.includes("obrigado")) {
    moodHue = 160;
    speak("Eu que agradeço, Senhor Pedro. Sempre estarei aqui para ajudar!");
  } else if (text.includes("como você está")) {
    moodHue = 90;
    speak("Estou funcionando perfeitamente, Senhor Pedro. E você, como está?");
  } else if (text.includes("qual é o seu nome")) {
    moodHue = 210;
    speak("Meu nome é Nova, Senhor Pedro. E o seu? Como posso ajudá-lo mais?");
  } else if (text.includes("hello") || text.includes("hi")) {
    moodHue = 120;
    speak("Hello, Mr. Pedro. How can I assist you today?", 'en-US');
  } else if (text.includes("what time is it")) {
    const hora = new Date().toLocaleTimeString('en-US');
    const period = new Date().getHours();
    let greeting = "Good night";

    if (period < 12) greeting = "Good morning";
    else if (period < 18) greeting = "Good afternoon";

    moodHue = 200;
    speak(`${greeting}, Mr. Pedro. The current time is ${hora}.`, 'en-US');
  } else if (text.includes("thank you")) {
    moodHue = 160;
    speak("You're welcome, Mr. Pedro. I'm always here to help!", 'en-US');
  } else if (text.includes("who are you")) {
    moodHue = 280;
    speak("I am Nova, your personal assistant, Mr. Pedro. I am here to assist you with anything you need.", 'en-US');
  } else {
    moodHue = 300;
    speak("This is still in my learning manual, Mr. Pedro. I'll keep improving!", 'en-US');
  }
}
