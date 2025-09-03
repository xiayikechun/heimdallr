import { generateCodeExamples, getAvailableLanguages, validateTemplateVariables } from '../codeExamples';

describe('Code Examples', () => {
  const testVariables = {
    baseUrl: 'http://localhost:9000',
    groupKey: 'test-group',
  };

  test('should generate code examples for all languages', () => {
    const examples = generateCodeExamples(testVariables);
    const languages = getAvailableLanguages();

    expect(Object.keys(examples)).toEqual(languages);
    expect(languages).toContain('cURL');
    expect(languages).toContain('Python');
    expect(languages).toContain('JavaScript');
    expect(languages).toContain('Go');
    expect(languages).toContain('Java');
    expect(languages).toContain('PHP');
  });

  test('should replace template variables correctly', () => {
    const examples = generateCodeExamples(testVariables);
    
    // Check that variables are replaced
    Object.values(examples).forEach(code => {
      expect(code).toContain('http://localhost:9000');
      expect(code).toContain('test-group');
      expect(code).not.toContain('{{baseUrl}}');
      expect(code).not.toContain('{{groupKey}}');
    });
  });

  test('should validate template variables', () => {
    expect(validateTemplateVariables(testVariables)).toBe(true);
    expect(validateTemplateVariables({ baseUrl: 'test' })).toBe(false);
    expect(validateTemplateVariables({})).toBe(false);
  });

  test('should generate valid code syntax', () => {
    const examples = generateCodeExamples(testVariables);
    
    // Basic syntax checks
    expect(examples['cURL']).toMatch(/^curl/);
    expect(examples['Python']).toContain('import requests');
    expect(examples['JavaScript']).toContain('fetch(');
    expect(examples['Go']).toContain('package main');
    expect(examples['Java']).toContain('public class NotificationSender');
    expect(examples['PHP']).toContain('<?php');
  });

  test('should handle special characters in variables', () => {
    const specialVariables = {
      baseUrl: 'http://example.com:8080',
      groupKey: 'test-group-123',
    };
    
    const examples = generateCodeExamples(specialVariables);
    
    Object.values(examples).forEach(code => {
      expect(code).toContain('http://example.com:8080');
      expect(code).toContain('test-group-123');
    });
  });

  test('should generate Java example with proper class structure', () => {
    const examples = generateCodeExamples(testVariables);
    const javaCode = examples['Java'];
    
    expect(javaCode).toContain('public class NotificationSender');
    expect(javaCode).toContain('HttpClient');
    expect(javaCode).toContain('URLEncoder.encode');
    expect(javaCode).toContain('public static void main');
  });

  test('should generate PHP example with proper structure', () => {
    const examples = generateCodeExamples(testVariables);
    const phpCode = examples['PHP'];
    
    expect(phpCode).toContain('<?php');
    expect(phpCode).toContain('class NotificationSender');
    expect(phpCode).toContain('curl_init()');
    expect(phpCode).toContain('urlencode($message)');
  });

  test('should have consistent error handling across languages', () => {
    const examples = generateCodeExamples(testVariables);
    
    // Check that each language includes some form of error handling
    expect(examples['Python']).toContain('print(response.status_code)');
    expect(examples['JavaScript']).toContain('.catch(error =>');
    expect(examples['Go']).toContain('if err != nil');
    expect(examples['Java']).toContain('} catch (Exception e)');
    expect(examples['PHP']).toContain('} catch (Exception $e)');
  });
});