/**
 * ============================================================
 * GENERATIVE ART ENGINE — script.js
 * Modular, real-time interactive canvas graphics engine
 * Features: 6 modes, presets, live controls, FPS, export
 * ============================================================
 */

'use strict';

// ============================================================
// CORE: Canvas + Context Setup
// ============================================================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    clearScreen();
    Engine.onResize();
});

// ============================================================
// STATE MANAGER
// ============================================================
const State = {
    mode: 1,
    isPaused: false,
    isPanelVisible: true,
    colorMode: 'rainbow',   // 'rainbow' | 'custom' | 'random'
    customColor: '#bb86fc',
    randomColor: '#ff6b9d',
    brushType: 'circle',    // 'circle' | 'square' | 'glow'
    speed: 1.0,
    size: 1.0,
    rotation: 0,
    complexity: 120,
    preset: null,

    hue: 0,
    frame: 0,
    angle: 0,
    objectCount: 0,

    // Mode specific params
    symmetry: 8,
    layers: 13,
    breathe: 0.2,
    angleStep: 140,
    trailFade: 0,
    gravity: 0,
    turbulence: 0,
    particles: 400,
    trailOpacity: 0.18,
    drawingSymmetry: 'none',
    glowIntensity: 12,

    // Audio reactive params
    sensitivity: 1.5,
    bassThreshold: 180,
    vizStyle: 'radial',
};

// ============================================================
// PERFORMANCE: FPS Counter
// ============================================================
const FPS = (() => {
    let lastTime = performance.now();
    let frames = 0;
    let fps = 0;
    let elapsed = 0;

    return {
        tick() {
            const now = performance.now();
            const delta = now - lastTime;
            lastTime = now;
            elapsed += delta;
            frames++;
            if (elapsed >= 500) {
                fps = Math.round((frames * 1000) / elapsed);
                frames = 0;
                elapsed = 0;
                document.getElementById('stat-fps').textContent = `FPS: ${fps}`;
            }
        },
        get() { return fps; }
    };
})();

// ============================================================
// COLOR UTILITIES
// ============================================================
const Color = {
    hsvToRgb(h, s, v) {
        let r, g, b;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
    },
    rgba(r, g, b, a) { return `rgba(${r},${g},${b},${a})`; },
    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    },
    getMain(offset = 0) {
        if (State.colorMode === 'rainbow') {
            return Color.hsvToRgb(((State.hue + offset) % 1.0 + 1.0) % 1.0, 1, 1);
        } else if (State.colorMode === 'custom') {
            const { r, g, b } = Color.hexToRgb(State.customColor);
            const variation = offset * 100;
            return `rgb(${Math.min(255, r + variation | 0)},${Math.min(255, g + variation | 0)},${Math.min(255, b + variation | 0)})`;
        } else {
            return Color.hsvToRgb(((State.hue + offset) % 1.0 + 1.0) % 1.0, 0.6 + Math.random() * 0.4, 0.8 + Math.random() * 0.2);
        }
    },
    advanceHue(amount = 0.005) {
        State.hue = (State.hue + amount * State.speed) % 1.0;
    }
};

// ============================================================
// DRAWING UTILITIES
// ============================================================
function clearScreen() {
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, W, H);
}

function applyBrushStyle(color, lineWidth = 2) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (State.brushType === 'glow') {
        ctx.shadowColor = color;
        ctx.shadowBlur = State.mode === 2 ? State.glowIntensity : 12;
    } else {
        ctx.shadowBlur = 0;
    }
}

function drawPoint(x, y, size = 4) {
    const s = size * State.size;
    if (State.brushType === 'square') {
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
    } else {
        ctx.beginPath();
        ctx.arc(x, y, s / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============================================================
// MODE 1: Circle Spiral
// ============================================================
const CircleSpiral = {
    draw(cx, cy) {
        let tempHue = State.hue;
        const n = State.complexity;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;

        for (let i = 0; i < n; i++) {
            const color = Color.hsvToRgb(tempHue % 1.0, 1, 1);
            const radius = i * 1.5 * State.size;
            const rot = i * 0.1 + (State.rotation * Math.PI / 180);

            ctx.strokeStyle = color;
            if (State.brushType === 'glow') { ctx.shadowColor = color; ctx.shadowBlur = 6; }
            else ctx.shadowBlur = 0;

            ctx.beginPath();
            ctx.arc(cx + Math.cos(rot) * radius * 0.3, cy + Math.sin(rot) * radius * 0.3, radius, 0, Math.PI * 2);
            ctx.stroke();

            tempHue += 1 / n;
        }
        State.hue = tempHue;
        State.objectCount += n;
        updateObjectCount();
    }
};

// ============================================================
// MODE 2: Dynamic Brush Drawing
// ============================================================
const BrushDraw = {
    draw(x, y, px, py) {
        const color = Color.getMain();
        const width = State.size * 5;
        applyBrushStyle(color, width);

        const drawSegment = (x1, y1, x2, y2) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        };

        drawSegment(x, y, px, py);

        if (State.drawingSymmetry === 'v' || State.drawingSymmetry === 'vh') {
            drawSegment(W - x, y, W - px, py);
        }
        if (State.drawingSymmetry === 'h' || State.drawingSymmetry === 'vh') {
            drawSegment(x, H - y, px, H - py);
        }
        if (State.drawingSymmetry === 'vh') {
            drawSegment(W - x, H - y, W - px, H - py);
        }

        Color.advanceHue(0.004);
        State.objectCount++;
        updateObjectCount();
    }
};

// ============================================================
// MODE 3: Breathing Mandala (animated)
// ============================================================
const Mandala = {
    anim: null,
    start() {
        const self = this;
        function frame() {
            if (State.mode !== 3) return;
            if (!State.isPaused) {
                clearScreen();
                const scale = (1 + State.breathe * Math.sin(State.frame / 20)) * State.size;
                const angle = State.frame * 2 * State.speed + State.rotation;
                const cx = W / 2, cy = H / 2;
                const n = State.symmetry;
                const layers = State.layers;

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate((angle * Math.PI) / 180);
                
                for (let j = 0; j < layers; j++) {
                    for (let i = 0; i < n; i++) {
                        let color;
                        if (State.colorMode === 'rainbow') {
                            color = Color.hsvToRgb((i / n + State.hue) % 1.0, 0.4 + (j/layers)*0.6, 1);
                        } else {
                            color = Color.getMain(i / n * 0.3);
                        }
                        ctx.strokeStyle = color;
                        if (State.brushType === 'glow') { ctx.shadowColor = color; ctx.shadowBlur = 8; }
                        else ctx.shadowBlur = 0;

                        ctx.save();
                        ctx.rotate((i * (360 / n) * Math.PI) / 180);
                        ctx.beginPath();
                        ctx.ellipse(0, (200 - j * 8) * scale, 50 * scale, 100 * scale, 0, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.restore();
                    }
                }
                ctx.restore();
                State.frame++;
                Color.advanceHue(0.001);
            }
            self.anim = requestAnimationFrame(frame);
        }
        frame();
    }
};

// ============================================================
// MODE 4: Triangle/Polygon Spiral (animated)
// ============================================================
const TriangleSpiral = {
    anim: null,
    start() {
        const self = this;
        function frame() {
            if (State.mode !== 4) return;
            if (!State.isPaused) {
                if (State.trailFade > 0) {
                    ctx.fillStyle = `rgba(8, 8, 8, ${State.trailFade})`;
                    ctx.fillRect(0, 0, W, H);
                } else {
                    clearScreen();
                }
                
                const scale = (1 + 0.2 * Math.sin(State.frame / 20)) * State.size;
                const hueShift = (State.frame % 360) / 360;
                const n = State.complexity;
                const baseAngle = State.frame * 0.5 * State.speed + State.rotation;

                ctx.save();
                ctx.translate(W / 2, H / 2);
                ctx.lineWidth = 2;

                let x = 0, y = 0, dir = 0;
                for (let i = 0; i < n; i++) {
                    const h = (i / n + hueShift + State.hue) % 1.0;
                    const color = (State.colorMode === 'rainbow') ? Color.hsvToRgb(h, 1, 1) : Color.getMain(i / n * 0.5);
                    ctx.strokeStyle = color;
                    if (State.brushType === 'glow') { ctx.shadowColor = color; ctx.shadowBlur = 6; }
                    else ctx.shadowBlur = 0;

                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    const step = 10 * scale * (i / 20 + 1);
                    x += Math.cos(dir) * step;
                    y += Math.sin(dir) * step;
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    dir += (State.angleStep + baseAngle) * Math.PI / 180;
                }
                ctx.restore();
                State.frame++;
                Color.advanceHue(0.0005);
            }
            self.anim = requestAnimationFrame(frame);
        }
        frame();
    }
};

// ============================================================
// MODE 5: Square Spiral
// ============================================================
const SquareSpiral = {
    draw(cx, cy) {
        const n = State.complexity;
        let tempHue = State.hue;
        let x = cx, y = cy, dir = State.rotation * Math.PI / 180;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;

        for (let i = 0; i < n; i++) {
            const color = (State.colorMode === 'rainbow') ? Color.hsvToRgb(tempHue % 1.0, 1, 1) : Color.getMain(i / n);
            ctx.strokeStyle = color;
            if (State.brushType === 'glow') { ctx.shadowColor = color; ctx.shadowBlur = 6; }
            else ctx.shadowBlur = 0;

            ctx.beginPath();
            ctx.moveTo(x, y);
            const step = i * 2.5 * State.size;
            x += Math.cos(dir) * step;
            y += Math.sin(dir) * step;
            ctx.lineTo(x, y);
            ctx.stroke();
            dir += (91 * Math.PI) / 180;
            tempHue += 1 / n;
        }
        State.hue = tempHue;
        State.objectCount += n;
        updateObjectCount();
    }
};

// ============================================================
// MODE 6: Particle Storm (animated)
// ============================================================
const ParticleStorm = {
    anim: null,
    particles: [],
    init() {
        this.particles = [];
        for (let i = 0; i < State.particles; i++) {
            this.particles.push(this.newParticle(true));
        }
    },
    newParticle(random = false) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.5 + Math.random() * 3) * State.speed;
        return {
            x: random ? Math.random() * W : W / 2,
            y: random ? Math.random() * H : H / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: Math.random(),
            maxLife: 0.005 + Math.random() * 0.003,
            hue: Math.random(),
            size: (0.5 + Math.random() * 2.5) * State.size,
        };
    },
    start() {
        this.init();
        const self = this;
        function frame() {
            if (State.mode !== 6) return;
            if (!State.isPaused) {
                // Fade trail
                ctx.fillStyle = `rgba(8, 8, 8, ${State.trailOpacity})`;
                ctx.fillRect(0, 0, W, H);

                // Adjust count if changed
                if (self.particles.length < State.particles) {
                    for(let i=0; i<5; i++) self.particles.push(self.newParticle());
                } else if (self.particles.length > State.particles) {
                    self.particles.length = State.particles;
                }

                for (let p of self.particles) {
                    // Gravity
                    p.vy += State.gravity;
                    
                    // Turbulence
                    p.vx += (Math.random() - 0.5) * State.turbulence;
                    p.vy += (Math.random() - 0.5) * State.turbulence;

                    p.x += p.vx * State.speed;
                    p.y += p.vy * State.speed;
                    p.life -= p.maxLife;

                    if (p.life <= 0 || p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
                        Object.assign(p, self.newParticle());
                    }

                    const alpha = Math.max(0, p.life);
                    let color;
                    if (State.colorMode === 'rainbow') {
                        color = Color.hsvToRgb((p.hue + State.hue) % 1.0, 1, 1);
                    } else {
                        color = Color.getMain(p.hue);
                    }

                    ctx.globalAlpha = alpha;
                    applyBrushStyle(color, 1);
                    drawPoint(p.x, p.y, p.size * 4);
                    ctx.globalAlpha = 1;
                }
                Color.advanceHue(0.001);
                State.frame++;
            }
            self.anim = requestAnimationFrame(frame);
        }
        frame();
    }
};

// ============================================================
// MODE 7: Audio Reactive (animated)
// ============================================================
const AudioReactive = {
    anim: null,
    audioCtx: null,
    analyser: null,
    dataArray: null,
    bufferLength: 0,
    source: null,
    isInitialized: false,
    beat: 0,

    async init() {
        if (this.isInitialized) return true;
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            this.isInitialized = true;
            return true;
        } catch (e) {
            console.error("Audio init failed", e);
            showToast("Audio error - see console");
            return false;
        }
    },

    async startMic() {
        const ok = await this.init();
        if (!ok) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (this.source) this.source.disconnect();
            this.source = this.audioCtx.createMediaStreamSource(stream);
            this.source.connect(this.analyser);
            document.getElementById('audio-dot').classList.remove('inactive');
            document.getElementById('audio-status-text').textContent = "Microphone Active";
            showToast("Microphone Connected! 🎤");
        } catch (e) {
            console.error("Mic error", e);
            showToast("Mic permission denied");
        }
    },

    start() {
        if (!this.isInitialized) {
            this.init();
        }
        const self = this;
        const miniCanvas = document.getElementById('mini-visualizer');
        const mctx = miniCanvas.getContext('2d');

        function frame() {
            if (State.mode !== 7) return;
            if (!State.isPaused && self.analyser) {
                self.analyser.getByteFrequencyData(self.dataArray);
                
                // Beat detection
                let sum = 0;
                for(let i=0; i<10; i++) sum += self.dataArray[i];
                const bass = sum / 10;
                if (bass > State.bassThreshold) self.beat = 1.0;
                else self.beat *= 0.92;

                clearScreen();
                const cx = W/2, cy = H/2;
                const sensitivity = State.sensitivity;

                if (State.vizStyle === 'radial') {
                    for (let i = 0; i < self.bufferLength; i++) {
                        const val = self.dataArray[i] * sensitivity;
                        const angle = (i / self.bufferLength) * Math.PI * 2 + (State.frame * 0.01);
                        const r1 = 100 * State.size;
                        const r2 = (100 + val) * State.size;
                        
                        const h = (i / self.bufferLength + State.hue) % 1.0;
                        const color = Color.hsvToRgb(h, 0.8, 1);
                        applyBrushStyle(color, 2 + self.beat * 5);
                        
                        ctx.beginPath();
                        ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
                        ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
                        ctx.stroke();
                    }
                } else if (State.vizStyle === 'bars') {
                    const barWidth = W / self.bufferLength;
                    for (let i = 0; i < self.bufferLength; i++) {
                        const val = self.dataArray[i] * sensitivity;
                        const h = (i / self.bufferLength + State.hue) % 1.0;
                        ctx.fillStyle = Color.hsvToRgb(h, 0.7, 1);
                        ctx.fillRect(i * barWidth, H, barWidth - 1, -val * 2);
                    }
                } else { // wave
                    ctx.beginPath();
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = Color.getMain();
                    for (let i = 0; i < self.bufferLength; i++) {
                        const val = (self.dataArray[i] / 128.0) * (H/4) * sensitivity;
                        const x = (i / self.bufferLength) * W;
                        const y = H/2 + Math.sin(i * 0.1 + State.frame * 0.1) * val;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                }

                // Mini visualizer
                mctx.clearRect(0,0, miniCanvas.width, miniCanvas.height);
                mctx.fillStyle = "#bb86fc";
                const mw = miniCanvas.width / self.bufferLength;
                for(let i=0; i<self.bufferLength; i++) {
                    const h = (self.dataArray[i] / 255) * miniCanvas.height;
                    mctx.fillRect(i * mw, miniCanvas.height - h, mw-1, h);
                }

                State.frame++;
                Color.advanceHue(0.001);
            }
            self.anim = requestAnimationFrame(frame);
        }
        frame();
    }
};

// ============================================================
// ENGINE: Mode switching & lifecycle
// ============================================================
const Engine = {
    onResize() {
        if (State.mode === 6) {
            ParticleStorm.init();
        }
    },
    startMode(mode) {
        State.mode = mode;
        State.frame = 0;
        State.angle = 0;
        State.objectCount = 0;
        clearScreen();
        updateObjectCount();

        const modeNames = { 
            1: 'Circle Spiral', 2: 'Dynamic Draw', 3: 'Mandala', 
            4: 'Triangle Wave', 5: 'Square Spiral', 6: 'Particle Storm', 7: 'Audio Reactive' 
        };
        document.getElementById('stat-mode').textContent = `Mode: ${modeNames[mode] || 'Unknown'}`;

        // Show/Hide mode-specific control sections
        document.querySelectorAll('.mode-specific').forEach(el => el.style.display = 'none');
        const specificPanel = document.getElementById(`mode-ctrl-${mode}`);
        if (specificPanel) specificPanel.style.display = 'block';

        if (mode === 3) Mandala.start();
        else if (mode === 4) TriangleSpiral.start();
        else if (mode === 6) ParticleStorm.start();
        else if (mode === 7) {
            if (typeof AudioReactive !== 'undefined') AudioReactive.start();
            else showToast('Audio mode logic not yet initialized');
        }

        // Draw default shape for click modes
        if (mode === 1) setTimeout(() => CircleSpiral.draw(W / 2, H / 2), 50);
        if (mode === 5) setTimeout(() => SquareSpiral.draw(W / 2, H / 2), 50);
    }
};

// ============================================================
// PRESETS
// ============================================================
const Presets = {
    neon: {
        colorMode: 'rainbow',
        speed: 1.5,
        size: 1.2,
        brushType: 'glow',
        complexity: 150,
    },
    calm: {
        colorMode: 'custom',
        customColor: '#7ec8e3',
        speed: 0.3,
        size: 0.8,
        brushType: 'circle',
        complexity: 80,
    },
    chaos: {
        colorMode: 'random',
        speed: 4.0,
        size: 2.5,
        brushType: 'glow',
        complexity: 250,
    },
    mono: {
        colorMode: 'custom',
        customColor: '#e0e0e0',
        speed: 1.0,
        size: 1.0,
        brushType: 'square',
        complexity: 120,
    }
};

function applyPreset(name) {
    const p = Presets[name];
    if (!p) return;

    State.colorMode = p.colorMode;
    if (p.customColor) State.customColor = p.customColor;
    State.speed = p.speed;
    State.size = p.size;
    State.brushType = p.brushType;
    State.complexity = p.complexity;

    syncAllControls();
    Engine.startMode(State.mode);
    showToast(`Preset: ${name.charAt(0).toUpperCase() + name.slice(1)} Mode applied`);

    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`preset-${name}`)?.classList.add('active');
    State.preset = name;
}

// ============================================================
// HUD + UI SYNC
// ============================================================
function updateObjectCount() {
    document.getElementById('stat-objects').textContent = `Objects: ${State.objectCount.toLocaleString()}`;
}

function syncAllControls() {
    document.getElementById('ctrl-speed').value = State.speed;
    document.getElementById('val-speed').textContent = `${State.speed.toFixed(1)}×`;
    document.getElementById('ctrl-size').value = State.size;
    document.getElementById('val-size').textContent = `${State.size.toFixed(1)}×`;
    document.getElementById('ctrl-rotation').value = State.rotation;
    document.getElementById('val-rotation').textContent = `${State.rotation}°`;
    document.getElementById('ctrl-complexity').value = State.complexity;
    document.getElementById('val-complexity').textContent = State.complexity;
    document.getElementById('ctrl-color').value = State.customColor;

    document.querySelectorAll('.seg-btn[data-cm]').forEach(b => {
        b.classList.toggle('active', b.dataset.cm === State.colorMode);
    });
    document.querySelectorAll('.seg-btn[data-brush]').forEach(b => {
        b.classList.toggle('active', b.dataset.brush === State.brushType);
    });

    const colorPickerRow = document.getElementById('color-picker-row');
    colorPickerRow.style.display = State.colorMode === 'custom' ? 'block' : 'none';

    updateBrushCursor();

    // Mode Specific Sync
    document.getElementById('ctrl-layers').value = State.layers;
    document.getElementById('val-layers').textContent = State.layers;
    document.getElementById('ctrl-symmetry').value = State.symmetry;
    document.getElementById('val-symmetry').textContent = State.symmetry;
    document.getElementById('ctrl-breathe').value = State.breathe;
    document.getElementById('val-breathe').textContent = State.breathe.toFixed(2);
    
    document.getElementById('ctrl-anglestep').value = State.angleStep;
    document.getElementById('val-anglestep').textContent = `${State.angleStep}°`;
    document.getElementById('ctrl-trailfade').value = State.trailFade;
    document.getElementById('val-trailfade').textContent = State.trailFade.toFixed(2);
    
    document.getElementById('ctrl-gravity').value = State.gravity;
    document.getElementById('val-gravity').textContent = State.gravity.toFixed(2);
    document.getElementById('ctrl-turbulence').value = State.turbulence;
    document.getElementById('val-turbulence').textContent = State.turbulence.toFixed(1);
    document.getElementById('ctrl-pcount').value = State.particles;
    document.getElementById('val-pcount').textContent = State.particles;
    document.getElementById('ctrl-trailopacity').value = State.trailOpacity;
    document.getElementById('val-trailopacity').textContent = State.trailOpacity.toFixed(2);

    document.getElementById('ctrl-sensitivity').value = State.sensitivity;
    document.getElementById('val-sensitivity').textContent = State.sensitivity.toFixed(1);
    document.getElementById('ctrl-bassthresh').value = State.bassThreshold;
    document.getElementById('val-bassthresh').textContent = State.bassThreshold;

    document.getElementById('ctrl-glow').value = State.glowIntensity;
    document.getElementById('val-glow').textContent = State.glowIntensity;

    document.querySelectorAll('[data-aviz]').forEach(b => {
        b.classList.toggle('active', b.dataset.aviz === State.vizStyle);
    });

    document.querySelectorAll('[data-sym]').forEach(b => {
        b.classList.toggle('active', b.dataset.sym === State.drawingSymmetry);
    });
}

// ============================================================
// CUSTOM CURSOR
// ============================================================
const cursor = document.getElementById('brush-cursor');
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
});

function updateBrushCursor() {
    cursor.classList.toggle('square-brush', State.brushType === 'square');
    cursor.classList.toggle('glow-brush', State.brushType === 'glow');
    if (State.brushType !== 'square') cursor.classList.remove('square-brush');
    if (State.brushType !== 'glow') cursor.classList.remove('glow-brush');
}

// ============================================================
// CANVAS INTERACTION
// ============================================================
let isMouseDown = false;
let lastX = 0, lastY = 0;

canvas.addEventListener('mousedown', e => {
    if (e.button === 2) return; // right click handled separately
    isMouseDown = true;
    lastX = e.clientX; lastY = e.clientY;
    cursor.classList.add('drawing');

    if (State.mode === 1) CircleSpiral.draw(e.clientX, e.clientY);
    else if (State.mode === 2) BrushDraw.draw(e.clientX, e.clientY, e.clientX, e.clientY);
    else if (State.mode === 5) SquareSpiral.draw(e.clientX, e.clientY);
});

canvas.addEventListener('mousemove', e => {
    if (!isMouseDown) return;
    if (State.mode === 2) {
        BrushDraw.draw(e.clientX, e.clientY, lastX, lastY);
        lastX = e.clientX; lastY = e.clientY;
    } else if (State.mode === 1 && isMouseDown) {
        // Continuous drawing while held
        CircleSpiral.draw(e.clientX, e.clientY);
    }
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
    cursor.classList.remove('drawing');
});

canvas.addEventListener('mouseleave', () => {
    isMouseDown = false;
    cursor.classList.remove('drawing');
});

// Right-click to erase
canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    const r = State.size * 40;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(e.clientX, e.clientY, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fill();
    ctx.restore();
    showToast('Erased area');
});

// Scroll to zoom/size
canvas.addEventListener('wheel', e => {
    e.preventDefault();
    State.size = Math.max(0.2, Math.min(4, State.size - e.deltaY * 0.001));
    document.getElementById('ctrl-size').value = State.size;
    document.getElementById('val-size').textContent = `${State.size.toFixed(1)}×`;
}, { passive: false });

// ============================================================
// CONFIG MANAGEMENT (Save/Load)
// ============================================================
function saveConfig() {
    const config = { ...State };
    // Don't save transient state
    delete config.frame;
    delete config.hue;
    delete config.objectCount;
    delete config.angle;
    
    const blob = new Blob([JSON.stringify(config, null, 4)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `engine-config-${Date.now()}.json`;
    link.click();
    showToast('Configuration exported! 💾');
}

function loadConfig(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const config = JSON.parse(event.target.result);
            Object.assign(State, config);
            syncAllControls();
            Engine.startMode(State.mode);
            showToast('Configuration loaded successfully! ✨');
        } catch (err) {
            showToast('Error: Invalid config file');
        }
    };
    reader.readAsText(file);
}

// ============================================================
// PERFORMANCE MONITOR
// ============================================================
const Performance = {
    isActive: false,
    check() {
        if (!this.isActive) return;
        const fps = FPS.get();
        if (fps > 0 && fps < 30) {
            // Drop complexity to save performance
            if (State.complexity > 30) {
                State.complexity -= 5;
                document.getElementById('ctrl-complexity').value = State.complexity;
                document.getElementById('val-complexity').textContent = State.complexity;
                document.getElementById('stat-perf').classList.add('warning');
            }
        } else if (fps > 55) {
             document.getElementById('stat-perf').classList.remove('warning');
        }
    }
};

// ============================================================
// SCREENSHOT / EXPORT
// ============================================================
function saveScreenshot() {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const dataURL = canvas.toDataURL('image/png');
    link.download = `generative-art-${timestamp}.png`;
    link.href = dataURL;
    link.click();
    showToast('Screenshot saved! 📸');
    
    Gallery.add(dataURL);
}

// Snapshot Gallery Logic
const Gallery = {
    reel: document.getElementById('gallery-reel'),
    items: [],
    add(dataURL) {
        if (this.items.length === 0) this.reel.innerHTML = '';
        
        const card = document.createElement('div');
        card.className = 'snap-card';
        card.innerHTML = `<img src="${dataURL}" alt="Snapshot">`;
        card.onclick = () => {
            const win = window.open();
            win.document.write(`<img src="${dataURL}" style="max-width:100%">`);
        };
        
        this.reel.insertBefore(card, this.reel.firstChild);
        this.items.unshift(dataURL);
        
        if (this.items.length > 3) {
            this.items.pop();
            this.reel.lastChild.remove();
        }
    }
};

// ============================================================
// TOAST
// ============================================================
let toastTimeout;
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener('keydown', e => {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    switch (e.key) {
        case ' ':
            e.preventDefault();
            State.isPaused = !State.isPaused;
            document.getElementById('pause-label').textContent = State.isPaused ? 'Resume' : 'Pause';
            document.getElementById('pause-icon').innerHTML = State.isPaused
                ? '<polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>'
                : '<rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/>';
            document.getElementById('btn-pause-hud').classList.toggle('active-state', State.isPaused);
            showToast(State.isPaused ? 'Paused' : 'Resumed');
            break;

        case 'c': case 'C':
            clearScreen();
            State.objectCount = 0;
            updateObjectCount();
            showToast('Canvas cleared');
            break;

        case 's': case 'S':
            saveScreenshot();
            break;

        case 'r': case 'R':
            State.hue = Math.random();
            State.angle = 0;
            State.frame = 0;
            Engine.startMode(State.mode);
            showToast('Reset & randomized! 🎲');
            break;

        case 'h': case 'H':
            togglePanel();
            break;

        case '1': Engine.startMode(1); setModeBtn(1); break;
        case '2': Engine.startMode(2); setModeBtn(2); break;
        case '3': Engine.startMode(3); setModeBtn(3); break;
        case '4': Engine.startMode(4); setModeBtn(4); break;
        case '5': Engine.startMode(5); setModeBtn(5); break;
        case '6': Engine.startMode(6); setModeBtn(6); break;

        case 'ArrowUp':
            State.size = Math.min(4, State.size + 0.1);
            document.getElementById('ctrl-size').value = State.size;
            document.getElementById('val-size').textContent = `${State.size.toFixed(1)}×`;
            break;
        case 'ArrowDown':
            State.size = Math.max(0.2, State.size - 0.1);
            document.getElementById('ctrl-size').value = State.size;
            document.getElementById('val-size').textContent = `${State.size.toFixed(1)}×`;
            break;
    }
});

// ============================================================
// UI EVENT WIRING
// ============================================================

// Mode buttons
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = parseInt(btn.dataset.mode);
        setModeBtn(mode);
        Engine.startMode(mode);
    });
});

function setModeBtn(mode) {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`mode-btn-${mode}`)?.classList.add('active');
    // clear preset highlight when mode changes
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
}

// Preset buttons
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
});

// Live sliders
document.getElementById('ctrl-speed').addEventListener('input', e => {
    State.speed = parseFloat(e.target.value);
    document.getElementById('val-speed').textContent = `${State.speed.toFixed(1)}×`;
});

document.getElementById('ctrl-size').addEventListener('input', e => {
    State.size = parseFloat(e.target.value);
    document.getElementById('val-size').textContent = `${State.size.toFixed(1)}×`;
});

document.getElementById('ctrl-rotation').addEventListener('input', e => {
    State.rotation = parseInt(e.target.value);
    document.getElementById('val-rotation').textContent = `${State.rotation}°`;
});

document.getElementById('ctrl-complexity').addEventListener('input', e => {
    State.complexity = parseInt(e.target.value);
    document.getElementById('val-complexity').textContent = State.complexity;
});

// Color mode segmented control
document.querySelectorAll('.seg-btn[data-cm]').forEach(btn => {
    btn.addEventListener('click', () => {
        State.colorMode = btn.dataset.cm;
        document.querySelectorAll('.seg-btn[data-cm]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('color-picker-row').style.display = State.colorMode === 'custom' ? 'block' : 'none';
    });
});

// Color picker
document.getElementById('ctrl-color').addEventListener('input', e => {
    State.customColor = e.target.value;
    if (State.colorMode !== 'custom') {
        State.colorMode = 'custom';
        document.querySelectorAll('.seg-btn[data-cm]').forEach(b => b.classList.remove('active'));
        document.getElementById('cm-custom').classList.add('active');
        document.getElementById('color-picker-row').style.display = 'block';
    }
});

// Brush type
document.querySelectorAll('.seg-btn[data-brush]').forEach(btn => {
    btn.addEventListener('click', () => {
        State.brushType = btn.dataset.brush;
        document.querySelectorAll('.seg-btn[data-brush]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateBrushCursor();
    });
});

// HUD buttons
document.getElementById('btn-screenshot').addEventListener('click', saveScreenshot);
document.getElementById('btn-clear-hud').addEventListener('click', () => {
    clearScreen();
    State.objectCount = 0;
    updateObjectCount();
    showToast('Canvas cleared');
});
document.getElementById('btn-pause-hud').addEventListener('click', () => {
    State.isPaused = !State.isPaused;
    document.getElementById('pause-label').textContent = State.isPaused ? 'Resume' : 'Pause';
    document.getElementById('pause-icon').innerHTML = State.isPaused
        ? '<polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>'
        : '<rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/>';
    document.getElementById('btn-pause-hud').classList.toggle('active-state', State.isPaused);
});
document.getElementById('btn-toggle-panel').addEventListener('click', togglePanel);

function togglePanel() {
    State.isPanelVisible = !State.isPanelVisible;
    document.getElementById('control-panel').classList.toggle('hidden', !State.isPanelVisible);
    showToast(State.isPanelVisible ? 'Controls visible' : 'Controls hidden');
}

// Mode Specific Listeners
document.getElementById('ctrl-layers').oninput = e => { State.layers = parseInt(e.target.value); document.getElementById('val-layers').textContent = State.layers; };
document.getElementById('ctrl-symmetry').oninput = e => { State.symmetry = parseInt(e.target.value); document.getElementById('val-symmetry').textContent = State.symmetry; };
document.getElementById('ctrl-breathe').oninput = e => { State.breathe = parseFloat(e.target.value); document.getElementById('val-breathe').textContent = State.breathe.toFixed(2); };

document.getElementById('ctrl-anglestep').oninput = e => { State.angleStep = parseFloat(e.target.value); document.getElementById('val-anglestep').textContent = `${State.angleStep}°`; };
document.getElementById('ctrl-trailfade').oninput = e => { State.trailFade = parseFloat(e.target.value); document.getElementById('val-trailfade').textContent = State.trailFade.toFixed(2); };

document.getElementById('ctrl-gravity').oninput = e => { State.gravity = parseFloat(e.target.value); document.getElementById('val-gravity').textContent = State.gravity.toFixed(2); };
document.getElementById('ctrl-turbulence').oninput = e => { State.turbulence = parseFloat(e.target.value); document.getElementById('val-turbulence').textContent = State.turbulence.toFixed(1); };
document.getElementById('ctrl-pcount').oninput = e => { State.particles = parseInt(e.target.value); document.getElementById('val-pcount').textContent = State.particles; ParticleStorm.init(); };
document.getElementById('ctrl-trailopacity').oninput = e => { State.trailOpacity = parseFloat(e.target.value); document.getElementById('val-trailopacity').textContent = State.trailOpacity.toFixed(2); };

document.getElementById('ctrl-glow').oninput = e => { 
    State.glowIntensity = parseInt(e.target.value); 
    document.getElementById('val-glow').textContent = State.glowIntensity; 
};

document.querySelectorAll('[data-sym]').forEach(btn => {
    btn.onclick = () => {
        State.drawingSymmetry = btn.dataset.sym;
        document.querySelectorAll('[data-sym]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showToast(`Drawing symmetry: ${State.drawingSymmetry}`);
    };
});

// Audio Listeners
document.getElementById('btn-mic').onclick = () => AudioReactive.startMic();
document.getElementById('ctrl-sensitivity').oninput = e => { State.sensitivity = parseFloat(e.target.value); document.getElementById('val-sensitivity').textContent = State.sensitivity.toFixed(1); };
document.getElementById('ctrl-bassthresh').oninput = e => { State.bassThreshold = parseInt(e.target.value); document.getElementById('val-bassthresh').textContent = State.bassThreshold; };
document.querySelectorAll('[data-aviz]').forEach(btn => {
    btn.onclick = () => {
        State.vizStyle = btn.dataset.aviz;
        document.querySelectorAll('[data-aviz]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    };
});

// HUD & Performance
document.getElementById('btn-save-config').onclick = saveConfig;
document.getElementById('input-load-config').onchange = (e) => loadConfig(e);
document.getElementById('perf-toggle').onchange = (e) => {
    Performance.isActive = e.target.checked;
    document.getElementById('stat-perf').classList.toggle('active-state', Performance.isActive);
    showToast(`Adaptive rendering: ${Performance.isActive ? 'ON' : 'OFF'}`);
};

// Audio File Listener
document.getElementById('input-audio-file').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ok = await AudioReactive.init();
    if (!ok) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = event.target.result;
            const buffer = await AudioReactive.audioCtx.decodeAudioData(data);
            if (AudioReactive.source) AudioReactive.source.disconnect();
            
            AudioReactive.source = AudioReactive.audioCtx.createBufferSource();
            AudioReactive.source.buffer = buffer;
            AudioReactive.source.connect(AudioReactive.analyser);
            AudioReactive.source.start(0);
            
            document.getElementById('audio-dot').classList.remove('inactive');
            document.getElementById('audio-status-text').textContent = "Playing File";
            showToast("Playing audio file... 🎵");
        } catch (err) {
            console.error("Audio Load Error", err);
            showToast("Error loading audio file");
        }
    };
    reader.readAsArrayBuffer(file);
};

// ============================================================
// MAIN RENDER LOOP (FPS tracking)
// ============================================================
(function mainLoop() {
    FPS.tick();
    Performance.check();
    requestAnimationFrame(mainLoop);
})();

// ============================================================
// AI CHAT COMMAND ENGINE
// ============================================================
const CommandEngine = {
    keywords: {
        presets:  ['neon', 'calm', 'chaos', 'mono', 'vibey', 'bright', 'dark'],
        modes:    { 
            'circle': 1, 'spiral': 1, 'round': 1, 'rings': 1, 'tunnel': 1,
            'draw': 2, 'brush': 2, 'paint': 2, 'pencil': 2,
            'mandala': 3, 'flower': 3, 'rose': 3, 'petal': 3, 'symmetry': 3, 'bloom': 3,
            'triangle': 4, 'polygon': 4, 'spiky': 4, 'geometry': 4,
            'square': 5, 'cube': 5, 'box': 5,
            'particle': 6, 'storm': 6, 'dots': 6, 'gravity': 6, 'rain': 6, 'physics': 6, 'bubbles': 6,
            'audio': 7, 'music': 7, 'song': 7, 'beat': 7, 'visualizer': 7, 'react': 7
        },
        actions:  ['clear', 'clean', 'screenshot', 'save', 'pause', 'stop', 'freeze', 'resume', 'start', 'play', 'reset', 'random', 'help'],
        speeds:   { 
            'fast': 2.5, 'faster': 4.0, 'zoom': 3.0, 'rapid': 4.5,
            'slow': 0.5, 'slower': 0.2, 'calm': 0.3, 'relax': 0.4,
            'normal': 1.0, 'default': 1.0, 'regular': 1.0
        },
        sizes:    { 
            'big': 2.5, 'large': 3.5, 'huge': 5.0, 'giant': 6.0,
            'small': 0.5, 'tiny': 0.2, 'little': 0.4,
            'normal': 1.0, 'standard': 1.0
        },
        colors:   { 'red': '#ff0000', 'blue': '#0000ff', 'green': '#00ff00', 'pink': '#f142f5', 'cyan': '#00ffff', 'yellow': '#ffff00', 'white': '#ffffff', 'purple': '#bb86fc', 'orange': '#ffa500' }
    },
    modeNames: { 
        1: 'Circle Spiral', 2: 'Dynamic Draw', 3: 'Mandala', 
        4: 'Triangle Wave', 5: 'Square Spiral', 6: 'Particle Storm', 7: 'Audio Reactive' 
    },

    process(msg) {
        msg = msg.toLowerCase();
        let changes = [];
        let response = "";

        // Check Presets
        for (const p of this.keywords.presets) {
            if (msg.includes(p)) {
                applyPreset(p);
                changes.push(`Preset: ${p}`);
            }
        }

        // Check Modes
        for (const [key, val] of Object.entries(this.keywords.modes)) {
            if (msg.includes(key)) {
                setModeBtn(val);
                Engine.startMode(val);
                changes.push(`Mode: ${this.modeNames[val]}`);
                break;
            }
        }

        // Check Speed
        for (const [key, val] of Object.entries(this.keywords.speeds)) {
            if (msg.includes(key)) {
                State.speed = val;
                document.getElementById('ctrl-speed').value = val;
                document.getElementById('val-speed').textContent = `${val.toFixed(1)}×`;
                changes.push(`Speed: ${key}`);
            }
        }

        // Check Size
        for (const [key, val] of Object.entries(this.keywords.sizes)) {
            if (msg.includes(key)) {
                State.size = val;
                document.getElementById('ctrl-size').value = val;
                document.getElementById('val-size').textContent = `${val.toFixed(1)}×`;
                changes.push(`Size: ${key}`);
            }
        }

        // Check Actions
        if (msg.includes('clear') || msg.includes('clean')) { clearScreen(); changes.push('Cleared canvas'); }
        if (msg.includes('screenshot') || msg.includes('pixels')) { saveScreenshot(); changes.push('Captured screenshot'); }
        if (msg.includes('pause') || msg.includes('stop') || msg.includes('freeze')) { 
            State.isPaused = true; 
            syncPauseUI(); 
            changes.push('Paused'); 
        }
        if (msg.includes('resume') || msg.includes('start') || msg.includes('play')) { 
            State.isPaused = false; 
            syncPauseUI(); 
            changes.push('Resumed'); 
        }
        if (msg.includes('reset') || msg.includes('random')) {
            State.hue = Math.random(); State.frame = 0; Engine.startMode(State.mode);
            changes.push('Randomized');
        }

        // Check Colors
        if (msg.includes('rainbow')) {
            State.colorMode = 'rainbow';
            syncAllControls();
            changes.push('Color: Rainbow');
        } else {
            for (const [name, hex] of Object.entries(this.keywords.colors)) {
                if (msg.includes(name)) {
                    State.colorMode = 'custom';
                    State.customColor = hex;
                    syncAllControls();
                    changes.push(`Color: ${name}`);
                    break;
                }
            }
        }

        if (changes.length > 0) {
            response = `Done! Applied: ${changes.join(', ')}. ✨`;
        } else if (msg.includes('hi') || msg.includes('hello')) {
            response = "Hello! I am your AI Art Assistant. Try 'make it fast and neon' or 'switch to mandala mode'.";
        } else {
            response = "I'm not sure how to do that yet. Try 'neon mode', 'faster', or 'clear'.";
        }

        return response;
    }
};

function syncPauseUI() {
    document.getElementById('pause-label').textContent = State.isPaused ? 'Resume' : 'Pause';
    document.getElementById('pause-icon').innerHTML = State.isPaused
        ? '<polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>'
        : '<rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/>';
    document.getElementById('btn-pause-hud').classList.toggle('active-state', State.isPaused);
}

// Chat UI logic
const ChatUI = {
    container: document.getElementById('chat-container'),
    input:     document.getElementById('chat-input'),
    messages:  document.getElementById('chat-messages'),
    sendBtn:   document.getElementById('btn-send-chat'),
    header:    document.getElementById('chat-header'),

    init() {
        this.header.onclick = () => this.container.classList.toggle('minimized');
        document.getElementById('btn-close-chat').onclick = (e) => {
            e.stopPropagation();
            this.container.classList.toggle('minimized');
        };

        this.sendBtn.onclick = () => this.handleSend();
        this.input.onkeydown = (e) => { if (e.key === 'Enter') this.handleSend(); };
        
        document.getElementById('btn-voice-chat').onclick = () => this.startVoice();
    },

    startVoice() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showToast("Voice control not supported in this browser");
            return;
        }

        const recognition = new SpeechRecognition();
        const btn = document.getElementById('btn-voice-chat');
        
        recognition.onstart = () => {
            btn.classList.add('listening');
            showToast("Listening... 🎤");
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.input.value = transcript;
            btn.classList.remove('listening');
            this.handleSend();
        };
        
        recognition.onerror = () => {
            btn.classList.remove('listening');
            showToast("Voice identification failed");
        };
        
        recognition.onend = () => btn.classList.remove('listening');
        
        recognition.start();
    },

    handleSend() {
        const val = this.input.value.trim();
        if (!val) return;

        this.addMessage(val, 'user');
        this.input.value = '';

        setTimeout(() => {
            const reply = CommandEngine.process(val);
            this.addMessage(reply, 'bot');
        }, 400);
    },

    addMessage(text, type) {
        const div = document.createElement('div');
        div.className = `msg ${type}`;
        div.textContent = text;
        this.messages.appendChild(div);
        this.messages.scrollTop = this.messages.scrollHeight;
    }
};

ChatUI.init();

// ============================================================
// INIT
// ============================================================
clearScreen();
syncAllControls();
Engine.startMode(1);
showToast('Welcome! Click canvas or press 1–6 to switch modes 🎨');
