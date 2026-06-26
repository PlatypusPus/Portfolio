// ── Single source of truth for projects (home shows the first 3) ──
export interface Project {
  name: string;
  year: string;
  desc: string;
  tags: string[];
  repo?: string | null;
  live?: string | null;
}

// newest first
export const PROJECTS: Project[] = [
  {
    name: "Medical Image Reasoning",
    year: "2026",
    desc: "A web-based Digital Image Processing teaching tool that demonstrates 15 classical DIP techniques and performs retinal disease classification using an in-browser AI model.",
    tags: ["OpenCV", "TensorFlow", "HTML"],
    repo: "https://github.com/PlatypusPus/DIpPBL",
    live: "https://dippbl.onrender.com/",
  },
  {
    name: "Schizo Chat",
    year: "2024",
    desc: "SchizoChat is an experimental real-time chat application designed for creative, free-flowing conversations with a unique and unconventional interface.",
    tags: ["ReactJS", "NodeJS", "MongoDB"],
    repo: "https://github.com/PlatypusPus/Tech-Winter-Break-app",
    live: "https://schizo-vuhd.onrender.com/",
  },
];
