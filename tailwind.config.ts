import type { Config } from "tailwindcss";

const config: Config = {
content: [
"./app/**/*.{ts,tsx}",
"./components/**/*.{ts,tsx}",
],
theme: {
extend: {
colors: { glass: "rgba(255,255,255,0.6)" },
backdropBlur: { xs: '2px' },
},
},
plugins: [],
};
export default config;