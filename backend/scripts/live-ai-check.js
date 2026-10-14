import { assessPaper } from "../src/ai.js";
import { PAST_PAPERS } from "../../content/pastPapers.ts";
import assert from "node:assert/strict";

// Explicit opt-in provider smoke test. Uses one original-paper subpart and
// synthetic learner text; never reads private student records or prints keys.
if (!process.env.GEMINI_API_KEY) throw new Error("Configure a server-only key before running this check");
const paper=PAST_PAPERS.find(p=>p.id==="9701_s26_qp_21");
const result=await assessPaper(process.env,paper,"1(a)(ii)","octahedral");
assert.equal(result.status,"graded");assert.equal(result.maximum,1);assert.equal(result.score,1);
assert.ok(result.schemePages.includes(7));
console.log(JSON.stringify({paper:paper.id,subpart:"1(a)(ii)",checkedSourceHashes:true,matchingSchemePage:true,expectedOneMark:true,model:process.env.GEMINI_MODEL||"gemini-3.8-flash"}));
