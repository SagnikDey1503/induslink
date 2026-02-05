module.exports = {
  content: ["./app/**/*.{js,jsx}", "./app/components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0d0f14",
          900: "#131826",
          800: "#1c2437",
          700: "#29324a"
        },
        steel: {
          100: "#eef2f7",
          200: "#dde5ef",
          300: "#c4d1e1",
          400: "#9fb2c8",
          500: "#7a93b1",
          600: "#5f7898"
        },
        copper: {
          400: "#f7a35c",
          500: "#f38c3a",
          600: "#e3711a"
        },
        jade: {
          400: "#5bd1a1",
          500: "#35b37f",
          600: "#1f8f64"
        }
      },
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        "steel-grid": "linear-gradient(120deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 45%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.06), transparent 40%)"
      },
      boxShadow: {
        glow: "0 20px 45px rgba(15, 23, 42, 0.25)",
        soft: "0 12px 30px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
};
