import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 运行命令的辅助函数
function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 运行: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      cwd: path.dirname(__dirname),
      stdio: 'inherit'
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`命令执行失败，退出代码: ${code}`));
      }
    });
  });
}

async function main() {
  try {
    console.log('🚀 开始i18n完整工作流程...\n');
    
    // 1. 扫描新的翻译key
    console.log('📡 1. 扫描代码中的翻译key...');
    await runCommand('pnpm', ['i18n:scan']);
    
    console.log('\n🧹 2. 清理未翻译的key...');
    await runCommand('pnpm', ['i18n:clean']);
    
    console.log('\n🔍 3. 检查翻译状态...');
    await runCommand('pnpm', ['i18n:check']);
    
    console.log('\n✅ i18n工作流程完成!');
    console.log('\n💡 提示:');
    console.log('  - 如果有缺失的翻译，请在相应的JSON文件中补充');
    console.log('  - 如果有未使用的key，可以考虑删除');
    console.log('  - 建议在提交代码前运行此工作流程');
    
  } catch (error) {
    console.error('\n❌ 工作流程执行失败:', error.message);
    process.exit(1);
  }
}

main();