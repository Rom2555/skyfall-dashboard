// find-static.js - поиск статических данных
const fs = require('fs');
const path = require('path');

console.log('🔍 Ищу статические данные 1800/3000/60...\n');

function searchInDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.includes('node_modules')) {
      searchInDirectory(fullPath);
    } else if (
      file.name.endsWith('.js') || 
      file.name.endsWith('.ts') ||
      file.name.endsWith('.jsx') || 
      file.name.endsWith('.tsx')
    ) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        if (content.includes('1800') || content.includes('3000') || content.includes('"60"')) {
          console.log(`📄 ${fullPath}`);
          
          // Показываем контекст
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (line.includes('1800') || line.includes('3000') || line.includes('"60"')) {
              console.log(`   Строка ${index + 1}: ${line.trim()}`);
            }
          });
          console.log('');
        }
      } catch (err) {
        // Пропускаем ошибки чтения
      }
    }
  }
}

// Начинаем поиск с текущей директории
searchInDirectory(process.cwd());

console.log('='.repeat(60));
console.log('✅ Поиск завершен. Файлы выше содержат статические данные.');