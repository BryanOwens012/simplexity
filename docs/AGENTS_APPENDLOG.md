# Perplexity Clone - Agent Activity Log

This is an append-only log of significant changes and activities by AI agents working on this project.

## Format
```
## YYYY-MM-DD HH:MM PT - Entry Title
**Type:** [Decision | Implementation | Documentation | Conversation | Bug Fix]
**Change:** What was changed/decided
**Context:** User prompt or situation (if applicable)
**Rationale:** Why this choice was made
**Time Spent:** Actual time (not estimated/hallucinated)

NOTE: Timestamps must be accurate with PT timezone. Do not hallucinate times.
```

---

## 2025-10-20 - Initial Setup
- Created project documentation structure
- Added CLAUDE.md with project overview and guidelines
- Added AGENTS.md with workflow documentation
- Added AGENTS_APPENDLOG.md for activity tracking
- **Files Created:**
  - `/CLAUDE.md`
  - `/docs/AGENTS.md`
  - `/docs/AGENTS_APPENDLOG.md`
- **Notes:**
  - Project is a Hanover Park take-home assignment
  - WhichGLP is a GLP-1 drug comparison platform
  - Frontend-only monorepo currently (Next.js 15)
  - Uses Supabase backend, tRPC for API layer

## 2025-10-20 - Clean Slate Setup for Perplexity Clone
- Cleaned up apps/frontend directory to minimal Next.js setup
- Removed all WhichGLP-specific code and dependencies
- Created minimal Perplexity clone starter structure
- **Files Modified:**
  - `apps/frontend/package.json` - Reduced to essential dependencies only
  - `apps/frontend/next.config.mjs` - Simplified configuration
  - `apps/frontend/app/layout.tsx` - Minimal layout
  - `apps/frontend/app/page.tsx` - Simple homepage
  - `apps/frontend/app/globals.css` - Clean Tailwind CSS setup
  - `apps/frontend/.env.example` - Updated for AI/search APIs
- **Files Removed:**
  - All page routes (compare, dashboard, experiences, etc.)
  - All components and libraries
  - Build artifacts and WhichGLP-specific assets
- **Dependencies Kept:**
  - Next.js 15.2.4, React 19, TypeScript 5
  - Tailwind CSS 4.1.9
  - lucide-react (icons), clsx, tailwind-merge
- **Build Status:** ✅ Successfully builds and runs
- **Notes:**
  - Ready for Perplexity clone implementation
  - Will need to add AI provider (OpenAI/Anthropic) and search API (SerpAPI)
  - Clean slate with modern stack (Next.js 15, React 19, Tailwind 4)

## 2025-10-20 - Documentation Framework for Take-Home Assignment

**Type:** Documentation
**Change:** Enriched CLAUDE.md, README.md, and AGENTS.md with Perplexity clone requirements and decision-logging framework

**Updates Made:**
- **CLAUDE.md**: Added Perplexity clone context, API usage guidelines, time management guidance
- **README.md**: Created project overview with status tracking, tech stack section, time allocation tracking
- **AGENTS.md**: Added project-specific workflows for framework selection, API integration, feature implementation

**Decision Logging Framework:**
- All architectural decisions logged in AGENTS_APPENDLOG.md (this file)
- Periodic summaries extracted to README.md
- Time tracking for each feature/task
- Rationale and trade-offs documented for all major decisions

**Tech Stack Direction:**
- Using proven stack from previous project (Next.js 15, React 19, TypeScript, Tailwind 4)
- Will add: tRPC, TanStack Query, React Hook Form, Zod, Radix UI components
- Will add: AI API (OpenAI/Anthropic), Search API (SerpAPI or alternative), Supabase

**Time Spent:** ~30 minutes (estimated)

**Next Steps:**
- Add remaining dependencies (tRPC, TanStack Query, React Hook Form, Zod, Radix UI)
- Choose and integrate search API
- Choose and integrate LLM API
- Begin core feature implementation

## 2025-10-20 17:50 - Documentation Accuracy Update

**Type:** Documentation Fix
**Change:** Updated documentation to accurately reflect current minimal setup vs planned dependencies

**Problem Identified:**
- Documentation described full tech stack (tRPC, TanStack Query, Radix UI, Supabase, etc.) as if installed
- Actual state: Only minimal Next.js + React + TypeScript + Tailwind installed
- Created confusion about current vs planned state

**Updates Made:**
- **README.md**:
  - Split tech stack into "Currently Installed" vs "Planned Dependencies"
  - Updated "Current Setup Status" to show actual state
  - Added complete development setup instructions
  - Updated Current Phase checklist (marked framework selection as complete)
- **CLAUDE.md**:
  - Clarified tech stack section with "Currently Installed" vs "Recommended/Planned"
  - Made it clear additional dependencies should be added "as needed"

**Current Actual State:**
- ✅ Next.js 15.2.4, React 19, TypeScript 5
- ✅ Tailwind CSS 4.1.9
- ✅ lucide-react, clsx, tailwind-merge
- ✅ App successfully builds and runs
- ⏳ All other dependencies (tRPC, TanStack Query, etc.) are PLANNED but NOT installed

**Rationale:**
- Maintain clean minimal starting point
- Allow flexibility in choosing dependencies based on actual implementation needs
- Don't assume all planned dependencies will be needed
- Keep documentation truthful and current

**Impact:** Documentation now accurately reflects project state. Future work can add dependencies incrementally as needed.

## 2025-10-20 - Meta-Documentation Workflow Established

**Type:** Documentation & Process
**Change:** Established comprehensive meta-documentation workflow to track conversation flow and incorporate insights holistically

**Context:** User prompt requested:
> "Remember that, after every change, append the change details to the append log, and then incorporate the change holistically into the CLAUDE.md. Include a meta-discussion of even what prompts we've been going through; include in CLAUDE.md and AGENTS.md that fact as well"

**Rationale:**
- Take-home assignment requires explaining decisions and time allocation
- Tracking conversation flow shows how project evolved through user-agent collaboration
- Holistic incorporation into CLAUDE.md creates living documentation of methodology
- Meta-documentation demonstrates thoughtful, iterative development process

**Updates Made:**
- **CLAUDE.md**:
  - Added "Decision Logging & Meta-Documentation" section with 5-step workflow
  - Created "Meta: Project Development History" section documenting project evolution
  - Added conversation-driven development explanation
  - Updated verification checklist to include holistic incorporation
- **AGENTS.md**:
  - Added "Meta-Documentation Workflow" section with 4-step process
  - Enhanced Documentation Agent responsibilities to include conversation tracking
  - Expanded append log entry format to include "Context" and "Learnings"
  - Added "Meta-Documentation Principles" explaining the approach
- **AGENTS_APPENDLOG.md** (this file):
  - Logging this meta-workflow establishment

**Workflow Established:**
1. Make a change (code, documentation, decisions)
2. Append details to AGENTS_APPENDLOG.md with full context
3. Update README.md with holistic summaries periodically
4. Incorporate important patterns/learnings into CLAUDE.md
5. Keep AGENTS.md updated with workflow refinements

**Impact:**
- Creates complete narrative of project development
- User prompts and agent responses now part of documented process
- Insights discovered during development feed back into methodology
- Assignment writeup can reference this log for decision rationale

**Learnings:**
- Documentation should track not just outcomes but the conversation that drove them
- Meta-documentation provides transparency into decision-making process
- Living documents (CLAUDE.md, AGENTS.md) should evolve as methodology improves
- Append-only log (AGENTS_APPENDLOG.md) preserves chronological narrative

**Time Spent:** ~20 minutes (estimated)

## 2025-10-20 18:05 - Perplexity Clone Implementation Plan

**Type:** Planning & Decision
**Change:** Finalized architecture and implementation plan for Perplexity.ai clone after analyzing UI screenshots

**Context:** User requested to build a Perplexity clone with the following features:
- Page where users submit queries and receive search results + AI response with citations
- Store conversations in sessionStorage
- Match Perplexity UI design (screenshots provided)
- Use SerpAPI for search and Anthropic Claude for LLM

**Plan (Verbatim):**

## Perplexity UI Analysis

**Screenshot 1 - Initial/Empty State:**
- Dark theme (near-black background)
- Left sidebar with: logo, new chat button (+), Home, Discover, Spaces navigation
- Centered "perplexity" logo
- Large centered search input with "Ask anything..." placeholder
- Input has icons on left (search, AI, location) and right (globe, image, attachment, voice, submit)
- Suggestion chips below (Parenting, Compare, Health, Summarize, Analyze)

**Screenshot 2 - Results State:**
- Query displayed at top ("test")
- Three tabs: "Perplexity" (active), "Sources" (with count: 9), "Steps"
- Horizontal scrollable source cards with favicons and titles
- AI-generated answer with inline citations (superscript numbers)
- Citations appear as small badges next to referenced content
- Follow-up input at bottom ("Ask a follow-up")

## Architecture Plan

### Component Structure
```
app/
├── page.tsx (main conversation view)
├── layout.tsx (existing)
├── components/
│   ├── Sidebar.tsx (navigation, new chat)
│   ├── SearchInput.tsx (query input with icons)
│   ├── ConversationView.tsx (manages conversation state)
│   ├── MessageThread.tsx (displays Q&A history)
│   ├── AnswerDisplay.tsx (AI response with citations)
│   ├── SourceCard.tsx (individual source preview)
│   ├── SourcesGrid.tsx (horizontal scrollable sources)
│   └── TabNavigation.tsx (Perplexity/Sources/Steps tabs)
├── lib/
│   ├── conversationStore.ts (sessionStorage management)
│   ├── searchApi.ts (search API client)
│   └── llmApi.ts (LLM API client)
└── api/
    ├── search/route.ts (search endpoint)
    └── generate/route.ts (AI generation endpoint)
```

### Data Flow
1. User enters query in `SearchInput`
2. Query saved to sessionStorage, triggers search API call
3. Search results fetched and displayed as `SourceCard` components
4. Search results passed to LLM API with prompt to generate answer with citations
5. AI response streamed/displayed in `AnswerDisplay` with inline citation links
6. Follow-up queries append to conversation thread

### API Provider Selection (Need to decide)

**Search API Options:**
- **Brave Search API** - Free tier: 2,000 queries/month, good for demos
- **SerpAPI** - Free tier: 100 searches/month
- **Tavily AI** - AI-focused search, better for RAG use cases

**LLM API Options:**
- **OpenAI GPT-4** - Excellent citation handling, familiar API
- **Anthropic Claude** - Great at following instructions, good citations
- **Google Gemini** - Free tier available

### SessionStorage Schema
```typescript
interface Conversation {
  id: string;
  messages: Message[];
  createdAt: number;
}

interface Message {
  id: string;
  type: 'query' | 'answer';
  content: string;
  sources?: Source[];
  citations?: Citation[];
  timestamp: number;
}
```

**Decisions Made:**
- **Search API**: SerpAPI (as suggested in assignment description)
- **LLM API**: Anthropic Claude (user preference)
- **Scope for MVP**:
  - Implement Perplexity and Sources tabs (skip Steps tab for now)
  - Include sidebar for new chat functionality
  - Skip suggestion chips (can add later as enhancement)
  - Focus on core search + AI + citations flow

**Dependencies to Install:**
- `@anthropic-ai/sdk` - Official Anthropic SDK for Claude API
- No additional dependencies needed for SerpAPI (can use native fetch)

**Time Estimate:**
- Environment setup & dependencies: 15 min
- API route handlers: 30 min
- SessionStorage management: 20 min
- UI components (Sidebar, SearchInput, etc.): 2 hours
- API integration & citation parsing: 1 hour
- Testing & polish: 45 min
- **Total estimated**: ~4.5-5 hours

**Next Steps:**
1. Install Anthropic SDK
2. Set up API route handlers
3. Implement sessionStorage conversation management
4. Build UI components matching Perplexity design
5. Integrate APIs and test end-to-end flow
