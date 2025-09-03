import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取翻译文件
const zhTranslations = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/i18n/zh.json'), 'utf8'));
const enTranslations = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/i18n/en.json'), 'utf8'));

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

// 检查key是否存在于对象中
function hasKey(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (!current || typeof current !== 'object' || !(key in current)) {
      return false;
    }
    current = current[key];
  }
  
  return true;
}

const zhKeys = getAllKeys(zhTranslations);
const enKeys = getAllKeys(enTranslations);

console.log('🔍 检查i18n翻译状态...\n');

// 检查未翻译的key
const missingInEn = zhKeys.filter(key => !hasKey(enTranslations, key));
const missingInZh = enKeys.filter(key => !hasKey(zhTranslations, key));

if (missingInEn.length > 0) {
  console.log('❌ 以下key在英文翻译中缺失:');
  missingInEn.forEach(key => console.log(`  - ${key}`));
  console.log('');
}

if (missingInZh.length > 0) {
  console.log('❌ 以下key在中文翻译中缺失:');
  missingInZh.forEach(key => console.log(`  - ${key}`));
  console.log('');
}

// 检查未使用的key
async function checkUnusedKeys() {
  try {
    const sourceFiles = await glob('src/**/*.{ts,tsx}', { 
      cwd: path.resolve(__dirname, '..'),
      ignore: ['src/i18n/**', '**/*.test.*', '**/node_modules/**'] 
    });
    
    let sourceContent = '';
    for (const file of sourceFiles) {
      const filePath = path.resolve(__dirname, '..', file);
      sourceContent += fs.readFileSync(filePath, 'utf8');
    }

    const unusedKeys = zhKeys.filter(key => {
      // 检查 t('key') 或 t("key") 或 t(`key`)
      const patterns = [
        new RegExp(`t\\(['"\`]${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]\\)`, 'g'),
        new RegExp(`t\\(['"\`]${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`],`, 'g')
      ];
      
      return !patterns.some(pattern => pattern.test(sourceContent));
    });

    if (unusedKeys.length > 0) {
      console.log('⚠️  以下key可能未被使用:');
      unusedKeys.forEach(key => console.log(`  - ${key}`));
      console.log('');
    }

    // 统计信息
    console.log('📊 统计信息:');
    console.log(`  - 中文翻译key总数: ${zhKeys.length}`);
    console.log(`  - 英文翻译key总数: ${enKeys.length}`);
    console.log(`  - 缺失英文翻译: ${missingInEn.length}`);
    console.log(`  - 缺失中文翻译: ${missingInZh.length}`);
    console.log(`  - 可能未使用: ${unusedKeys.length}`);

    if (missingInEn.length === 0 && missingInZh.length === 0 && unusedKeys.length === 0) {
      console.log('\n✅ 所有翻译key状态正常!');
      process.exit(0);
    } else {
      console.log('\n⚠️  发现翻译问题，请检查并修复');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error.message);
    process.exit(1);
  }
}

checkUnusedKeys();