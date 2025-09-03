#!/usr/bin/env node

/**
 * Simple validation for code examples
 * This script validates the basic structure of code examples
 */

console.log('🔍 Validating code examples structure...\n');

// Mock test variables
const testVariables = {
  baseUrl: 'http://localhost:9000',
  groupKey: 'test-group',
};

// Expected languages
const expectedLanguages = ['cURL', 'Python', 'JavaScript', 'Go', 'Java', 'PHP'];

// Language-specific validation patterns
const languageValidation = {
  'cURL': [/^curl/, /http:\/\/localhost:9000/, /test-group/],
  'Python': [/import requests/, /http:\/\/localhost:9000/, /test-group/],
  'JavaScript': [/fetch\(/, /http:\/\/localhost:9000/, /test-group/],
  'Go': [/package main/, /func main\(\)/, /http:\/\/localhost:9000/, /test-group/],
  'Java': [/public class NotificationSender/, /HttpClient/, /http:\/\/localhost:9000/, /test-group/],
  'PHP': [/<\?php/, /curl_init/, /http:\/\/localhost:9000/, /test-group/],
};

// Mock template replacement
function mockGenerateExamples() {
  return {
    'cURL': `curl -X GET "${testVariables.baseUrl}/${testVariables.groupKey}/Hello%20World"`,
    'Python': `import requests\n\n# Send notification\nresponse = requests.get("${testVariables.baseUrl}/${testVariables.groupKey}/Hello%20World")`,
    'JavaScript': `fetch('${testVariables.baseUrl}/${testVariables.groupKey}/Hello%20World')\n  .then(response => response.json())`,
    'Go': `package main\n\nfunc main() {\n    baseURL := "${testVariables.baseUrl}"\n    groupKey := "${testVariables.groupKey}"\n}`,
    'Java': `public class NotificationSender {\n    private static final String BASE_URL = "${testVariables.baseUrl}";\n    private static final String GROUP_KEY = "${testVariables.groupKey}";\n    private final HttpClient client;\n}`,
    'PHP': `<?php\n\nclass NotificationSender {\n    private $baseUrl = "${testVariables.baseUrl}";\n    private $groupKey = "${testVariables.groupKey}";\n    \n    public function sendNotification($message) {\n        $ch = curl_init();\n    }\n}`,
  };
}

const examples = mockGenerateExamples();
const issues = [];
const warnings = [];

console.log(`✓ Found ${Object.keys(examples).length} languages: ${Object.keys(examples).join(', ')}`);

// Validate each language
for (const language of expectedLanguages) {
  if (!examples[language]) {
    issues.push(`Missing ${language} example`);
    continue;
  }
  
  const code = examples[language];
  const patterns = languageValidation[language];
  
  if (!patterns) {
    warnings.push(`No validation patterns defined for ${language}`);
    continue;
  }
  
  // Check each pattern
  for (const pattern of patterns) {
    if (!pattern.test(code)) {
      warnings.push(`${language}: Code doesn't match pattern ${pattern}`);
    }
  }
  
  // Check for template variables that weren't replaced
  if (code.includes('{{') || code.includes('}}')) {
    issues.push(`${language}: Contains unreplaced template variables`);
  }
  
  console.log(`✓ ${language}: ${code.split('\n').length} lines`);
}

// Check for missing languages
const missingLanguages = expectedLanguages.filter(lang => !examples[lang]);
if (missingLanguages.length > 0) {
  issues.push(`Missing languages: ${missingLanguages.join(', ')}`);
}

// Report results
console.log('\n📊 Validation Results:');
console.log('='.repeat(50));

if (issues.length === 0 && warnings.length === 0) {
  console.log('🎉 All code examples look good!');
  process.exit(0);
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(warning => console.log(`  - ${warning}`));
}

if (issues.length > 0) {
  console.log('\n❌ Issues:');
  issues.forEach(issue => console.log(`  - ${issue}`));
  console.log(`\n${issues.length} issue(s) found. Please fix before committing.`);
  process.exit(1);
}

if (warnings.length > 0 && issues.length === 0) {
  console.log('\n✅ No critical issues found, but please review warnings.');
  process.exit(0);
}