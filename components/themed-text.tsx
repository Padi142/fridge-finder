import { Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedTextProps = TextProps & {
  className?: string;
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

const TYPE_CLASS_NAMES: Record<NonNullable<ThemedTextProps["type"]>, string> = {
  default: "text-base leading-6",
  defaultSemiBold: "text-base font-semibold leading-6",
  title: "text-[32px] font-bold leading-8",
  subtitle: "text-xl font-bold",
  link: "text-base leading-[30px]",
};

export function ThemedText({
  className,
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      className={
        [TYPE_CLASS_NAMES[type], className].filter(Boolean).join(" ") ||
        undefined
      }
      style={[{ color: type === "link" ? "#0a7ea4" : color }, style]}
      {...rest}
    />
  );
}
