// Initialize Lucide Icons
lucide.createIcons();

// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Particles Configuration
tsParticles.load("particles-js", {
    particles: {
        number: { value: 60, density: { enable: true, value_area: 800 } },
        color: { value: ["#ffe5ec", "#e2d1f9", "#d0ebff", "#fff9f0"] },
        shape: { type: "circle" },
        opacity: {
            value: 0.4,
            random: true,
            anim: { enable: true, speed: 0.5, opacity_min: 0.1, sync: false }
        },
        size: {
            value: 2,
            random: true,
            anim: { enable: false, speed: 40, size_min: 0.1, sync: false }
        },
        move: {
            enable: true,
            speed: 0.8,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: { enable: false, rotateX: 600, rotateY: 1200 }
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { enable: true, mode: "bubble" },
            onclick: { enable: true, mode: "push" },
            resize: true
        },
        modes: {
            bubble: { distance: 250, size: 4, duration: 2, opacity: 0.6, speed: 3 },
            push: { particles_nb: 3 }
        }
    },
    retina_detect: true
});

// GSAP Animations
const tl = gsap.timeline();

// Initial Reveal
window.addEventListener('load', () => {
    tl.to(".reveal-text", {
        opacity: 1,
        y: 0,
        duration: 2,
        stagger: 1,
        ease: "power3.out"
    }).to("#start-btn", {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "back.out(1.7)"
    }, "-=0.8");
});

// Main Navigation & Flow
const startBtn = document.getElementById('start-btn');
const opening = document.getElementById('opening');
const playground = document.getElementById('playground');
const chat = document.getElementById('chat');
const secret = document.getElementById('secret');
const final = document.getElementById('final');

const scenes = [opening, playground, chat, secret, final];
let currentSceneIndex = 0;

function showNextScene() {
    const currentScene = scenes[currentSceneIndex];
    const nextScene = scenes[currentSceneIndex + 1];

    if (nextScene) {
        gsap.to(currentScene, {
            opacity: 0,
            y: -20,
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
                currentScene.classList.add('hidden');
                nextScene.classList.remove('hidden');
                gsap.fromTo(nextScene, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.5, ease: "power2.out" });
                currentSceneIndex++;
                
                if (nextScene.id === 'chat') {
                    startChat();
                }
                if (nextScene.id === 'final') {
                    initFinalReveal();
                }
            }
        });
    }
}

startBtn.addEventListener('click', () => {
    showNextScene();
    initAudio(); 
});

// Mouse Follower Sparkles
playground.addEventListener('mousemove', (e) => {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = e.pageX + 'px';
    sparkle.style.top = e.pageY + 'px';
    
    const size = Math.random() * 8 + 4;
    sparkle.style.width = size + 'px';
    sparkle.style.height = size + 'px';
    
    const colors = ['#ffe5ec', '#e2d1f9', '#d0ebff', '#fff9f0'];
    sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
    sparkle.style.boxShadow = `0 0 15px ${sparkle.style.background}`;
    
    document.body.appendChild(sparkle);
    
    gsap.to(sparkle, {
        y: Math.random() * -150 - 50,
        x: (Math.random() - 0.5) * 150,
        opacity: 0,
        scale: 0,
        duration: 1.5 + Math.random(),
        onComplete: () => sparkle.remove()
    });
});

playground.addEventListener('click', (e) => {
    // Only transition if not clicking on some specific UI if we add any
    setTimeout(showNextScene, 500);
});

// Chat Interaction
const messagesContainer = document.getElementById('chat-messages');
const compliments = [
    "Aku memperhatikan bagaimana kamu selalu berusaha memberikan yang terbaik, meskipun tidak ada yang melihat.",
    "Ada ketenangan di cara kamu berbicara, sesuatu yang membuat orang lain merasa aman berada di dekatmu.",
    "Dunia ini beruntung memilikimu. Kamu membawa warna yang mungkin tidak kamu sadari sendiri.",
    "Aku suka bagaimana pikiranmu bekerja. Kamu melihat keindahan di hal-hal yang sering dilewatkan orang lain.",
    "Jangan pernah ragu dengan nilaimu. Kamu adalah versi terbaik dari dirimu, dan itu sudah lebih dari cukup.",
    "Terima kasih sudah bertahan sampai sejauh ini. Kamu jauh lebih kuat dari yang kamu bayangkan.",
    "Senyummu... itu adalah pengingat bahwa hal-hal baik masih ada di dunia ini."
];

let lastComplimentIndex = -1;
let complimentCount = 0;
const MAX_COMPLIMENTS = 5;

function addMessage(text, type = 'received') {
    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    msg.textContent = text;
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function startChat() {
    setTimeout(() => addMessage("Hai..."), 1500);
    setTimeout(() => addMessage("Aku senang kamu masih di sini."), 3500);
    setTimeout(() => addMessage("Ada sesuatu yang ingin aku sampaikan padamu..."), 6000);
    setTimeout(() => sendRandomCompliment(), 8500);
}

function sendRandomCompliment() {
    if (complimentCount >= MAX_COMPLIMENTS) {
        addMessage("Mungkin cukup untuk hari ini... Simpan sisanya agar tetap istimewa. :)");
        document.getElementById('compliment-btn').disabled = true;
        setTimeout(showNextScene, 3000);
        return;
    }

    let index;
    do {
        index = Math.floor(Math.random() * compliments.length);
    } while (index === lastComplimentIndex);

    lastComplimentIndex = index;
    complimentCount++;
    addMessage(compliments[index]);
}

document.getElementById('compliment-btn').addEventListener('click', () => {
    sendRandomCompliment();
});

// Secret Interaction Logic
const magicBox = document.getElementById('magic-box');
magicBox.addEventListener('click', () => {
    triggerSecret();
});

function triggerSecret() {
    gsap.to(magicBox, {
        scale: 1.2,
        rotate: 15,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
            magicBox.innerHTML = '<i data-lucide="sun" class="box-icon" style="color: #ffdfd3"></i><p>Terima kasih sudah menjadi cahaya.</p>';
            lucide.createIcons();
            setTimeout(showNextScene, 2500);
        }
    });
}

// Finale Pull-up Card Logic
function initFinalReveal() {
    const card = document.getElementById('pull-card');
    const hint = document.querySelector('.pull-hint');
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let isRevealed = false;

    // Pointer events for better touch/mouse support
    card.addEventListener('pointerdown', startDrag);
    window.addEventListener('pointermove', drag);
    window.addEventListener('pointerup', endDrag);

    // Click fallback
    card.addEventListener('click', () => {
        if (!isRevealed) {
            revealCard();
        }
    });

    function startDrag(e) {
        if (isRevealed) return;
        isDragging = true;
        startY = e.clientY;
        card.style.transition = 'none';
        card.setPointerCapture(e.pointerId);
    }

    function drag(e) {
        if (!isDragging || isRevealed) return;
        const y = e.clientY;
        const deltaY = y - startY;
        
        if (deltaY < 0) {
            currentY = Math.max(deltaY, -160);
            card.style.transform = `translateY(${currentY}px)`;
            
            if (currentY <= -130) {
                revealCard();
                isDragging = false;
            }
        }
    }

    function endDrag() {
        if (!isDragging || isRevealed) return;
        isDragging = false;
        card.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        if (currentY > -130) {
            card.style.transform = `translateY(0)`;
        }
    }

    function revealCard() {
        isRevealed = true;
        isDragging = false;
        card.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.transform = `translateY(-160px)`;
        hint.style.opacity = '0';
        triggerFinalBloom();
    }
}

function triggerFinalBloom() {
    gsap.to(".bloom", {
        textShadow: "0 0 30px rgba(255, 133, 161, 0.8)",
        duration: 2,
        repeat: -1,
        yoyo: true
    });
    
    // Heart burst
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'sparkle';
            heart.innerHTML = '❤️';
            heart.style.left = (50 + (Math.random() - 0.5) * 40) + '%';
            heart.style.top = '70%';
            heart.style.fontSize = (Math.random() * 10 + 15) + 'px';
            document.body.appendChild(heart);
            
            gsap.to(heart, {
                y: -window.innerHeight,
                x: (Math.random() - 0.5) * 500,
                rotate: Math.random() * 360,
                duration: 2.5 + Math.random() * 2,
                opacity: 0,
                onComplete: () => heart.remove()
            });
        }, i * 80);
    }
}

// Keyboard Secret (Press 'S' for Smile)
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 's') {
        for (let i = 0; i < 15; i++) {
            const heart = document.createElement('div');
            heart.className = 'sparkle';
            heart.innerHTML = '✨';
            heart.style.fontSize = '20px';
            heart.style.left = Math.random() * window.innerWidth + 'px';
            heart.style.top = window.innerHeight + 'px';
            document.body.appendChild(heart);
            
            gsap.to(heart, {
                y: -window.innerHeight - 100,
                x: (Math.random() - 0.5) * 300,
                rotate: Math.random() * 360,
                duration: 3 + Math.random() * 2,
                ease: "power1.out",
                onComplete: () => heart.remove()
            });
        }
    }
});

// Audio System
let audio;
let isMuted = false;

function initAudio() {
    if (!audio) {
        audio = new Audio('https://files.freemusicarchive.org/storage-tokyo/music/no_curator/Ketsa/Raising_Frequency/Ketsa_-_04_-_Warm_Greetings.mp3');
        audio.loop = true;
        audio.volume = 0.2;
        audio.play().catch(err => console.log("Audio play failed:", err));
    }
}

const muteBtn = document.getElementById('mute-btn');
const muteIcon = document.getElementById('mute-icon');

muteBtn.addEventListener('click', () => {
    if (audio) {
        isMuted = !isMuted;
        audio.muted = isMuted;
        muteIcon.setAttribute('data-lucide', isMuted ? 'volume-x' : 'music');
        lucide.createIcons();
    }
});

// CSS for dynamic sparkles
const styleElement = document.createElement('style');
styleElement.textContent = `
    .sparkle {
        position: absolute;
        pointer-events: none;
        border-radius: 50%;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.5s;
    }
`;
document.head.appendChild(styleElement);
