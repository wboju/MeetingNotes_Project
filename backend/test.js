require('dotenv').config();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY || 'dummy',
  baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
});

async function test() {
  console.log('Testing Qwen API...');
  const stream = await openai.chat.completions.create({
    model: 'qwen3.7-plus',
    messages: [{ role: 'user', content: 'Say hello in one word.' }],
    stream: true,
    enable_thinking: false,
  });

  let response = '';
  for await (const chunk of stream) {
    if (!chunk.choices || chunk.choices.length === 0) continue;
    const delta = chunk.choices[0].delta;
    if (delta.content) response += delta.content;
  }
  console.log('Response:', response);
}

test().catch(console.error);