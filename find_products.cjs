const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\USUÁRIO\\.gemini\\antigravity-ide\\brain\\885b8774-7885-4d0a-abe5-49fe8681d7de\\.system_generated\\logs\\transcript.jsonl';

try {
  const content = fs.readFileSync(logPath, 'utf8');
  console.log('Read transcript file successfully. Length:', content.length);
  const lines = content.split('\n');
  
  let foundInput = null;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    try {
      const parsed = JSON.parse(lines[i]);
      if (parsed.content && parsed.content.includes('AMMOBOX BBS 0,25g')) {
        console.log(`Found match in step ${parsed.step_index}, type: ${parsed.type}`);
        fs.writeFileSync('extracted_input.txt', parsed.content, 'utf8');
        console.log('Saved content to extracted_input.txt');
      }
    } catch (e) {
      // ignore JSON parse errors
    }
  }
} catch (err) {
  console.error('Error:', err);
}
