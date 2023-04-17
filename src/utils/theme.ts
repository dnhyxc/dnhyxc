// 设置背景颜色
export const modifyTheme = () => {
  const body = document.body;
  // 主题背景颜色
  body.style.setProperty('--background', '#171718');
  body.style.setProperty('--modal-bg-color', '#282828');
  body.style.setProperty('--input-bg-color', '#282828');
  // card bottom 渐变颜色
  body.style.setProperty('--bg-lg-color1', '#333');
  body.style.setProperty('--bg-lg-color2', '#1e1e20');
  body.style.setProperty('--timeline-lg-color1', '#333');
  body.style.setProperty('--timeline-lg-color2', '#1e1e20');
  // card bottom 阴影颜色
  body.style.setProperty('--shadow-color', '#555');
  // 字体颜色
  body.style.setProperty('--font-1', '#f2f3f5');
  body.style.setProperty('--font-2', '#f2f3f5');
  body.style.setProperty('--font-3', '#f2f3f5');
  body.style.setProperty('--font-4', '#f2f3f5');
  body.style.setProperty('--font-5', '#f2f3f5');
  body.style.setProperty('--font-6', '#f2f3f5');
  // loading 背景颜色
  body.style.setProperty('--loading-color', 'rgba(0, 0, 0, 0.65)');
  // 输入框背景颜色
  body.style.setProperty('--menu-weak', '#1e1e20');
  body.style.setProperty('--card-border', '#555');
  body.style.setProperty('--fff', '#1e1e20');
  body.style.setProperty('--shadow-mack', 'rgba(225, 225, 225, 0.28)');
  body.style.setProperty('--tab-color', '#555');
  body.style.setProperty('--to-top-bg-color', 'rgba(38, 42, 51, 0.28)');
  body.style.setProperty('--layer-2-2', 'rgba(38, 42, 51, 0.98)');
};
