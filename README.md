# 🧬 Generative Art Engine 2.0 (AI-Enriched)

> **"A professional, high-performance interactive graphics engine featuring natural language control, physics simulation, and real-time audio reactivity."**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20on%20Vercel-000000?style=for-the-badge&logo=vercel)](https://my-graphics-design.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Source%20Code-181717?style=for-the-badge&logo=github)](https://github.com/rOsHaNiC-26/my_graphics_design)
![JavaScript](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?style=for-the-badge&logo=javascript)
![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-E34F26?style=for-the-badge&logo=html5)
![Web Audio API](https://img.shields.io/badge/Web%20Audio-API-ffb347?style=for-the-badge)

---

## 🚀 The Vision

This project evolved from basic Python scripts into a standout **portfolio-grade product**. It aims to demonstrate how creative coding can be merged with modern UX patterns (Glassmorphism), engineering discipline (Modular Architecture), and emerging trends (Natural Language Interface).

Instead of static drawing, this is a **Responsive Creativity Engine** where the art adapts to the user’s input—via mouse, keyboard, sound, or **natural language chat**.

---

## 🤖 Intent-based command interpreter

The centerpiece is the **Intent-Driven Chat Assistant**. Rather than just clicking buttons, you can control the entire engine using human speech patterns.

### 🧠 Modern Keyword Mapping (Synonyms)
The engine doesn't just look for words—it understands **Artistic Intent**:

| User Intent | Keywords | Effect |
|-------------|----------|--------|
| **Nature / Symmetry** | *"flower"*, *"rose"*, *"bloom"*, *"petal"* | Triggers **Mandala** mode |
| **Physics / Chaos** | *"dots"*, *"physics"*, *"bubbles"*, *"rain"* | Triggers **Particle Storm** |
| **Motion Control** | *"freeze"*, *"stop"*, *"let's go"*, *"play"* | Controls **Pause/Play** |
| **Dynamic Scaling** | *"huge"*, *"tiny"*, *"massive"*, *"zoom"* | Scales **Size/Complexity** |
| **Vibes** | *"neon"*, *"chill"*, *"dark"*, *"bright"* | Applies **Preset Themes** |

---

## 🔥 Key Engineering Features

### 🎵 Real-Time Audio Reactivity
Mastered the **Web Audio API** to create a live visualizer. Supports **Microphone Input** and **Local File Upload**.
- **Beat Detection**: Sub-bass frequencies trigger particle bursts.
- **FFT Analysis**: Frequency data drives radial/wave visualizer height.

### ✨ Particle Physics Engine
A custom-built physics loop in vanilla JS including:
- **Gravity Fields**: Particles react to directional pull.
- **Turbulence (Perlin-like noise)**: Adds organic "wind" motion to trails.
- **Symmetry Axes**: Mandala mode now supports up to 16 axes of real rotational symmetry.

### 💾 Engineering System Controls
- **JSON Config Manager**: Save/Load exact art states.
- **Adaptive Performance Mode**: Auto-monitors FPS and reduces complexity dynamically to ensure 60FPS on low-end devices.
- **Modular Renderer Pipeline**: Each mode is an independent object, making the engine easily extensible.

---

## 🎮 How to Interact

### 🖱️ Mouse & Keyboard
- **Right-Click**: Erase area (Composite Eraser).
- **Scroll Wheel**: Live brush resizing.
- **Keyboard 1-7**: Instant mode switching.
- **Arrow Keys**: Fine-tune shape size.

### ⌨️ Shortcuts (Speed Key)
`SPACE` → Pause | `C` → Clear | `S` → Screenshot | `H` → Toggle UI

---

## 📁 Project Structure

```bash
📂 my_graphics_design
├── 🌐 portfolio_background/    # MAIN WEB ENGINE (Live Art Dashboard)
│   ├── index.html              # Semantic HTML5 & HUD Layout
│   ├── style.css               # Modern Glassmorphism Styling
│   └── script.js               # Modular Art Engine & Chatbot Logic
├── 🐍 python_prototypes/       # LEGACY EXPLORATION (Turtle & Pygame)
│   ├── circle_spiral.py
│   ├── dynamic_draw.py
│   ├── mandala_breathe.py
│   ├── pygame_dashboard.py
│   ├── square_spiral.py
│   └── triangle_wave.py
├── ⚙️ .env                     # Local environment configs (Ignored)
├── ⚙️ .env.example             # Template for environment variables
├── 🛡️ .gitignore              # Secure file exclusion rules
├── 📄 README.md                # Professional project documentation
└── 🔺 vercel.json              # Deployment & routing configuration
```

---

## 🛠️ Tech Stack & Skills
- **Frontend Mastery**: Vanilla JS (ES6+), Canvas API, Modern CSS (Glassmorphism).
- **Web API Expertise**: Web Audio API (Analyser), Navigator API (Mic input), File API (Config reading).
- **Product Thinking**: UX (Natural Language UI), Performance (Frame pacing & adaptive complexity).
- **DevOps**: GitHub Actions setup, Vercel Static deployment.

---

## 👩‍💻 Author
**Roshani** — Creative Coder & Product Engineer  
[@rOsHaNiC-26](https://github.com/rOsHaNiC-26)

> *"Passionate about building tools that bridge the gap between creative expression and technical engineering."*
