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

function parseProblem(content, fileName) {
  const questionMatch = content.match(/\/\*[\s\S]*?QUESTION:-([\s\S]*?)\*\//);
  const approachMatch = content.match(/\/\*[\s\S]*?APPROACH:-([\s\S]*?)\*\//);
  const codeMatch = content.match(/\/\/ CODE:-\s*([\s\S]*?)(?=\/\/ TIME|$)/s);
  const timeMatch = content.match(/\/\/ TIME COMPLEXITY\s*=\s*(.+)/i);
  const spaceMatch = content.match(/\/\/ SPACE COMPLEXITY\s*=\s*(.+)/i);

  const question = questionMatch ? questionMatch[1].trim() : "";
  const approach = approachMatch ? approachMatch[1].trim() : "";
  const code = codeMatch ? codeMatch[1].trim() : "";
  const time = timeMatch ? timeMatch[1].trim() : "";
  const space = spaceMatch ? spaceMatch[1].trim() : "";

  const baseName = path.basename(fileName, ".cpp");
  const title = baseName
    .replace(/^\d+\.?\s*/, "")
    .replace(/_/g, " ")
    .replace(/\s*&\s*/g, " & ")
    .trim();

  return { title, statement: question, approach, code, time, space };
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function convertCppToJava(code) {
  if (!code) return "";

  return code
    .replace(/\bint\s+main\s*\(/g, "// Main method:")
    .replace(/\bcout\s*<<\s*/g, "// System.out.println(")
    .replace(/<<\s*endl/g, "// )")
    .replace(/;\s*$/gm, ";")
    .replace(/\bstd::/g, "")
    .replace(/\bvector</g, "ArrayList<")
    .replace(/\bstd::vector</g, "ArrayList")
    .replace(/\bstd::string/g, "String")
    .replace(/\bstring/g, "String")
    .replace(/\bbool/g, "boolean")
    .replace(/\bchar/g, "char")
    .replace(/\bfloat/g, "float")
    .replace(/\bdouble/g, "double")
    .replace(/\bsizeof\s*\(/g, ".size()")
    .replace(/\.push_back\(/g, ".add(")
    .replace(/\.pop_back\(/g, ".remove(")
    .replace(/\.back\(/g, ".get(.size()-1)")
    .replace(/\.begin\(\)/g, "0")
    .replace(/\.end\(\)/g, ".size()")
    .replace(/\.empty\(\)/g, ".isEmpty()")
    .replace(/\.clear\(\)/g, ".clear()")
    .replace(/\.insert\(/g, ".add(")
    .replace(/\.erase\(/g, ".remove(")
    .replace(/\.find\(/g, ".indexOf(")
    .replace(/\.count\(/g, ".contains(")
    .replace(/\.max_element\(/g, "Collections.max(")
    .replace(/\.min_element\(/g, "Collections.min(")
    .replace(/\.sort\(/g, "Collections.sort(")
    .replace(/auto\s+/g, "var ")
    .replace(/\bnullptr\b/g, "null")
    .replace(/\btrue\b/g, "true")
    .replace(/\bfalse\b/g, "false");
}

const problems = [];
const seen = new Set();

const topics = Object.keys(topicMap);
for (const topicDir of topics) {
  const topicPath = path.join(repoDir, topicDir);
  if (!fs.existsSync(topicPath)) continue;

  const topic = topicMap[topicDir];
  const difficultyDirs = fs.readdirSync(topicPath);

  for (const diffDir of difficultyDirs) {
    const diffPath = path.join(topicPath, diffDir);
    if (!fs.statSync(diffPath).isDirectory()) continue;

    const pattern = difficultyMap[diffDir] || diffDir;
    const files = fs.readdirSync(diffPath).filter((f) => f.endsWith(".cpp"));

    for (const file of files) {
      const filePath = path.join(diffPath, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = parseProblem(content, file);

      let slug = generateSlug(parsed.title);
      let counter = 1;
      while (seen.has(slug)) {
        slug = generateSlug(parsed.title) + "-" + counter++;
      }
      seen.add(slug);

      const problem = {
        slug,
        title: parsed.title,
        topic,
        pattern,
        link: "",
        content: {
          statementMd: parsed.statement || `Solve the problem: ${parsed.title}`,
          inputMd: "",
          outputMd: "",
          exampleMd: "",
          exampleExplanationMd: "",
          brute: {
            intuitionMd: parsed.approach
              ? `Understand the problem and develop a solution approach.\n\n${parsed.approach}`
              : "",
            approachMd: parsed.approach || "",
            visualization: null,
            codeJava: convertCppToJava(parsed.code),
            time: parsed.time || "",
            space: parsed.space || "",
            complexityExplanationMd: parsed.time
              ? `Time complexity: ${parsed.time}\nSpace complexity: ${parsed.space}`
              : "",
          },
          optimal: {
            intuitionMd: "",
            approachMd: "",
            visualization: null,
            codeJava: "",
            time: "",
            space: "",
            complexityExplanationMd: "",
          },
          quickRevision: {
            brute: parsed.approach
              ? parsed.approach
                  .split("\n")
                  .map((line) => line.replace(/^->\s*/, "").trim())
                  .filter(Boolean)
                  .slice(0, 5)
              : [],
            optimal: [],
          },
        },
      };

      problems.push(problem);
    }
  }
}

console.log(`Generated ${problems.length} problems`);

// Save to JSON
fs.writeFileSync(
  "/Users/dev/Documents/GitHub/my-dsa-gallery/problems-data.json",
  JSON.stringify(problems, null, 2)
);
console.log("Saved to problems-data.json");
