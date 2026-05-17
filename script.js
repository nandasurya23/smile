// Initialize Lucide Icons
lucide.createIcons();

// GSAP Optimization
gsap.config({ force3D: true });

// Global State
let userName = "Ica Sayang";
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

    nameDisplays.forEach(el => el.textContent = userName);
    
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
const themeColors = ['#1a0f14', '#2d1522', '#3d1c2d', '#4f2238', '#5e2742'];
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

// 5. Playground Interaction (Sparkles & Hearts)
function spawnSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.innerHTML = '✨';
    sparkle.style.cssText = `position:absolute;left:${x}px;top:${y}px;pointer-events:none;z-index:100;font-size:${Math.random()*10+12}px;`;
    document.body.appendChild(sparkle);
    gsap.to(sparkle, { y: -100, x: (Math.random()-0.5)*50, opacity: 0, duration: 1.5, onComplete: () => sparkle.remove() });
}

function spawnTrailHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'trail-heart';
    heart.innerHTML = '❤️';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
}

if (playground) {
    playground.addEventListener(window.innerWidth < 768 ? 'touchstart' : 'mousemove', (e) => {
        const x = e.touches ? e.touches[0].pageX : e.pageX;
        const y = e.touches ? e.touches[0].pageY : e.pageY;
        
        if (Math.random() > 0.6) spawnTrailHeart(x, y); // Extra romantic hearts trailing
        if (Math.random() > 0.8) spawnSparkle(x, y);
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
    "Kamu tau nggak? Senyummu tuh manis banget.",
    "Dunia kadang berisik, tapi di dekatmu selalu tenang.",
    "Makasih udah bertahan, kamu hebat banget sayang.",
    "Aku suka caramu ngadepin semua ini.",
    "Kamu itu alasan aku masih bisa tersenyum hari ini.",
    "Jangan pernah ngerasa sendirian ya, ada aku di sini.",
    "I love you, hari ini, besok, dan seterusnya."
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

let isButtonRunning = false;
if (complimentBtn) {
    complimentBtn.addEventListener('click', async () => {
        if (isProcessing) return;

        // "Merusak logic": Sometimes button text changes playfully before processing
        if (Math.random() > 0.7 && complimentCount < 4) {
            complimentBtn.innerHTML = '<span>Gak mau ah wle 😋</span> <i data-lucide="x"></i>';
            lucide.createIcons();
            playSFX('typing');
            setTimeout(() => {
                complimentBtn.innerHTML = '<span>Bercanda sayang, ini deh</span> <i data-lucide="heart"></i>';
                lucide.createIcons();
            }, 1000);
            return;
        }

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
            complimentBtn.innerHTML = '<span>Lanjut ke Rahasia?</span> <i data-lucide="arrow-right"></i>';
            lucide.createIcons();
        } else {
            complimentBtn.innerHTML = '<span>Minta Lagi Dong</span> <i data-lucide="feather"></i>';
            lucide.createIcons();
        }
        
        isProcessing = false;
    });
}

// 7. Secret Box Logic
const magicBox = document.getElementById('magic-box');
const toFinalBtn = document.getElementById('to-final-btn');
let hoverCount = 0;

if (magicBox) {
    magicBox.addEventListener('click', () => {
        if (toFinalBtn && toFinalBtn.classList.contains('hidden')) {
            playSFX('magic');
            gsap.to(magicBox, { scale: 1.05, duration: 0.5, onComplete: () => {
                magicBox.innerHTML = `<i data-lucide="heart" fill="var(--romantic-pink)" color="var(--romantic-pink)" class="box-icon"></i><p class="heading">Satu pesan terakhir...</p>`;
                lucide.createIcons();
                toFinalBtn.classList.remove('hidden');
                gsap.fromTo(toFinalBtn, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8 });
            }});
        }
    });
}

if (toFinalBtn) { 
    let escapeTarget = 5;
    let isReady = false;
    
    function tryEscape(e) {
        if (isReady) return;
        if (e && e.type === 'click') e.preventDefault();
        
        if (hoverCount < escapeTarget) {
            const escapeTexts = [
                "Eits, belom bisa diklik! 🤪", 
                "Coba tangkap dulu wlee", 
                "Kurang cepet sayang 😋", 
                "Masih semangat ngejarnya?", 
                "Ayo sedikit lagi!"
            ];
            toFinalBtn.querySelector('span').textContent = escapeTexts[hoverCount];
            gsap.to(toFinalBtn, {
                x: (Math.random() - 0.5) * (window.innerWidth < 768 ? 150 : 250), 
                y: (Math.random() - 0.5) * (window.innerWidth < 768 ? 120 : 150),
                scale: Math.random() * 0.2 + 0.9,
                duration: 0.4,
                ease: "power3.out"
            });
            hoverCount++;
            playSFX('typing');
            lucide.createIcons();
        } else if (hoverCount === escapeTarget) {
            toFinalBtn.querySelector('span').textContent = "Yaudah deh kasian, sekarang beneran bisa diklik 😘";
            gsap.to(toFinalBtn, { x: 0, y: 0, scale: 1.1, duration: 0.6, ease: "elastic.out(1, 0.5)" });
            hoverCount++;
            isReady = true;
        }
    }

    toFinalBtn.addEventListener('mouseenter', function(e) {
        if (window.innerWidth > 768) tryEscape(e);
    });

    toFinalBtn.addEventListener('click', function(e) { 
        if (!isReady) {
            tryEscape(e);
        } else {
            playSFX('click'); 
            showNextScene(); 
        }
    }); 
}

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
            y: window.innerWidth <= 768 ? -130 : -160, 
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
    // Burst of petals
    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'petal';
            p.style.cssText = `position:fixed;left:${Math.random()*100}vw;top:-20px;width:10px;height:10px;background:#fb7185;border-radius:50%;opacity:0.8;z-index:99;pointer-events:none;box-shadow: 0 0 10px rgba(251, 113, 133, 0.6);`;
            document.body.appendChild(p);
            gsap.to(p, { y: '110vh', x: (Math.random()-0.5)*300, rotate: 720, duration: 4+Math.random()*2, onComplete: () => p.remove() });
        }, i * 80);
    }
    
    // Continuous falling hearts
    setInterval(() => {
        const h = document.createElement('div');
        h.className = 'falling-heart';
        h.innerHTML = ['❤️', '💖', '💕', '🥰'][Math.floor(Math.random() * 4)];
        h.style.left = `${Math.random() * 100}vw`;
        h.style.animationDuration = `${Math.random() * 3 + 4}s`;
        const container = document.getElementById('heart-container');
        if(container) container.appendChild(h);
        setTimeout(() => h.remove(), 7000);
    }, 300);
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
        // Romantic piano background music
        audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2434/2434-preview.mp3'); 
        audio.loop = true;
        audio.volume = 0.3;
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
