# Claude Code Instructions

## Project Overview
**Hanover Park Take-Home Assignment**: Build a Perplexity.ai clone

### Core Requirements
- **Primary Feature**: Page where users submit a query and receive:
  - Search results
  - AI-generated response based on search results
  - Citations linking to sources
- **Tech Stack**:
  - **Currently Installed**:
    - Next.js 15, React 19, TypeScript 5
    - Tailwind CSS 4
    - lucide-react (icons)
  - **Recommended/Planned** (add as needed):
    - State/Forms: TanStack Query, React Hook Form, Zod validation
    - API Layer: tRPC for type-safe communication (optional)
    - UI Components: Radix UI primitives (accessible, composable)
    - Backend: Supabase (if needed for persistence)
  - **APIs** (To Be Selected):
    - Search API: TBD (SerpAPI or alternative)
    - LLM API: TBD (OpenAI, Anthropic, or alternative)
- **Additional Features**: Developer's choice - add what's most valuable/interesting

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

## Project-Specific Considerations

### API Usage
- **Free tier limitations**: Be mindful when testing to avoid hitting API limits
- **Error handling**: Gracefully handle API failures and rate limits
- **Cost awareness**: Consider caching strategies to minimize API calls

### Search + AI Integration
- Parse search results from API response
- Extract relevant content for LLM context
- Generate AI response using search context
- Include proper citations with links
- Handle edge cases (no results, API errors, etc.)

### Time Management
- Focus on core functionality first (query → search → AI response → citations)
- Choose additional features strategically
- Document time spent and rationale for choices
- Note what you'd improve with more time

## Meta: Project Development History

This project has evolved through multiple iterations:
1. **Initial setup**: Created documentation framework with coding best practices
2. **Take-home context**: Added Perplexity clone requirements and decision-logging framework
3. **Accuracy correction**: Separated "currently installed" vs "planned" dependencies to avoid confusion
4. **Meta-documentation**: Established workflow to track conversation flow and incorporate insights holistically

### Conversation-Driven Development
- This project documents not just code decisions, but also the conversation flow that drives development
- User prompts and requests are tracked in AGENTS_APPENDLOG.md to show reasoning evolution
- CLAUDE.md serves as both instructions and a living record of project methodology
- This meta-layer helps explain decision-making process for the take-home assignment writeup

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
