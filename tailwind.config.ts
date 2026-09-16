import type { Config } from "tailwindcss";

// ---------------------------------------------------------------------
// Design tokens for Anchal.
//
// Color — warm boutique palette, not the generic cream+terracotta+serif
// AI default: our terracotta is a muted rust rather than a bright clay,
// and it's one of five accents used sparingly for hierarchy, not as a
// blanket wash.
//   cream     #FBF6EF  primary background
//   beige     #EAE0CC  secondary surfaces (cards, input fills)
//   charcoal  #2B231C  body text / dark surfaces
//   maroon    #7A2A2E  primary CTA / price emphasis
//   terracotta #B75B33 badges, secondary CTA, hover accents
//   rose      #C98A93  wishlist / sale highlights
//
// Type — Fraunces (serif) carries the brand's personality in headings;
// Work Sans (humanist sans) handles body copy and UI chrome. Two families,
// clearly distinct weights and roles, per the frontend-design guidance.
// ---------------------------------------------------------------------

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF6EF",
        beige: "#EAE0CC",
        charcoal: "#2B231C",
        maroon: {
          DEFAULT: "#7A2A2E",
          dark: "#5E2023",
        },
        terracotta: {
          DEFAULT: "#B75B33",
          light: "#D68A5F",
        },
        rose: {
          DEFAULT: "#C98A93",
          light: "#E7C7CC",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-work-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "68ch",
      },
      borderRadius: {
        card: "6px", // deliberately small — this is not the rounded-2xl SaaS-card look
      },
    },
  },
  plugins: [],
};

export default config;
