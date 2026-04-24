import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F3EA",
        ink: "#1F1A17",
        cinnabar: "#B63A2B",
        mapBeige: "#E8DDCB",
        highlight: "#D6B98C"
      },
      boxShadow: {
        paper: "0 20px 50px rgba(31, 26, 23, 0.12)"
      },
      fontFamily: {
        serifCn: [
          "\"Source Han Serif SC\"",
          "\"Noto Serif SC\"",
          "\"Songti SC\"",
          "serif"
        ],
        sansCn: [
          "\"Source Han Sans SC\"",
          "\"Noto Sans SC\"",
          "\"PingFang SC\"",
          "\"Microsoft YaHei\"",
          "sans-serif"
        ]
      },
      maxWidth: {
        desktop: "1440px"
      }
    }
  },
  plugins: []
};

export default config;

