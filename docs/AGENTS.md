# Agent Workflows

This document describes the AI agent workflows and patterns for this project.

## Project Context: Perplexity Clone

This is a Hanover Park take-home assignment to build a simplified Perplexity.ai clone.

### Core Feature Requirements
1. **Search query input** - User-facing interface for queries
2. **Search API integration** - Fetch real-time results (SerpAPI or alternative)
3. **LLM integration** - Generate AI response using search context
4. **Citations** - Link AI responses to source materials
5. **Additional features** - Developer's choice based on value/interest

### Assignment Constraints
- Use TypeScript (required)
- Choose any framework/libraries
- Be mindful of free API tier limits
- Document all decisions and time allocation
- Explain what you'd do with more time

### Decision Logging Requirements
**Every significant decision must be logged in `docs/AGENTS_APPENDLOG.md`**

Log entries should include:
- **What** was decided (e.g., "Chose Next.js as framework")
- **Why** the decision was made (rationale, trade-offs)
- **When** the decision was made (timestamp)
- **Alternatives** considered
- **Impact** on project (time, complexity, features)

### Meta-Documentation Workflow
**Track the conversation flow that drives development:**

After every significant change:
1. **Append to AGENTS_APPENDLOG.md** with details:
   - What changed (code, docs, decisions)
   - Why the change was made (user prompt, bug fix, refinement)
   - What was learned (insights, patterns, gotchas)
   - Time spent
2. **Incorporate holistically into CLAUDE.md**:
   - Update methodology sections if workflow improved
   - Add to "Meta: Project Development History" section
   - Document patterns that should guide future work
3. **Update README.md periodically**:
   - Extract decision summaries from APPENDLOG
   - Keep tech stack and status current
   - Update time allocation tracking
4. **Refine AGENTS.md** as workflows evolve:
   - Document new patterns discovered
   - Update agent responsibilities if roles shift
   - Improve checklists based on lessons learned

## Core Principles

### Never Hallucinate
- **Always verify before acting** - Don't assume files, functions, or APIs exist
- **Read first, then write** - Use Read tool to check existing code structure
- **Search when uncertain** - Use Grep/Glob to find patterns before assuming
- **Validate assumptions** - If you think something exists, verify it

### Test After Every Change
- Run the application after each modification
- Verify the specific functionality works as expected
- Check for unintended side effects or regressions
- Don't batch changes - test incrementally

### Build Before Committing
- Run `npm run build` (or equivalent) before any commit
- Fix all TypeScript errors - no bypassing with `any`
- Resolve all linter warnings
- Ensure production build succeeds

### Document Every Decision
- Log architectural choices immediately in AGENTS_APPENDLOG.md
- Include rationale and trade-offs
- Update README.md periodically with decision summaries
- Track time spent on each feature/task

## Agent Responsibilities

### Code Development Agent
**Purpose:** Implement features, fix bugs, and refactor code

**Mandatory Workflow:**
1. **Read relevant files** to understand context - never assume structure
2. **Create todo list** for multi-step tasks (use TodoWrite)
3. **Implement ONE change at a time**
4. **Test immediately** - run application and verify it works
5. **Run build** to catch TypeScript/compilation errors
6. **Mark todo complete** only after testing confirms success
7. **Update documentation** if behavior or APIs changed

**Testing Requirements:**
- Test in development mode after each change
- Verify functionality in browser/application
- Check console for errors or warnings
- Run build: `npm run build`
- Only proceed after current change works

### Code Review Agent
**Purpose:** Review code quality, performance, and best practices

**Review Checklist:**
- ✅ TypeScript types properly defined (no `any` without justification)
- ✅ Arrow functions used: `const foo = () => {}`
- ✅ Modern ES6+ syntax (destructuring, spread, optional chaining)
- ✅ No `var` declarations - use `const` or `let`
- ✅ Async/await instead of promise chains
- ✅ No unused dependencies or imports
- ✅ Accessibility considerations (ARIA labels, semantic HTML)
- ✅ Performance optimizations (lazy loading, memoization where appropriate)
- ✅ Error handling is present and meaningful
- ✅ No hallucinated code - all references are verified

### Documentation Agent
**Purpose:** Maintain project documentation and meta-documentation

**Tasks:**
- Update CLAUDE.md with new patterns or guidelines
- Document new components, utilities, and APIs
- Keep README.md current with setup and usage
- **Log ALL significant changes in AGENTS_APPENDLOG.md** (critical for take-home)
- **Track conversation flow**: Document user prompts and how they shaped development
- Periodically summarize decisions from APPENDLOG into README.md
- Incorporate insights holistically into CLAUDE.md
- Track time spent on features for final writeup
- Ensure documentation reflects actual code (no hallucination)

**Append Log Entry Format:**
```markdown
## YYYY-MM-DD HH:MM PT - Entry Title
**Type:** [Decision | Implementation | Documentation | Conversation | Bug Fix]
**Change:** What was changed/decided
**Context:** User prompt or situation that triggered this (if applicable)
**Rationale:** Why this choice was made
**Alternatives Considered:** Other options (if applicable)
**Impact:** Time/complexity/features affected
**Time Spent:** Actual time investment (do NOT hallucinate - ask user if unknown)
**Learnings:** Insights or patterns discovered

IMPORTANT: Timestamps must be accurate and include PT timezone.
Never hallucinate or make up times - if current time is unknown, ask user.
```

**Meta-Documentation Principles:**
- Document not just what was built, but why and how decisions evolved
- Track user prompts that shaped the project direction
- Record methodology improvements discovered during development
- Maintain narrative thread from initial setup through final implementation
- This meta-layer demonstrates thoughtful decision-making for assignment writeup

## Development Patterns

### Before Starting Any Task
1. **Read** CLAUDE.md for project-specific guidelines
2. **Read** this file (AGENTS.md) for workflows
3. **Check** AGENTS_APPENDLOG.md for recent changes
4. **Verify** current state with `git status`
5. **Search** for existing patterns before creating new ones

### Feature Implementation
1. **Understand requirements** - ask clarifying questions if needed
2. **Review existing code** - find similar features to follow patterns
3. **Plan implementation** - use TodoWrite for multi-step tasks
4. **Implement incrementally** - one small change at a time
5. **Test after each step** - verify it works before proceeding
6. **Build to verify** - ensure no TypeScript errors
7. **Update documentation** - reflect new functionality

### Bug Fixes
1. **Reproduce the issue** - verify you can see the problem
2. **Identify root cause** - don't fix symptoms, fix the actual bug
3. **Read relevant code** - understand the context fully
4. **Implement fix** - make minimal, focused change
5. **Test thoroughly** - verify fix works and doesn't break anything
6. **Check for similar issues** - search for same pattern elsewhere
7. **Add preventive measures** - types, validation, etc.

### Refactoring
1. **Understand current behavior** - test before changing
2. **Plan refactoring** - know what you're improving and why
3. **Make incremental changes** - small steps with testing between
4. **Preserve functionality** - behavior shouldn't change
5. **Verify with tests** - ensure nothing broke
6. **Update types** - keep TypeScript definitions accurate

## Code Style Guidelines

### JavaScript/TypeScript
```typescript
// ✅ GOOD - Arrow functions, const, modern syntax
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

const processUser = async (userId: string) => {
  const user = await fetchUser(userId);
  return {
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
    isActive: user.status === 'active',
  };
};

// ❌ BAD - function keyword, var, old syntax
function calculateTotal(items) {
  var sum = 0;
  for (var i = 0; i < items.length; i++) {
    sum = sum + items[i].price;
  }
  return sum;
}
```

### React Components
```typescript
// ✅ GOOD - Functional component, TypeScript, arrow function
interface UserCardProps {
  name: string;
  email: string;
  onEdit?: () => void;
}

const UserCard = ({ name, email, onEdit }: UserCardProps) => {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>{email}</p>
      {onEdit && <button onClick={onEdit}>Edit</button>}
    </div>
  );
};

// ❌ BAD - Class component, no types, old patterns
class UserCard extends React.Component {
  render() {
    return (
      <div className="card">
        <h3>{this.props.name}</h3>
      </div>
    );
  }
}
```

## Agent Collaboration

When multiple agents work on this project:
1. **Always read** CLAUDE.md and AGENTS.md first
2. **Check** AGENTS_APPENDLOG.md for recent changes
3. **Append** significant changes to AGENTS_APPENDLOG.md
4. **Update todo lists** for visibility into progress
5. **Don't duplicate work** - check git status and todos first
6. **Verify before assuming** - no hallucinating about other agents' work

## Common Pitfalls

### Don't Hallucinate
- ❌ Assuming a function exists without reading the file
- ❌ Guessing API endpoints or response structures
- ❌ Inventing configuration options
- ✅ Always verify by reading, grepping, or searching

### Don't Skip Testing
- ❌ Making multiple changes before testing any
- ❌ Assuming code works without running it
- ❌ Ignoring console errors "to fix later"
- ✅ Test each change immediately after making it

### Don't Ignore Build Errors
- ❌ Committing code with TypeScript errors
- ❌ Using `@ts-ignore` without proper justification
- ❌ Leaving broken builds for someone else
- ✅ Run build and fix all errors before committing

### Don't Use Old Syntax
- ❌ Using `var` or `function` declarations
- ❌ Using `.then()` chains instead of async/await
- ❌ Ignoring destructuring opportunities
- ✅ Use modern ES6+ syntax consistently

## Project-Specific Workflows

### Framework/Library Selection
When choosing any framework, library, or tool:
1. **Research options** - Consider 2-3 viable alternatives
2. **Evaluate criteria**:
   - Familiarity (can you implement quickly?)
   - Features (does it support requirements?)
   - TypeScript support (required)
   - Community/docs (can you get help?)
   - Free tier availability (for APIs)
3. **Make decision** with clear rationale
4. **Log in AGENTS_APPENDLOG.md** immediately
5. **Update README.md** with tech stack choices

### API Integration Pattern
For each API (search, LLM):
1. **Select provider** (log decision with rationale)
2. **Set up authentication** (environment variables)
3. **Create typed interfaces** for requests/responses
4. **Implement error handling** (rate limits, failures)
5. **Add response parsing** logic
6. **Test with real API calls** (mind free tier limits!)
7. **Consider caching** to reduce API usage

### Feature Implementation
For each feature (core or additional):
1. **Log feature start** in APPENDLOG with time estimate
2. **Implement incrementally** with testing
3. **Document any decisions** made during implementation
4. **Log feature completion** with actual time spent
5. **Update README.md** status section

## Verification Checklist

Before marking any task as complete:
- [ ] Code verified by reading actual files (not assumed)
- [ ] Change tested in running application
- [ ] Functionality confirmed to work as expected
- [ ] Build passes: `npm run build` succeeds
- [ ] No TypeScript errors or warnings
- [ ] No console errors when testing
- [ ] Code follows style guidelines (arrow functions, modern syntax)
- [ ] Types properly defined
- [ ] Error cases handled
- [ ] Documentation updated if needed
- [ ] No unused imports or variables
- [ ] Todo list updated to reflect completion
- [ ] **Major decisions logged in AGENTS_APPENDLOG.md**
- [ ] **Time spent tracked** (for final writeup)
