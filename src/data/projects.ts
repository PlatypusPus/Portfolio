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
    desc: "A teaching tool for Digital Image Processing: 15 classical DIP techniques you can run on your own images, plus retinal disease classification from a model that runs in the browser.",
    tags: ["OpenCV", "TensorFlow", "HTML"],
    repo: "https://github.com/PlatypusPus/DIpPBL",
    live: "https://dippbl.onrender.com/",
  },
  {
    name: "Schizo Chat",
    year: "2024",
    desc: "An experimental real-time chat app with a deliberately unconventional interface, built for loose, fast conversation.",
    tags: ["ReactJS", "NodeJS", "MongoDB"],
    repo: "https://github.com/PlatypusPus/Tech-Winter-Break-app",
    live: "https://schizo-vuhd.onrender.com/",
  },
];
