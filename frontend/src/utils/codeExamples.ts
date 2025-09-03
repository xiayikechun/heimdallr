interface ExampleTemplate {
  language: string;
  template: string;
  variables: string[];
}

interface ExampleVariables {
  baseUrl: string;
  groupKey: string;
  [key: string]: string;
}

const CODE_TEMPLATES: ExampleTemplate[] = [
  {
    language: 'cURL',
    template: `curl -X GET "{{baseUrl}}/{{groupKey}}/Hello%20World"`,
    variables: ['baseUrl', 'groupKey']
  },
  {
    language: 'Python',
    template: `import requests

# Send notification
response = requests.get("{{baseUrl}}/{{groupKey}}/Hello%20World")

# With custom message
message = "Your notification message"
response = requests.get(f"{{baseUrl}}/{{groupKey}}/{message}")

print(response.status_code)
print(response.json())`,
    variables: ['baseUrl', 'groupKey']
  },
  {
    language: 'JavaScript',
    template: `// Using fetch API
fetch('{{baseUrl}}/{{groupKey}}/Hello%20World')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// With custom message
const message = 'Your notification message';
fetch(\`{{baseUrl}}/\${groupKey}/\${encodeURIComponent(message)}\`)
  .then(response => response.json())
  .then(data => console.log(data));`,
    variables: ['baseUrl', 'groupKey']
  },
  {
    language: 'Go',
    template: `package main

import (
    "fmt"
    "io"
    "net/http"
    "net/url"
)

func sendNotification(groupKey, message string) error {
    baseURL := "{{baseUrl}}"
    endpoint := fmt.Sprintf("%s/%s/%s", baseURL, groupKey, url.QueryEscape(message))
    
    resp, err := http.Get(endpoint)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return err
    }
    
    fmt.Printf("Status: %d\\n", resp.StatusCode)
    fmt.Printf("Response: %s\\n", string(body))
    
    return nil
}

func main() {
    // Send notification
    err := sendNotification("{{groupKey}}", "Hello World")
    if err != nil {
        fmt.Printf("Error: %v\\n", err)
    }
    
    // With custom message
    err = sendNotification("{{groupKey}}", "Your notification message")
    if err != nil {
        fmt.Printf("Error: %v\\n", err)
    }
}`,
    variables: ['baseUrl', 'groupKey']
  },
  {
    language: 'Java',
    template: `import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

public class NotificationSender {
    private static final String BASE_URL = "{{baseUrl}}";
    private static final String GROUP_KEY = "{{groupKey}}";
    
    private final HttpClient client;
    
    public NotificationSender() {
        this.client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }
    
    public void sendNotification(String message) throws IOException, InterruptedException {
        String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
        String url = String.format("%s/%s/%s", BASE_URL, GROUP_KEY, encodedMessage);
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .timeout(Duration.ofSeconds(30))
                .build();
        
        HttpResponse<String> response = client.send(request, 
                HttpResponse.BodyHandlers.ofString());
        
        System.out.println("Status: " + response.statusCode());
        System.out.println("Response: " + response.body());
    }
    
    public static void main(String[] args) {
        NotificationSender sender = new NotificationSender();
        
        try {
            // Send notification
            sender.sendNotification("Hello World");
            
            // With custom message
            sender.sendNotification("Your notification message");
            
        } catch (Exception e) {
            System.err.println("Error sending notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
}`,
    variables: ['baseUrl', 'groupKey']
  },
  {
    language: 'PHP',
    template: `<?php

class NotificationSender {
    private $baseUrl;
    private $groupKey;
    
    public function __construct($baseUrl, $groupKey) {
        $this->baseUrl = $baseUrl;
        $this->groupKey = $groupKey;
    }
    
    public function sendNotification($message) {
        $encodedMessage = urlencode($message);
        $url = $this->baseUrl . '/' . $this->groupKey . '/' . $encodedMessage;
        
        // Initialize cURL
        $ch = curl_init();
        
        // Set cURL options
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_HTTPHEADER => [
                'User-Agent: PHP-NotificationSender/1.0'
            ],
        ]);
        
        // Execute request
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        
        curl_close($ch);
        
        if ($error) {
            throw new Exception("cURL error: " . $error);
        }
        
        return [
            'status_code' => $httpCode,
            'body' => $response
        ];
    }
}

// Usage example
try {
    $sender = new NotificationSender("{{baseUrl}}", "{{groupKey}}");
    
    // Send notification
    $result = $sender->sendNotification("Hello World");
    echo "Status: " . $result['status_code'] . "\\n";
    echo "Response: " . $result['body'] . "\\n";
    
    // With custom message
    $result = $sender->sendNotification("Your notification message");
    echo "Status: " . $result['status_code'] . "\\n";
    echo "Response: " . $result['body'] . "\\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\\n";
}

?>`,
    variables: ['baseUrl', 'groupKey']
  }
];

/**
 * Generate code examples with provided variables
 */
export function generateCodeExamples(variables: ExampleVariables): Record<string, string> {
  const examples: Record<string, string> = {};
  
  CODE_TEMPLATES.forEach(template => {
    let code = template.template;
    
    // Replace template variables
    template.variables.forEach(variable => {
      const value = variables[variable];
      if (value !== undefined) {
        const regex = new RegExp(`{{${variable}}}`, 'g');
        code = code.replace(regex, value);
      }
    });
    
    examples[template.language] = code;
  });
  
  return examples;
}

/**
 * Get available languages
 */
export function getAvailableLanguages(): string[] {
  return CODE_TEMPLATES.map(template => template.language);
}

/**
 * Add custom code template
 */
export function addCustomTemplate(template: ExampleTemplate): void {
  CODE_TEMPLATES.push(template);
}

/**
 * Validate template variables
 */
export function validateTemplateVariables(variables: ExampleVariables): boolean {
  const requiredVariables = new Set<string>();
  
  CODE_TEMPLATES.forEach(template => {
    template.variables.forEach(variable => {
      requiredVariables.add(variable);
    });
  });
  
  for (const required of requiredVariables) {
    if (!variables[required]) {
      console.warn(`Missing required variable: ${required}`);
      return false;
    }
  }
  
  return true;
}