const tintColorLight = "#4CAF50";

const colors = {
  light: {
    text: "#1a1a1a",
    textSecondary: "#666666",
    background: "#f8faf7",
    card: "#ffffff",
    tint: tintColorLight,
    tintLight: "#81C784",
    tintDark: "#388E3C",
    tabIconDefault: "#9E9E9E",
    tabIconSelected: tintColorLight,
    border: "#E8F5E9",
    danger: "#EF5350",
    warning: "#FFA726",
    success: "#66BB6A",
    expired: "#EF5350",
    expiringSoon: "#FFA726",
    fresh: "#66BB6A",
    shadow: "rgba(0, 0, 0, 0.08)",
  },
};

export default colors;
export type Colors = typeof colors.light;
