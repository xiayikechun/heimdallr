import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 解析命令行参数
const args = process.argv.slice(2);
const hasUnusedFlag = args.includes('--unused');
const hasEmptyFlag = args.includes('--empty');
const hasAllFlag = args.includes('--all');

// 如果没有指定参数，默认清理所有
const shouldCleanUnused = hasUnusedFlag || hasAllFlag || (!hasUnusedFlag && !hasEmptyFlag);
const shouldCleanEmpty = hasEmptyFlag || hasAllFlag || (!hasUnusedFlag && !hasEmptyFlag);

// 读取翻译文件
const zhPath = path.resolve(__dirname, '../src/i18n/zh.json');
const enPath = path.resolve(__dirname, '../src/i18n/en.json');

let zhTranslations = JSON.parse(fs.readFileSync(zhPath, 'utf8'));
let enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// 递归获取所有key
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], prefix ? `${prefix}.${key}` : key));
    } else {
      keys.push(prefix ? `${prefix}.${key}` : key);
    }
  }
  return keys;
}

// 删除指定的key
function removeKey(obj, keyPath) {
  const keys = keyPath.split('.');
  const lastKey = keys.pop();
  let current = obj;
  
  // 导航到父对象
  for (const key of keys) {
    if (!current || typeof current !== 'object' || !(key in current)) {
      return false;
    }
    current = current[key];
  }
  
  if (current && typeof current === 'object' && lastKey in current) {
    delete current[lastKey];
    return true;
  }
  
  return false;
}

// 清理空的对象
function cleanEmptyObjects(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      cleanEmptyObjects(obj[key]);
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    }
  }
}

// 递归删除未翻译的key（保留原有功能作为备用）
function cleanUntranslatedKeys(obj, objName) {
  let cleanedCount = 0;
  
  function clean(current, path = '') {
    for (const key in current) {
      const fullKey = path ? `${path}.${key}` : key;
      
      if (typeof current[key] === 'object' && current[key] !== null) {
        cleanedCount += clean(current[key], fullKey);
      } else if (current[key] === '' || current[key] === '__STRING_NOT_TRANSLATED__') {
        console.log(`删除未翻译的key: ${objName}.${fullKey}`);
        delete current[key];
        cleanedCount++;
      }
    }
  }
  
  clean(obj);
  return cleanedCount;
}

async function main() {
  try {
    console.log('🧹 开始清理翻译key...\n');
    
    let totalRemovedUnused = 0;
    let totalRemovedEmpty = 0;
    
    // 清理未使用的key
    if (shouldCleanUnused) {
      console.log('📡 扫描未使用的翻译key...');
      
      const sourceFiles = await glob('src/**/*.{ts,tsx}', { 
        cwd: path.resolve(__dirname, '..'),
        ignore: ['src/i18n/**', '**/*.test.*', '**/node_modules/**'] 
      });
      
      let sourceContent = '';
      for (const file of sourceFiles) {
        const filePath = path.resolve(__dirname, '..', file);
        sourceContent += fs.readFileSync(filePath, 'utf8');
      }

      const zhKeys = getAllKeys(zhTranslations);
      const unusedKeys = zhKeys.filter(key => {
        // 检查 t('key') 或 t("key") 或 t(`key`)
        const patterns = [
          new RegExp(`t\\(['"\`]${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]\\)`, 'g'),
          new RegExp(`t\\(['"\`]${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`],`, 'g')
        ];
        
        return !patterns.some(pattern => pattern.test(sourceContent));
      });

      for (const key of unusedKeys) {
        const removedFromZh = removeKey(zhTranslations, key);
        const removedFromEn = removeKey(enTranslations, key);
        
        if (removedFromZh || removedFromEn) {
          console.log(`删除未使用的key: ${key}`);
          totalRemovedUnused++;
        }
      }
    }

    // 清理未翻译的key
    if (shouldCleanEmpty) {
      if (shouldCleanUnused) console.log(''); // 添加分隔
      console.log('🗑️  清理未翻译的key...');
      
      const zhUntranslated = cleanUntranslatedKeys(zhTranslations, 'zh');
      const enUntranslated = cleanUntranslatedKeys(enTranslations, 'en');
      totalRemovedEmpty = zhUntranslated + enUntranslated;
    }

    // 保存文件和显示结果
    if (totalRemovedUnused > 0 || totalRemovedEmpty > 0) {
      // 清理空对象
      cleanEmptyObjects(zhTranslations);
      cleanEmptyObjects(enTranslations);
      
      // 保存文件
      fs.writeFileSync(zhPath, JSON.stringify(zhTranslations, null, 2) + '\n', 'utf8');
      fs.writeFileSync(enPath, JSON.stringify(enTranslations, null, 2) + '\n', 'utf8');
      
      console.log('');
      if (totalRemovedUnused > 0) {
        console.log(`✅ 成功删除 ${totalRemovedUnused} 个未使用的翻译key`);
      }
      if (totalRemovedEmpty > 0) {
        console.log(`✅ 成功删除 ${totalRemovedEmpty} 个未翻译的key`);
      }
    } else {
      console.log('✅ 没有发现需要清理的key');
    }

    console.log('\n🎯 清理完成!');
  } catch (error) {
    console.error('❌ 清理过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
🧹 i18n 清理工具

用法:
  node scripts/clean-i18n.js [选项]

选项:
  --unused    只清理未使用的翻译key
  --empty     只清理未翻译的key (空值或 __STRING_NOT_TRANSLATED__)
  --all       清理所有类型的key (默认行为)
  --help      显示此帮助信息

示例:
  node scripts/clean-i18n.js                 # 清理所有
  node scripts/clean-i18n.js --unused        # 只清理未使用的key
  node scripts/clean-i18n.js --empty         # 只清理未翻译的key
  node scripts/clean-i18n.js --all           # 明确指定清理所有
`);
}

// 检查是否需要显示帮助
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

main();