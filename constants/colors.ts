// Bold, high-contrast Gen Z color palette
// No gradients - pure, purposeful colors

const colors = {
  light: {
    // Core text colors
    text: "#0F0F0F",
    textSecondary: "#6B6B6B",
    textMuted: "#9A9A9A",

    // Background colors
    background: "#FAFAFA",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",

    // Primary accent - bold electric green
    tint: "#00C853",
    tintLight: "#69F0AE",
    tintDark: "#00B248",

    // Status colors - bold and clear
    fresh: "#00C853",
    expiringSoon: "#FF9100",
    expired: "#FF1744",

    // UI colors
    border: "#E8E8E8",
    divider: "#F0F0F0",
    shadow: "rgba(0, 0, 0, 0.06)",

    // Category colors - distinct and bold
    dairy: "#2979FF",
    meat: "#FF1744",
    vegetables: "#00C853",
    fruits: "#FF9100",
    beverages: "#00B8D4",
    condiments: "#FFAB00",
    leftovers: "#7C4DFF",
    other: "#78909C",

    // Action colors
    danger: "#FF1744",
    warning: "#FF9100",
    success: "#00C853",
    info: "#2979FF",

    // Tab bar
    tabIconDefault: "#9E9E9E",
    tabIconSelected: "#00C853",
  },
};

export default colors;
export type Colors = typeof colors.light;
