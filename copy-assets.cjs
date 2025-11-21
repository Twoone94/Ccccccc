// 创建资源映射，将Figma导出的图片复制到public目录
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '.figma', 'image');
const destDir = path.join(__dirname, 'public', 'image');

// 确保目标目录存在
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// 复制所有图片文件
fs.readdirSync(srcDir).forEach(file => {
  if (file.endsWith('.svg') || file.endsWith('.png')) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${file}`);
  }
});

console.log('Asset copy completed!');