import { relevantMatches, composeDirection, findGaps, parseIntent, rankProjects, termLabel } from "@/lib/discovery/engine";

const queries = [
  "Find me dark cinematic wedding work.",
  "Show product photography that feels minimal and expensive.",
  "I want warm Japanese-inspired architecture photography.",
  "I want cinematic wedding photography with a quiet editorial feeling.",
  "I need a fashion campaign with strong shadows.",
  "I want something intimate, warm and imperfect.",
  "Something monochrome and experimental, no candlelight",
  "warm but not dramatic, rather than posed",
  "asdf qwerty",
];
for (const q of queries) {
  const intent = parseIntent(q);
  const matches = relevantMatches(rankProjects(intent));
  console.log("\n>", q);
  console.log("  terms:", intent.terms.map(termLabel).join(", "), "| avoid:", intent.avoid.map(termLabel).join(", "), "| kw:", intent.keywords.join(","));
  console.log("  matches:", matches.map((m) => `${m.project.slug}(${m.fit.toFixed(2)}: ${m.reasons.join("/")})`).join("  "));
  console.log("  gaps:", findGaps(intent).map(termLabel).join(", "));
  console.log("  direction:", composeDirection(intent, matches).headline, "—", composeDirection(intent, matches).summary);
}
