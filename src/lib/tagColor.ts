/** Styles for an antd `Tag` in a given color (tinted background, colored text). */
export const tagColor = (color: string) => ({
  normalWrap: { borderColor: color, backgroundColor: `${color}1a` },
  normalText: { color },
});
