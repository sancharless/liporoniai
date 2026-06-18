const fs = require('fs');

const logPath = 'C:\\Users\\USUÁRIO\\.gemini\\antigravity-ide\\brain\\885b8774-7885-4d0a-abe5-49fe8681d7de\\.system_generated\\logs\\transcript.jsonl';

try {
  const content = fs.readFileSync(logPath, 'utf8');
  console.log('Read transcript file successfully. Length:', content.length);
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    try {
      const parsed = JSON.parse(lines[i]);
      if (parsed.content && parsed.content.includes('AMMOBOX BBS 0,25g')) {
        const outName = `match_${parsed.step_index}.txt`;
        fs.writeFileSync(outName, parsed.content, 'utf8');
        console.log(`Saved step ${parsed.step_index} content to ${outName}, length: ${parsed.content.length}`);
      }
    } catch (e) {
      // ignore JSON parse errors
    }
  }
} catch (err) {
  console.error('Error:', err);
}
