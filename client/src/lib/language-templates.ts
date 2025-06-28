export function getLanguageTemplate(language: string): string {
  const templates: Record<string, string> = {
    javascript: `// Welcome to HackerIDE - JavaScript Environment
console.log("Hello from HackerIDE!");

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from HackerIDE!',
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`,

    python: `# Welcome to HackerIDE - Python Environment
print("Hello from HackerIDE!")

from flask import Flask, jsonify
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify({
        'message': 'Hello from HackerIDE!',
        'timestamp': datetime.now().isoformat(),
        'environment': 'development'
    })

if __name__ == '__main__':
    print("Starting Python server...")
    app.run(host='0.0.0.0', port=3000, debug=True)
`,

    java: `// Welcome to HackerIDE - Java Environment
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from HackerIDE!");
        
        // Simple HTTP server simulation
        System.out.println("Starting Java application...");
        System.out.println("Server would be running on port 3000");
        System.out.println("Environment: development");
        
        // Application logic here
        for (int i = 1; i <= 5; i++) {
            System.out.println("Processing request " + i);
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        System.out.println("Application completed successfully!");
    }
}
`,

    react: `// Welcome to HackerIDE - React Environment
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('Hello from HackerIDE!');
  const [timestamp, setTimestamp] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>HackerIDE React App</h1>
        <p>{message}</p>
        <p>Current time: {timestamp.toLocaleString()}</p>
        <button onClick={() => setMessage('React is working!')}>
          Test React State
        </button>
      </header>
    </div>
  );
}

export default App;
`,

    cpp: `// Welcome to HackerIDE - C++ Environment
#include <iostream>
#include <string>
#include <chrono>
#include <thread>

int main() {
    std::cout << "Hello from HackerIDE!" << std::endl;
    
    // Simple application simulation
    std::cout << "Starting C++ application..." << std::endl;
    std::cout << "Initializing components..." << std::endl;
    
    for (int i = 1; i <= 5; i++) {
        std::cout << "Processing step " << i << "/5" << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(500));
    }
    
    std::cout << "Application completed successfully!" << std::endl;
    std::cout << "Memory usage: 12.5 MB" << std::endl;
    std::cout << "Execution time: 2.5 seconds" << std::endl;
    
    return 0;
}
`,

    mysql: `-- Welcome to HackerIDE - MySQL Environment
-- Sample database schema

CREATE DATABASE IF NOT EXISTS hackeride_db;
USE hackeride_db;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    language VARCHAR(20) NOT NULL,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert sample data
INSERT INTO users (username, email) VALUES 
    ('hacker', 'hacker@hackeride.dev'),
    ('developer', 'dev@hackeride.dev');

INSERT INTO projects (name, description, language, user_id) VALUES 
    ('Hello World JS', 'Basic JavaScript project', 'javascript', 1),
    ('Python API', 'Flask-based REST API', 'python', 2);

-- Query examples
SELECT * FROM users;
SELECT p.name, p.language, u.username 
FROM projects p 
JOIN users u ON p.user_id = u.id;
`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HackerIDE - HTML/CSS Environment</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background: #000;
            color: #00FF00;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            text-align: center;
            border: 2px solid #00FF00;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px #00FF00;
            max-width: 600px;
        }
        
        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            text-shadow: 0 0 10px #00FF00;
        }
        
        .blink {
            animation: blink 1s infinite;
        }
        
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
        
        .glow {
            animation: glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
            from { text-shadow: 0 0 5px #00FF00; }
            to { text-shadow: 0 0 20px #00FF00, 0 0 30px #00FF00; }
        }
        
        button {
            background: transparent;
            border: 2px solid #00FF00;
            color: #00FF00;
            padding: 10px 20px;
            font-family: inherit;
            cursor: pointer;
            margin: 10px;
            transition: all 0.3s;
        }
        
        button:hover {
            background: #00FF00;
            color: #000;
            box-shadow: 0 0 15px #00FF00;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="glow">HackerIDE</h1>
        <p>Welcome to the HTML/CSS Environment</p>
        <p class="blink">System Status: ONLINE</p>
        <button onclick="alert('HackerIDE is ready!')">Test JavaScript</button>
        <button onclick="document.body.style.background = '#001100'">Change Theme</button>
    </div>
    
    <script>
        console.log("HackerIDE HTML/CSS environment loaded");
        console.log("Current time:", new Date().toISOString());
    </script>
</body>
</html>
`
  };

  return templates[language] || templates.javascript;
}
