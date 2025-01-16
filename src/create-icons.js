const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 创建 assets 目录
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 写入 SVG 文件
const svgContent = `<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="128" cy="128" r="120" fill="#4CAF50"/>
  <path d="M128 80C80 80 40 128 40 128C40 128 80 176 128 176C176 176 216 128 216 128C216 128 176 80 128 80Z" 
        fill="white" stroke="white" stroke-width="8"/>
  <circle cx="128" cy="128" r="32" fill="#4CAF50"/>
  <circle cx="144" cy="112" r="12" fill="white"/>
</svg>`;

const svgPath = path.join(assetsDir, 'icon.svg');
fs.writeFileSync(svgPath, svgContent);

// 检查是否安装了 Inkscape
try {
  execSync('inkscape --version');
  
  // 生成不同尺寸的 PNG 图标
  const sizes = {
    'icon.png': 256,
    'icon-win-tray.png': 32,
    'icon--macos.png': 512,
    'icon-Template.png': 32
  };

  Object.entries(sizes).forEach(([filename, size]) => {
    const outputPath = path.join(assetsDir, filename);
    execSync(`inkscape --export-filename="${outputPath}" -w ${size} -h ${size} "${svgPath}"`);
    console.log(`生成图标: ${filename}`);
  });

} catch (error) {
  console.error('请安装 Inkscape 以生成图标文件');
  console.error('您可以从这里下载: https://inkscape.org/release');
  process.exit(1);
} 