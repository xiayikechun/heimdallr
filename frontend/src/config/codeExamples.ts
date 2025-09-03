/**
 * Configuration for code examples
 */
export const CODE_EXAMPLE_CONFIG = {
  // Default variables that are commonly used
  defaultVariables: {
    baseUrl: 'http://localhost:9000',
    groupKey: 'example-group',
    message: 'Your notification message',
  },

  // Language-specific configurations
  languageConfigs: {
    'cURL': {
      extension: 'sh',
      commentStyle: '#',
      description: 'Simple HTTP request using cURL',
    },
    'Python': {
      extension: 'py',
      commentStyle: '#',
      description: 'Python requests library example',
      dependencies: ['requests'],
    },
    'JavaScript': {
      extension: 'js',
      commentStyle: '//',
      description: 'JavaScript fetch API example',
      dependencies: [],
    },
    'Go': {
      extension: 'go',
      commentStyle: '//',
      description: 'Go HTTP client example',
      dependencies: ['fmt', 'io', 'net/http', 'net/url'],
    },
    'Java': {
      extension: 'java',
      commentStyle: '//',
      description: 'Java HttpClient example (Java 11+)',
      dependencies: ['java.net.http', 'java.net.URI', 'java.net.URLEncoder'],
    },
    'PHP': {
      extension: 'php',
      commentStyle: '//',
      description: 'PHP cURL example',
      dependencies: ['curl'],
    },
  },

  // Template validation rules
  validation: {
    requiredVariables: ['baseUrl', 'groupKey'],
    optionalVariables: ['message'],
  },
} as const;

/**
 * Get language configuration
 */
export function getLanguageConfig(language: string) {
  return CODE_EXAMPLE_CONFIG.languageConfigs[language as keyof typeof CODE_EXAMPLE_CONFIG.languageConfigs];
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages() {
  return Object.keys(CODE_EXAMPLE_CONFIG.languageConfigs);
}