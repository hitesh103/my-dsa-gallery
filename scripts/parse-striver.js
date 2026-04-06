const fs = require("fs");
const path = require("path");

const repoDir = "/Users/dev/Desktop/Strivers-A2Z-DSA-Sheet";

const topicMap = {
  "01.Arrays": "Arrays",
  "02.Binary Search": "Binary Search",
  "03.Strings": "Strings",
  "04.Linked List": "Linked List",
  "05.Recursion": "Recursion",
  "06.Bit Manipulation": "Bit Manipulation",
  "07.Stack and Queues": "Stack and Queues",
  "08. Sliding Window": "Sliding Window",
  "09. Heaps": "Heaps",
  "10. Greedy Approach": "Greedy",
  "11. Binary Trees": "Binary Trees",
  "12. Binary Search Trees": "BST",
  "13. Graphs": "Graphs",
  "14. Dynamic Programming": "DP",
  "15. Tries": "Tries",
  "16. Strings (Hard)": "Strings",
};

const difficultyMap = {
  "1.Easy": "Easy",
  "2.Medium": "Medium",
  "3.Hard": "Hard",
};

const isDifficultyPattern = (name) => {
  return ["1.Easy", "2.Medium", "3.Hard"].includes(name);
};

function parseProblem(content, fileName) {
  const questionMatch = content.match(/\/\*[\s\S]*?QUESTION:-([\s\S]*?)\*\//);
  const approachMatch = content.match(/\/\*[\s\S]*?APPROACH:-([\s\S]*?)\*\//);
  const codeMatch = content.match(/\/\/ CODE:-\s*([\s\S]*?)(?=\/\/ TIME|$)/);
  const timeMatch = content.match(/\/\/ TIME COMPLEXITY\s*=\s*(.+)/i);
  const spaceMatch = content.match(/\/\/ SPACE COMPLEXITY\s*=\s*(.+)/i);

  const question = questionMatch ? questionMatch[1].trim() : "";
  const approach = approachMatch ? approachMatch[1].trim() : "";
  const code = codeMatch ? codeMatch[1].trim() : "";
  const time = timeMatch ? timeMatch[1].trim() : "";
  const space = spaceMatch ? spaceMatch[1].trim() : "";

  // Extract title from filename
  const baseName = path.basename(fileName, ".cpp");
  const title = baseName
    .replace(/^\d+\.?\s*/, "")
    .replace(/_/g, " ")
    .replace(/\s*&\s*/g, " & ")
    .trim();

  return {
    title,
    statement: question,
    approach,
    code,
    time,
    space,
  };
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const problems = [];

const topics = Object.keys(topicMap);

for (const topicDir of topics) {
  const topicPath = path.join(repoDir, topicDir);
  if (!fs.existsSync(topicPath)) continue;

  const topic = topicMap[topicDir];
  const difficultyDirs = fs.readdirSync(topicPath);

  for (const diffDir of difficultyDirs) {
    const diffPath = path.join(topicPath, diffDir);
    if (!fs.statSync(diffPath).isDirectory()) continue;

    const pattern = isDifficultyPattern(diffDir) ? difficultyMap[diffDir] : diffDir;
    const files = fs.readdirSync(diffPath).filter((f) => f.endsWith(".cpp"));

    for (const file of files) {
      const filePath = path.join(diffPath, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = parseProblem(content, file);

      const slug = generateSlug(parsed.title);

      problems.push({
        slug,
        title: parsed.title,
        topic,
        pattern,
        statement: parsed.statement,
        approach: parsed.approach,
        code: parsed.code,
        time: parsed.time,
        space: parsed.space,
      });
    }
  }
}

// Remove duplicates by slug
const seen = new Set();
const uniqueProblems = problems.filter((p) => {
  if (seen.has(p.slug)) {
    return false;
  }
  seen.add(p.slug);
  return true;
});

console.log(`Parsed ${uniqueProblems.length} unique problems`);
console.log("\nBy Topic:");
const byTopic = {};
for (const p of uniqueProblems) {
  byTopic[p.topic] = (byTopic[p.topic] || 0) + 1;
}
for (const [topic, count] of Object.entries(byTopic)) {
  console.log(`  ${topic}: ${count}`);
}

console.log("\nBy Pattern:");
const byPattern = {};
for (const p of uniqueProblems) {
  byPattern[p.pattern] = (byPattern[p.pattern] || 0) + 1;
}
for (const [pattern, count] of Object.entries(byPattern)) {
  console.log(`  ${pattern}: ${count}`);
}

// Save to JSON
fs.writeFileSync(
  "/Users/dev/Documents/GitHub/my-dsa-gallery/problems-data.json",
  JSON.stringify(uniqueProblems, null, 2)
);
console.log("\nSaved to problems-data.json");
