async function run() {
  const urls = [
    'https://r.jina.ai/https://devblogs.microsoft.com/blog/the-microsoft-365-copilot-agents-playbook-a-practical-livestream-series-for-building-better-agents/',
    'https://r.jina.ai/https://www.docker.com/blog/agentic-ai-needs-guardrails-not-guesswork/',
    'https://r.jina.ai/https://github.blog/ai-and-ml/github-copilot/the-harness-is-all-you-need-mostly/'
  ];
  
  for (const url of urls) {
    console.log("=========================================");
    console.log("FETCHING: " + url);
    const res = await fetch(url);
    const text = await res.text();
    const lines = text.split('\n').slice(0, 15);
    console.log(lines.join('\n'));
    console.log("\n\n");
  }
}
run();
