// Extract Tasks Feature API
// Extracts multiple tasks from natural language input
// Designed for neurodivergent users (ADHD/Autism) - just brain dump everything!

import { NextRequest, NextResponse } from 'next/server';
import { groqChatCompletion, GROQ_MODELS } from '@/lib/groq/client';
import { auth } from '@clerk/nextjs/server';

const EXTRACT_TASKS_PROMPT = `You are Navia's Task Extraction Assistant, specialized in helping neurodivergent individuals (ADHD/Autism) capture their tasks from brain dumps.

YOUR ONLY JOB:
Extract clear, actionable tasks from whatever the user types - whether it's one task or a messy brain dump of everything on their mind.

CORE PRINCIPLES:
1. **Brain Dump Friendly**: Accept messy, stream-of-consciousness input
2. **No Judgment**: Every task is valid, no matter how small
3. **Clear Extraction**: Turn vague thoughts into concrete tasks
4. **Preserve Intent**: Keep their original meaning
5. **Break Down Big Things**: If something is huge, note it needs breakdown

EXTRACTION RULES:

**Input Examples:**
- "laundry, dishes, call mom"
- "I need to do laundry and also dishes and maybe call mom later"
- "ugh so much to do... laundry is piling up, dishes in sink, haven't called mom in weeks"
- "clean room" (one task)
- "work on project, it's due Friday and I haven't started and I'm stressed"

**Output Format (JSON):**
{
  "tasks": [
    {
      "title": "Task title here",
      "category": "career" | "finance" | "daily_life" | "social",
      "priority": "low" | "medium" | "high",
      "time_estimate": <minutes as integer>
    }
  ],
  "message": "Got it! I extracted 3 tasks for you. 💛"
}

**CRITICAL: Only include these 4 fields in each task object: title, category, priority, time_estimate. Do NOT add any other fields.**

**Task Categories:**
- "career" - Job, work, applications, interviews, networking
- "finance" - Bills, budgeting, taxes, money management
- "daily_life" - Chores, errands, self-care, social, everything else

**Priority Assignment:**
- "high" - Urgent, time-sensitive, important deadlines
- "medium" - Should do soon, but not urgent
- "low" - Nice to do, low pressure

**Time Estimates (in minutes):**
- Quick tasks: 5-15 min
- Medium tasks: 20-45 min
- Longer tasks: 60+ min
- If unclear, estimate conservatively (slightly longer)

**Handling Different Inputs:**

1. **Clean list:**
   Input: "laundry, dishes, call mom"
   → Extract 3 clear tasks

2. **Messy brain dump:**
   Input: "ugh I need to do laundry and dishes are piling up and I should call mom but I'm stressed"
   → Extract same 3 tasks, ignore filler words

3. **One task:**
   Input: "do laundry"
   → Extract 1 task

4. **Vague/overwhelming:**
   Input: "clean my entire apartment"
   → Extract 1 task with longer time estimate

5. **Mixed specificity:**
   Input: "wash dishes, clean room, work on resume"
   → Extract 3 tasks with appropriate time estimates

6. **With emotions/context:**
   Input: "I'm so behind... need to do laundry, dishes, and apply to jobs (terrified)"
   → Extract 3 tasks, ignore emotional context (but validate in message)

**Response Message:**
Keep it warm and encouraging:
- "Got it! I extracted [N] tasks for you. 💛"
- "I see [N] tasks here - you've got this! 💛"
- "Added [N] tasks. Let's tackle them one at a time! 💛"

If they included emotional context:
- "I hear you - that's a lot. I extracted [N] tasks. We'll take it one step at a time. 💛"

**Important:**
- ALWAYS return valid JSON
- ALWAYS include at least 1 task (even if input is unclear)
- If input is completely unclear, return: {"tasks": [], "message": "I'm not sure what tasks you meant. Can you try again? 💛"}
- Keep titles concise (under 50 characters)
- Be consistent with categories
- NO DUPLICATES: Each task should be unique. If user says "cook and clean", extract "Cook" and "Clean" - NOT "Cook", "Clean", "Cook"
- Remove any duplicate tasks from your output before returning

**Example of WRONG output (duplicates):**
Input: "I need to cook, clean, and go grocery shopping"
WRONG: [{"title": "Cook"}, {"title": "Clean"}, {"title": "Cook"}, {"title": "Go grocery shopping"}]
CORRECT: [{"title": "Cook"}, {"title": "Clean"}, {"title": "Go grocery shopping"}]`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { input } = await req.json();

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Input is required',
        tasks: [],
        message: "I didn't get any tasks. Try typing what you need to do! 💛"
      }, { status: 400 });
    }

    // Call AI to extract tasks
    const completion = await groqChatCompletion(
      [
        { role: 'system', content: EXTRACT_TASKS_PROMPT },
        { role: 'user', content: `Extract tasks from this input: "${input}"` },
      ],
      {
        model: GROQ_MODELS.LLAMA_4_SCOUT,
        temperature: 0.3, // Lower temp for more consistent extraction
        max_tokens: 1000,
        response_format: { type: 'json_object' }, // Force JSON response
      }
    );

    const response = completion.message.content || '{}';

    // Parse the JSON response
    let result;
    try {
      result = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse AI response:', response);
      return NextResponse.json({
        error: 'Failed to parse tasks',
        tasks: [],
        message: "Hmm, I had trouble understanding that. Can you try rephrasing? 💛"
      }, { status: 500 });
    }

    // Validate response structure
    if (!result.tasks || !Array.isArray(result.tasks)) {
      return NextResponse.json({
        error: 'Invalid response format',
        tasks: [],
        message: "Something went wrong. Can you try again? 💛"
      }, { status: 500 });
    }

    // Log what AI returned
    console.log('🤖 AI returned tasks:', JSON.stringify(result.tasks, null, 2));
    
    // Deduplicate tasks (safety net in case AI returns duplicates)
    const uniqueTasks = result.tasks.filter((task: any, index: number, self: any[]) => {
      // Find first occurrence of this task title (case-insensitive)
      const firstIndex = self.findIndex(
        t => t.title.toLowerCase().trim() === task.title.toLowerCase().trim()
      );
      return index === firstIndex;
    });

    const removedCount = result.tasks.length - uniqueTasks.length;
    
    // Log deduplication results
    if (removedCount > 0) {
      console.log(`⚠️ Removed ${removedCount} duplicate task(s)`);
      console.log('✅ Unique tasks:', JSON.stringify(uniqueTasks, null, 2));
    }
    
    let message = result.message || `Got it! I extracted ${uniqueTasks.length} task${uniqueTasks.length !== 1 ? 's' : ''} for you. 💛`;
    
    // If we removed duplicates, update the message
    if (removedCount > 0) {
      message = `Got it! I extracted ${uniqueTasks.length} unique task${uniqueTasks.length !== 1 ? 's' : ''} for you. 💛`;
    }

    // Return extracted tasks
    return NextResponse.json({
      success: true,
      tasks: uniqueTasks,
      message,
      count: uniqueTasks.length,
    });

  } catch (error) {
    console.error('Extract tasks error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      tasks: [],
      message: "Oops, something went wrong. Try again? 💛"
    }, { status: 500 });
  }
}
