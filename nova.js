const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const dialogueBox = document.getElementById('dialogue-box');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
let t = 0;
let mouseX = width / 2;
let mouseY = height / 2;
let moodHue = 180;
let isActivated = false;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

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
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
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

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'pt-BR';
recognition.continuous = true;

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.trim();
  dialogueBox.textContent = `Você disse: ${transcript}`;

  if (!isActivated) {
    if (/^(nova[,:\s]*ative|hey nova|olá nova)/i.test(transcript)) {
      isActivated = true;
      moodHue = 100;
      speak("Estou pronta, Senhor Pedro.");
    }
  } else {
    processCommand(transcript.toLowerCase());
  }
};

recognition.start();

function speak(text, lang = 'pt-BR') {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.pitch = 1.2;
  utter.rate = 1.1;
  utter.volume = 1;
  synth.speak(utter);
  dialogueBox.textContent = `Nova: ${text}`;
  dialogueBox.classList.remove('hide');
  dialogueBox.classList.add('show');
  setTimeout(() => {
    dialogueBox.classList.remove('show');
    dialogueBox.classList.add('hide');
  }, 4000);
}

function processCommand(text) {
  const lower = text.toLowerCase();

  if (/(desative|pare de ouvir|desligar)/.test(lower)) {
    isActivated = false;
    moodHue = 0;
    speak("Desativando. Até mais, Senhor Pedro.");
    return;
  }

  if (/^(olá|oi|e aí)/.test(lower)) {
    moodHue = 120;
    speak("Olá, Senhor Pedro. Como posso ser útil?");
  } else if (lower.includes("hora")) {
    const hora = new Date().toLocaleTimeString('pt-BR');
    const horaNum = new Date().getHours();
    const saudacao = horaNum < 12 ? "Bom dia" : horaNum < 18 ? "Boa tarde" : "Boa noite";
    moodHue = 200;
    speak(`${saudacao}, Senhor Pedro. Agora são ${hora}.`);
  } else if (lower.includes("google")) {
    moodHue = 60;
    speak("Abrindo o Google agora.");
    window.open("https://www.google.com", "_blank");
  } else if (lower.includes("youtube")) {
    moodHue = 65;
    speak("Abrindo o YouTube agora.");
    window.open("https://www.youtube.com", "_blank");
  } else if (lower.includes("buscar por")) {
    const query = lower.replace("buscar por", "").trim();
    moodHue = 330;
    if (query) {
      speak(`Procurando por ${query}, Senhor Pedro.`);
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
    } else {
      speak("Por favor, diga o que devo buscar.");
    }
  } else if (lower.includes("quem é você")) {
    moodHue = 280;
    speak("Sou Nova, sua assistente pessoal.");
  } else if (lower.includes("obrigado")) {
    moodHue = 160;
    speak("Sempre às ordens, Senhor Pedro!");
  } else if (lower.includes("como você está")) {
    moodHue = 90;
    speak("Estou ótima! E você, Senhor Pedro?");
  } else if (/^(hello|hi|hey)/.test(lower)) {
    moodHue = 120;
    speak("Hello, Mr. Pedro. How can I assist you today?", 'en-US');
  } else if (lower.includes("what time is it")) {
    const hour = new Date().toLocaleTimeString('en-US');
    const h = new Date().getHours();
    const greeting = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    moodHue = 200;
    speak(`${greeting}, Mr. Pedro. It's ${hour}.`, 'en-US');
  } else if (lower.includes("thank you")) {
    moodHue = 160;
    speak("You're welcome, Mr. Pedro.", 'en-US');
  } else if (lower.includes("who are you")) {
    moodHue = 280;
    speak("I'm Nova, your virtual assistant.", 'en-US');
  } else if (lower.includes("how are you")) {
    moodHue = 90;
    speak("I'm doing well. How about you?", 'en-US');
  } else if (lower.includes("what can you do")) {
    moodHue = 250;
    speak("I can tell the time, open websites, search Google, and more.", 'en-US');
  } else if (lower.includes("open youtube")) {
    moodHue = 65;
    speak("Opening YouTube.", 'en-US');
    window.open("https://www.youtube.com", "_blank");
  } else if (lower.includes("tell me a joke")) {
    moodHue = 300;
    speak("Why don’t scientists trust atoms? Because they make up everything.", 'en-US');
  } else {
    moodHue = 300;
    speak("I'm still learning, Mr. Pedro. Please try again.", 'en-US');
  }
}
