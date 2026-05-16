// Initialize Lucide Icons
lucide.createIcons();

// GSAP Optimization
gsap.config({ force3D: true });

// Global State
let userName = "Kamu";
let audio;
let isMuted = false;
let currentSceneIndex = 0;

// Element References
const scenes = ['opening', 'playground', 'chat', 'secret', 'final'].map(id => document.getElementById(id));
const messagesContainer = document.getElementById('chat-messages');
const complimentBtn = document.getElementById('compliment-btn');
const playground = document.getElementById('playground');

// 1. Smooth Scroll (Lenis)
const lenis = new Lenis({ duration: 1.2 });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// 2. Background Particles
tsParticles.load("particles-js", {
    particles: {
        number: { value: window.innerWidth < 768 ? 25 : 50, density: { enable: true, value_area: 1000 } },
        color: { value: ["#38bdf8", "#f472b6", "#e2e8f0"] },
        shape: { type: "circle" },
        opacity: { value: 0.3, random: true },
        size: { value: 1.5, random: true },
        move: { enable: true, speed: 0.4, direction: "none", random: true, out_mode: "out" }
    },
    interactivity: { events: { resize: true } },
    retina_detect: true
});

// 3. Name Interaction Logic
const nameOverlay = document.getElementById('name-overlay');
const nameInput = document.getElementById('user-name-input');
const nameDisplays = document.querySelectorAll('.user-name-display');

document.getElementById('submit-name').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (btn.disabled) return;
    btn.disabled = true;

    const val = nameInput.value.trim();
    if (val) {
        userName = val;
        nameDisplays.forEach(el => el.textContent = userName);
    }
    
    // Cross-fade to opening scene
    scenes[0].classList.remove('hidden');
    gsap.set(scenes[0], { opacity: 0 });
    gsap.set(["#opening .reveal-text", "#start-btn"], { opacity: 0 });

    gsap.to(nameOverlay, {
        opacity: 0,
        scale: 1.05,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
            nameOverlay.style.display = 'none';
        }
    });

    gsap.to(scenes[0], {
        opacity: 1,
        duration: 0.8,
        delay: 0.2,
        onComplete: startOpeningScene
    });
    
    initAudio();
    playSFX('click');
});

function startOpeningScene() {
    gsap.fromTo("#opening .reveal-text", 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 1.5, stagger: 0.8, ease: "power3.out" }
    );
    gsap.fromTo("#start-btn", 
        { opacity: 0, scale: 0.9 }, 
        { opacity: 1, scale: 1, duration: 1.2, delay: 2.2, ease: "back.out(1.7)" }
    );
}

// 4. Scene Navigation
const themeColors = ['#05070a', '#0f172a', '#1e1b4b', '#1e1b4b', '#2d1b33'];
let isTransitioning = false;

function showNextScene() {
    if (isTransitioning || currentSceneIndex >= scenes.length - 1) return;
    isTransitioning = true;

    const currentScene = scenes[currentSceneIndex];
    const nextScene = scenes[currentSceneIndex + 1];

    if (nextScene) {
        gsap.to(currentScene, {
            opacity: 0,
            y: -30,
            duration: 1.2,
            ease: "power2.inOut",
            onComplete: () => {
                currentScene.classList.add('hidden');
                nextScene.classList.remove('hidden');
                gsap.fromTo(nextScene, { opacity: 0, y: 30 }, { 
                    opacity: 1, 
                    y: 0, 
                    duration: 1.2, 
                    ease: "power2.out",
                    onComplete: () => {
                        isTransitioning = false;
                    }
                });
                
                currentSceneIndex++;
                document.body.style.backgroundColor = themeColors[currentSceneIndex];
                
                if (nextScene.id === 'chat') startChat();
                if (nextScene.id === 'final') initFinalReveal();
            }
        });
    }
}

document.getElementById('start-btn').addEventListener('click', () => { playSFX('click'); showNextScene(); });

// 5. Playground Interaction (Sparkles)
function spawnSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.innerHTML = '✨';
    sparkle.style.cssText = `position:absolute;left:${x}px;top:${y}px;pointer-events:none;z-index:100;font-size:${Math.random()*10+12}px;`;
    document.body.appendChild(sparkle);
    gsap.to(sparkle, { y: -100, x: (Math.random()-0.5)*50, opacity: 0, duration: 1.5, onComplete: () => sparkle.remove() });
}

if (playground) {
    playground.addEventListener(window.innerWidth < 768 ? 'touchstart' : 'mousemove', (e) => {
        const x = e.touches ? e.touches[0].pageX : e.pageX;
        const y = e.touches ? e.touches[0].pageY : e.pageY;
        if (Math.random() > 0.1) spawnSparkle(x, y);
    });

    playground.addEventListener('click', (e) => {
        if (e.target.closest('.floating-message')) return;
        playSFX('click');
        showNextScene();
    });
}

// 6. Chat Logic (Typewriter)
let complimentCount = 0;
let isProcessing = false;
const compliments = [
    "Makasih ya udah selalu ada sampai sekarang.",
    "Aku hargai banget caramu tetap berusaha meskipun hari ini capek.",
    "Senang bisa kenal kamu, beneran.",
    "Kamu hebat sudah bisa sampai di titik ini.",
    "Semoga besok hari-harimu jadi lebih baik lagi ya.",
    "Cuma mau bilang, kamu berharga lebih dari yang kamu pikir.",
    "Terima kasih sudah jadi versi terbaik dirimu sendiri."
];

async function addMessage(text, type = 'received') {
    if (!messagesContainer) return;

    const indicator = document.createElement('div');
    indicator.className = 'message received typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    await new Promise(r => setTimeout(r, Math.min(1200, 600 + text.length * 8)));
    indicator.remove();
    
    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    messagesContainer.appendChild(msg);
    
    for (let i = 0; i < text.length; i++) {
        msg.textContent += text[i];
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        if (i % 6 === 0) playSFX('typing');
        await new Promise(r => setTimeout(r, 20));
    }
}

async function startChat() {
    if (isProcessing) return;
    isProcessing = true;
    if (complimentBtn) complimentBtn.disabled = true;
    messagesContainer.innerHTML = '';
    
    await addMessage(`Hai ${userName}...`);
    await addMessage("Makasih ya masih di sini.");
    await addMessage("Ada beberapa hal yang sebenernya pengen aku sampein...");
    
    if (complimentBtn) complimentBtn.disabled = false;
    isProcessing = false;
}

let complimentPool = [...compliments];

async function getUniqueCompliment() {
    if (complimentPool.length === 0) {
        complimentPool = [...compliments];
    }
    const randomIndex = Math.floor(Math.random() * complimentPool.length);
    const msg = complimentPool.splice(randomIndex, 1)[0];
    return msg;
}

if (complimentBtn) {
    complimentBtn.addEventListener('click', async () => {
        if (isProcessing) return;

        // If goal reached, move to next scene
        if (complimentCount >= 5) {
            playSFX('click');
            showNextScene();
            return;
        }

        isProcessing = true;
        playSFX('click');
        
        const msg = await getUniqueCompliment();
        await addMessage(msg);
        complimentCount++;
        
        if (complimentCount >= 5) {
            complimentBtn.innerHTML = '<span>Lanjut?</span> <i data-lucide="arrow-right"></i>';
            lucide.createIcons();
        }
        
        isProcessing = false;
    });
}

// 7. Secret Box Logic
const magicBox = document.getElementById('magic-box');
const toFinalBtn = document.getElementById('to-final-btn');
if (magicBox) {
    magicBox.addEventListener('click', () => {
        if (toFinalBtn && toFinalBtn.classList.contains('hidden')) {
            playSFX('magic');
            gsap.to(magicBox, { scale: 1.05, duration: 0.5, onComplete: () => {
                magicBox.innerHTML = `<i data-lucide="star" class="box-icon"></i><p class="heading">Makasih udah bertahan.</p>`;
                lucide.createIcons();
                toFinalBtn.classList.remove('hidden');
                gsap.fromTo(toFinalBtn, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8 });
            }});
        }
    });
}
if (toFinalBtn) { toFinalBtn.addEventListener('click', () => { playSFX('click'); showNextScene(); }); }

// 8. Final Scene Reveal (Timeline Sequence)
function initFinalReveal() {
    const envelope = document.getElementById('envelope-trigger');
    const flap = document.querySelector('.envelope-top');
    const card = document.getElementById('pull-card');
    const cardInner = document.querySelector('.card-inner');
    const seal = document.querySelector('.envelope-seal');
    let isRevealed = false;
    
    if (envelope) {
        envelope.addEventListener('click', () => {
            if (!isRevealed) revealCard();
        });
    }

    function revealCard() {
        isRevealed = true;
        playSFX('reveal');
        if (envelope) envelope.style.cursor = 'default';
        
        const tl = gsap.timeline();
        // Step 1: Open Flap (Flipping UP and BACK)
        tl.to(seal, { opacity: 0, scale: 0.5, duration: 0.3 })
          .to(flap, { rotationX: -170, duration: 0.9, ease: "power2.inOut" }, "-=0.1")
          
        // Step 2: Pull Card out (Ensuring high z-index)
          .to(card, { 
            y: -170, 
            duration: 1.4, 
            ease: "back.out(1.2)",
            onStart: () => {
                gsap.set(card, { zIndex: 100 }); // Extremely high z-index
            }
          }, "-=0.5")
          .to(cardInner, { opacity: 1, y: 0, duration: 1 }, "-=0.8")
          .to(".pull-hint", { opacity: 0, duration: 0.3 }, 0);
        
        triggerFinalBloom();
        
        const lastNote = document.getElementById('one-last-secret');
        if (lastNote) {
            lastNote.classList.remove('hidden');
            gsap.fromTo(lastNote, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 2, delay: 1.5 });
        }
    }
}

function triggerFinalBloom() {
    for (let i = 0; i < 25; i++) {
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'petal';
            p.style.cssText = `position:fixed;left:${Math.random()*100}vw;top:-20px;width:8px;height:8px;background:#f472b6;border-radius:50%;opacity:0.6;z-index:99;pointer-events:none;`;
            document.body.appendChild(p);
            gsap.to(p, { y: '110vh', x: (Math.random()-0.5)*200, rotate: 360, duration: 3+Math.random()*2, onComplete: () => p.remove() });
        }, i * 120);
    }
}

// 9. Audio System
const sfxPaths = {
    click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    typing: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    magic: 'https://assets.mixkit.co/active_storage/sfx/2434/2434-preview.mp3',
    reveal: 'https://assets.mixkit.co/active_storage/sfx/1103/1103-preview.mp3'
};

function playSFX(key) {
    if (isMuted) return;
    const sfx = new Audio(sfxPaths[key]);
    sfx.volume = 0.12;
    sfx.play().catch(() => {});
}

function initAudio() {
    if (!audio) {
        audio = new Audio('https://files.freemusicarchive.org/storage-tokyo/music/no_curator/Ketsa/Raising_Frequency/Ketsa_-_04_-_Warm_Greetings.mp3');
        audio.loop = true;
        audio.volume = 0.15;
        audio.play().catch(() => {});
    }
}

const muteBtn = document.getElementById('mute-btn');
if (muteBtn) {
    muteBtn.addEventListener('click', () => {
        if (audio) {
            isMuted = !isMuted;
            audio.muted = isMuted;
            const muteIcon = document.getElementById('mute-icon');
            if (muteIcon) muteIcon.setAttribute('data-lucide', isMuted ? 'volume-x' : 'music');
            lucide.createIcons();
        }
    });
}
