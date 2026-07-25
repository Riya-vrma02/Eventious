/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FBF6F4",
        ink: "#241026",
        "ink-soft": "#3A1F3D",
        marigold: "#E8A73B",
        "marigold-deep": "#C88A24",
        emerald: "#1E6E5C",
        rani: "#B8286B",
        sand: "#EFE6DD",
        "sand-dark": "#DDD0C2",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-public-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
