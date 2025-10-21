# Claude Code Instructions

## Project Overview
**Hanover Park Take-Home Assignment**: Build a Perplexity.ai clone

**Status**: ✅ **COMPLETE** - Production-ready MVP with streaming, conversation threading, and professional UX

### Core Requirements (All Completed)
- ✅ **Primary Feature**: Page where users submit a query and receive:
  - ✅ Search results (streaming progressively)
  - ✅ AI-generated response based on search results (streaming word-by-word)
  - ✅ Citations linking to sources
- ✅ **Tech Stack Finalized**:
  - **Core Dependencies**:
    - Next.js 15.2.4, React 19, TypeScript 5
    - Tailwind CSS 4.1.9
    - lucide-react 0.454.0 (icons)
    - clsx 2.1.1, tailwind-merge 2.5.5 (styling utilities)
  - **APIs (Production)**:
    - Search API: SerpAPI 2.2.1 (official JavaScript client)
    - LLM API: Anthropic Claude Sonnet 4.5 (@anthropic-ai/sdk 0.67.0)
  - **State Management**: sessionStorage (vanilla React hooks, no Redux/Zustand)
  - **Not Used** (intentionally kept minimal):
    - ❌ TanStack Query (not needed - simple fetch with streaming)
    - ❌ tRPC (API routes are simple enough)
    - ❌ React Hook Form, Zod (single input, no complex validation)
    - ❌ Radix UI (custom components sufficient)
    - ❌ Supabase (sessionStorage handles MVP persistence)
- ✅ **Additional Features Implemented**:
  - Conversation threading (multi-turn Q&A)
  - Progressive streaming (search results + AI answers)
  - Tab navigation (Simplexity/Sources views)
  - Loading states with stopwatch
  - Auto-scroll to latest query
  - Enhanced source card styling
  - Fixed follow-up input

### Assignment Philosophy
- Open-book: Use any tools, AI, libraries normally used
- Intentionally vague specification: Exercise best judgment
- Document decisions and rationale
- Explain time allocation and future improvements

### Decision Logging & Meta-Documentation
- **Running log**: `docs/AGENTS_APPENDLOG.md` - append all decisions as they're made
- **Periodic summaries**: Update `README.md` with holistic overview
- **Log everything**: Architecture choices, library selections, trade-offs, time allocation
- **Meta-documentation**: Track the conversation flow itself - what prompts were given, what changes were requested, how the project evolved
- **Holistic incorporation**: After appending to AGENTS_APPENDLOG.md, incorporate key insights into CLAUDE.md for future reference
- **Accurate timestamps**: Use format `YYYY-MM-DD HH:MM PT` - NEVER hallucinate times (ask user for current time if needed)
- **Workflow**:
  1. Make a change (code, documentation, decisions)
  2. Append details to AGENTS_APPENDLOG.md with accurate timestamp (PT timezone)
  3. Update README.md with holistic summaries periodically
  4. Incorporate important patterns/learnings into CLAUDE.md
  5. Keep AGENTS.md updated with workflow refinements

## Development Guidelines

### Code Quality Standards
- **Always test after every change** - Run the application and verify functionality works
- **Build before committing** - Ensure `npm run build` passes without errors
- **Fix all TypeScript errors** - No ignoring type errors or using `any` without justification
- **Never hallucinate** - Don't assume files, functions, or APIs exist. Read and verify first
- **Read before writing** - Always use Read tool to check existing code before making changes

### JavaScript/TypeScript Style
- Use **TypeScript** for all new code with proper type definitions
- Use **arrow functions** for all function expressions: `const foo = () => {}`
- Use **modern ES6+ syntax**:
  - Destructuring: `const { foo, bar } = obj`
  - Template literals: `` `Hello ${name}` ``
  - Spread operator: `{ ...obj, newProp: value }`
  - Optional chaining: `obj?.property?.nested`
  - Nullish coalescing: `value ?? defaultValue`
- Prefer `const` over `let`, never use `var`
- Use async/await instead of promise chains
- Prefer functional array methods: `map`, `filter`, `reduce`

### React Best Practices
- Use **functional components** with hooks only
- Follow React Server Components patterns where possible
- Use `"use client"` directive only when necessary (client-side interactivity required)
- Properly handle loading and error states
- Clean up effects with return functions
- Use proper dependency arrays for hooks

### Component Development
- Place reusable UI components in appropriate directories
- Define TypeScript interfaces for all props
- Use descriptive, semantic names
- Keep components focused and single-purpose
- Follow accessibility best practices (ARIA labels, semantic HTML)

### Code Organization
- One component per file (except small, tightly-coupled helpers)
- Import order: React, external libraries, internal modules, types, styles
- Export components as default or named exports consistently
- Keep utility functions in separate modules

### Testing Workflow
1. Make a change
2. **Test immediately** in the browser/application
3. Verify the specific functionality works
4. Check for unintended side effects
5. Run build to catch type errors: `npm run build`
6. Only proceed to next change after current one works

### Error Handling
- Handle errors gracefully with try/catch
- Provide meaningful error messages
- Log errors appropriately for debugging
- Don't silently swallow errors

### Performance Considerations
- Lazy load components when appropriate
- Memoize expensive computations
- Avoid unnecessary re-renders
- Optimize images and assets
- Monitor bundle size

### Git Workflow
- Make small, focused commits
- Write clear, descriptive commit messages
- Don't commit untested code
- Keep commits atomic and reversible

## Common Pitfalls to Avoid
- ❌ Don't assume code exists - always verify by reading files
- ❌ Don't skip testing after changes
- ❌ Don't ignore TypeScript errors
- ❌ Don't use outdated JavaScript syntax (var, function declarations, etc.)
- ❌ Don't make large, multi-purpose commits
- ❌ Don't commit broken builds
- ❌ Don't duplicate code - create reusable utilities instead

## Current Architecture (Production)

### Component Structure
```
apps/frontend/
├── app/
│   ├── page.tsx                    # Main conversation UI with streaming (204 lines)
│   ├── layout.tsx                  # Root layout with metadata
│   ├── components/
│   │   ├── Sidebar.tsx            # Navigation + New Chat button
│   │   ├── SearchInput.tsx        # Auto-resize textarea with submit
│   │   ├── SourceCard.tsx         # Source display (reusable in 2 layouts)
│   │   ├── TabNavigation.tsx      # Simplexity/Sources tab switcher
│   │   └── AnswerDisplay.tsx      # Markdown answer with clickable citations
│   └── api/
│       ├── search/route.ts        # SerpAPI streaming (ReadableStream + 100ms delay)
│       └── generate/route.ts      # Claude streaming (native SDK streaming)
├── lib/
│   ├── types.ts                   # All TypeScript interfaces (117 lines)
│   └── conversationStore.ts       # sessionStorage CRUD operations (158 lines)
```

### Data Flow (Streaming Architecture)
```
1. User Query → SearchInput component
   ↓
2. Search API Call → /api/search (streaming)
   ├─ SerpAPI returns 10 results
   ├─ Server streams with 100ms delay between results
   ├─ Frontend reads stream progressively
   └─ Source cards appear in cascading animation
   ↓
3. AI Generation → /api/generate (streaming)
   ├─ Claude receives search context + conversation history
   ├─ Streams text chunks as generated
   ├─ Frontend appends chunks to answer in real-time
   └─ Citations extracted after completion
   ↓
4. Persistence → sessionStorage
   ├─ Messages saved as Q&A pairs
   ├─ Survives page refresh
   └─ Cleared on tab close
   ↓
5. UI Updates
   ├─ Auto-scroll to latest query (useRef + useEffect)
   ├─ Loading state with stopwatch (setInterval)
   └─ Fixed follow-up input (always visible)
```

### Streaming Protocol (Line-Delimited JSON)
**Message Types:**
```typescript
// Search results stream
{ type: 'result', data: SearchResult }     // Individual result
{ type: 'done' }                           // Stream complete

// AI answer stream
{ type: 'text', data: string }             // Text chunk
{ type: 'citations', data: Citation[] }    // Final citations
{ type: 'done' }                           // Stream complete
```

**Implementation Pattern:**
```typescript
// Server: Create readable stream
const stream = new ReadableStream({
  async start(controller) {
    for (const item of items) {
      const chunk = JSON.stringify({ type: 'result', data: item }) + '\n';
      controller.enqueue(encoder.encode(chunk));
      await new Promise(resolve => setTimeout(resolve, 100)); // Delay
    }
    controller.enqueue(encoder.encode(JSON.stringify({ type: 'done' }) + '\n'));
    controller.close();
  }
});

// Client: Read stream progressively
const reader = response.body?.getReader();
let buffer = '';
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // Keep incomplete line

  for (const line of lines) {
    if (line.trim()) {
      const message = JSON.parse(line);
      // Handle message...
    }
  }
}
```

### Key Implementation Patterns

**Streaming Best Practices (Discovered):**
- **100ms delay**: Perfect balance for cascading (not too fast, not too slow)
- **Buffer management**: Always keep incomplete line when splitting by `\n`
- **Error handling**: Try-catch around JSON.parse (network can fragment chunks)
- **Completion signal**: Always send `{ type: 'done' }` for clean closure
- **Progressive updates**: React setState on each chunk (acceptable performance)

**React Patterns:**
- **useRef for intervals**: Prevents unnecessary re-renders vs useState
- **useEffect cleanup**: Always return cleanup function for intervals/subscriptions
- **Conditional rendering**: `activeTab === 'simplexity' || !isLatest` for tab logic
- **Component reusability**: Same `SourceCard` in horizontal scroll and grid layouts

**TypeScript Safety:**
- All streaming code fully typed
- Minimal `any` usage (only `citations` array - dynamic data acceptable)
- Proper interface definitions for all API requests/responses
- ReadableStream and event types from official SDKs

## Project-Specific Considerations

### API Usage (Production Metrics)
- **SerpAPI Free Tier**: 100 searches/month
- **Claude Sonnet 4.5 Cost**: ~$0.015 per query (2000 input + 500 output tokens)
- **Total Cost per Q&A**: ~$0.025 (SerpAPI ~$0.01 + Claude ~$0.015)
- **Error Handling**: Graceful fallbacks with user-friendly messages
- **No Caching**: MVP doesn't cache results (future enhancement to reduce costs)
- **Rate Limiting**: Not implemented (low usage for demo, would add for production)

### Conversation Management
- **Storage**: sessionStorage (persists across page refresh, cleared on tab close)
- **Structure**: Messages array with alternating query/answer types
- **Q&A Pairing**: Groups messages into pairs for display
- **Threading**: Display all historical pairs, tab navigation only for latest
- **Auto-scroll**: `scrollIntoView({ behavior: 'smooth', block: 'start' })` with `scroll-mt-12` offset
- **Fixed Input**: `fixed bottom-0` with gradient overlay (`bg-gradient-to-t from-zinc-950`)

### Time Allocation (Final Metrics)
**Total: ~5 hours 5 minutes**
- Planning & Architecture: 15 min
- Core Implementation: 45 min
- Debugging (file locations, module resolution): 20 min
- API Migration (switch to serpapi client): 10 min
- UI Polish (cursor-pointer, shadows): 5 min
- Branding (Perplexity → Simplexity rename): 10 min
- Conversation Threading: 30 min
- Model Upgrade & Testing: 50 min
- Streaming Implementation (search + AI): 2 hours 20 min

### Future Enhancements (Not Implemented)
**Would Add with More Time:**
1. **Performance**: Debounce React re-renders during fast streaming
2. **Caching**: Cache search results to reduce API costs
3. **Conversation History**: Sidebar with list of past searches
4. **Export**: Download conversation as markdown
5. **Retry Logic**: Auto-retry failed streams
6. **Progress Indicators**: Show % complete during streaming
7. **Mobile Responsive**: Optimize for mobile viewports
8. **Unit Tests**: Test streaming protocol, state management, components
9. **Error Recovery**: Better error messages + retry buttons
10. **Keyboard Shortcuts**: Cmd+K for new chat, Cmd+Enter to submit

## Meta: Project Development History

This project has evolved through multiple sessions (2025-10-20):

**Session 1: Foundation (18:00-18:19 PT)**
1. **Initial setup**: Created documentation framework with coding best practices
2. **Take-home context**: Added Perplexity clone requirements and decision-logging framework
3. **Architecture planning**: Analyzed Perplexity screenshots, designed component structure
4. **Core implementation**: Built complete working app in 20 minutes
   - Dependencies: Installed @anthropic-ai/sdk, serpapi
   - Components: Created all 5 UI components + 2 API routes
   - State: Implemented sessionStorage utilities
   - Fixed: File location confusion, lucide-react transpiling, env vars

**Session 2: Polish & Enhancement (18:26-18:44 PT)**
5. **UI improvements**: Added cursor-pointer to buttons, improved source card shadows
6. **Branding**: Renamed all "Perplexity" references to "Simplexity" (package, types, variables, storage keys)
7. **Conversation threading**: Implemented Q&A pair display, auto-scroll, fixed input
8. **Model upgrade**: Switched from deprecated Claude 3.5 Sonnet to Claude Sonnet 4.5
9. **End-to-end testing**: Verified full flow with screenshots

**Session 3: Streaming Implementation (19:00-19:20 PT)**
10. **Search streaming**: Progressive source card display with 100ms cascading delay
11. **AI streaming**: Word-by-word answer appearance using Claude native streaming
12. **Loading enhancements**: Added stopwatch timer, improved skeleton UI
13. **Visual documentation**: Captured 5 screenshots demonstrating streaming in action
14. **Comprehensive logging**: Documented all changes in AGENTS_APPENDLOG.md

### Conversation-Driven Development
- This project documents not just code decisions, but also the conversation flow that drives development
- User prompts and requests are tracked in AGENTS_APPENDLOG.md to show reasoning evolution
- CLAUDE.md serves as both instructions and a living record of project methodology
- This meta-layer helps explain decision-making process for the take-home assignment writeup

### Implementation Insights (2025-10-20)

**What Worked Well:**
1. **Upfront Planning**: Screenshot analysis and architecture planning prevented major rework
2. **Incremental Development**: Building one component at a time made debugging easier
3. **Type-First Approach**: Creating comprehensive TypeScript types first provided structure
4. **Official SDKs**: Using `@anthropic-ai/sdk` and `serpapi` packages improved DX over raw fetch
5. **Real-time Debugging**: Using BashOutput to check dev server logs caught errors quickly
6. **Streaming Protocol**: Line-delimited JSON proved simple, debuggable, and extensible
7. **Progressive Enhancement**: Starting with batch display, then adding streaming felt natural

**Challenges Encountered:**
1. **Directory Confusion**: Created files in wrong location initially (root vs apps/frontend)
2. **Module Resolution**: Next.js 15 + React 19 required explicit transpiling for lucide-react
3. **Environment Variables**: Monorepo structure needed .env in package directory, not root
4. **Hydration Issues**: sessionStorage access during SSR caused initial errors (resolved with useEffect)
5. **Buffer Management**: Learned to keep incomplete lines when splitting stream by newline
6. **Optimal Delay Timing**: Experimented to find 100ms as sweet spot for cascading

**Development Patterns Discovered:**
- **Minimal Dependencies**: Avoided Redux/Zustand/TanStack Query - vanilla React hooks sufficient
- **API Routes as Backend**: Next.js API routes eliminate need for separate backend server
- **sessionStorage for State**: No database needed for MVP - client-side storage works well
- **Component Composition**: Small, focused components easier to debug than monolithic views
- **Streaming Architecture**: ReadableStream + getReader() pattern works brilliantly for real-time UX
- **useRef for Timers**: Prevents re-render issues that useState would cause with intervals
- **Component Reusability**: Same component (SourceCard) adapts to different container layouts

**Streaming Patterns Learned:**
- **100ms Delay**: Perfect for human perception (visible cascade, not sluggish)
- **Buffer Split Logic**: `lines.pop()` keeps incomplete line for next iteration
- **Error Resilience**: Try-catch around JSON.parse handles network fragmentation
- **Completion Signals**: Always send explicit `{ type: 'done' }` to close cleanly
- **Progressive Updates**: React handles frequent setState surprisingly well
- **No Artificial Delay for AI**: Claude's natural generation rhythm is ideal

**User-Agent Collaboration:**
- **Iterative Refinement**: User provided visual reference (screenshots), then corrected technical choice (serpapi package)
- **Error-Driven Debugging**: User reported runtime errors, enabling targeted fixes
- **Preference Communication**: Clear choices (Claude over GPT, serpapi client over fetch) guided implementation
- **UX Requests**: User identified need for streaming, stopwatch, better shadows - all improved perceived performance
- **Visual Validation**: Screenshots proved functionality, caught issues early

**Time Management Learnings:**
- Initial estimate: 4.5-5 hours for basic app
- Actual total: ~5 hours for **polished, production-ready app with streaming**
- Core implementation: 20 minutes (excellent planning ROI)
- Streaming added: 2.5 hours (complex but high-value feature)
- **Lesson**: Detailed planning + incremental testing + good docs = efficient development

**Code Quality Observations:**
- TypeScript caught potential bugs during development (type mismatches in API responses)
- Build-first approach revealed issues before runtime (lucide-react, missing types)
- Component isolation made testing in browser straightforward
- Streaming code fully typed (ReadableStream, event types from SDKs)
- **Future improvement**: Unit tests would codify streaming protocol, state management

## Verification Checklist
Before considering any task complete:
- [ ] Code tested in running application
- [ ] TypeScript errors resolved
- [ ] Build passes successfully
- [ ] No console errors or warnings
- [ ] Code follows style guidelines
- [ ] Types properly defined
- [ ] Error cases handled
- [ ] No unused imports or variables
- [ ] **Decision logged in AGENTS_APPENDLOG.md** (if architectural/significant)
- [ ] **Holistic insights incorporated into CLAUDE.md** (if methodology/pattern learned)
