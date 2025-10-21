# Perplexity Clone - Hanover Park Take-Home

A simplified clone of Perplexity.ai built with TypeScript - allowing users to submit queries and receive AI-generated answers with citations based on real-time search results.

## Assignment Objectives

Build a web application that:
1. Accepts user search queries
2. Fetches real-time search results from search API
3. Generates AI-powered responses using search context
4. Displays results with proper citations and source links
5. (Bonus) Additional features as time permits

## Tech Stack

### Currently Installed
**Frontend Framework:**
- Next.js 15.2.4 (App Router, React Server Components)
- React 19
- TypeScript 5

**Styling & UI:**
- Tailwind CSS 4.1.9
- lucide-react (icons)
- clsx + tailwind-merge (utility functions)

**AI & APIs:**
- @anthropic-ai/sdk v0.67.0 (Anthropic Claude API)
- SerpAPI (web search results via HTTP API)

### Architecture
**State Management:**
- React hooks for local component state
- sessionStorage for conversation persistence (no external state library needed)

**Data Flow:**
- Client-side React components
- Next.js API routes for backend integration
- sessionStorage for conversation history

## Project Status

✅ **Status**: Core implementation complete

### Current Phase
- [x] Project setup and framework selection (Next.js + React + TypeScript + Tailwind)
- [x] API provider selection (SerpAPI + Anthropic Claude)
- [x] Core search + AI integration (API routes implemented)
- [x] UI implementation (Perplexity-style interface)
- [x] Citations and source linking
- [x] Conversation management (sessionStorage)
- [ ] Testing and polish
- [ ] Additional features (optional enhancements)

## Architecture Decisions

### Framework & Core Tech (2025-10-20)
- **Next.js 15** with App Router and React Server Components for modern, performant architecture
- **React 19** for latest features and concurrent rendering
- **TypeScript 5** for type safety (required by assignment)
- **Tailwind CSS 4** for rapid, consistent styling
- **tRPC + TanStack Query** for type-safe, efficient API communication
- **Supabase** for backend services (database, auth if needed)

**Rationale**: Proven stack with excellent TypeScript support, modern patterns, and rapid development capability. Minimizes setup time while maximizing code quality.

### Current Setup Status
- ✅ **Base Framework**: Next.js 15 + React 19 + TypeScript 5
- ✅ **Styling**: Tailwind CSS 4 with minimal configuration
- ✅ **Icons**: lucide-react
- ✅ **Build**: Successfully builds and runs (`npm run build` passes)
- ⏳ **Additional Dependencies**: To be added as needed based on implementation approach

### API Providers (Selected)

**Search API: SerpAPI**
- Provides Google search results via API
- Free tier: 100 searches/month
- Good documentation and TypeScript support
- Rationale: Mentioned in assignment description, reliable results

**LLM API: Anthropic Claude**
- Claude 3.5 Sonnet for high-quality responses
- Excellent at following citation instructions
- Strong context understanding for search results
- Rationale: Better citation accuracy than alternatives, good free tier

### Implementation Architecture

**Components:**
- `Sidebar` - Navigation and new chat functionality
- `SearchInput` - Query input with loading states
- `ConversationView` - Main conversation container
- `SourceCard` - Individual search result display
- `TabNavigation` - Perplexity/Sources/Steps tabs
- `AnswerDisplay` - AI response with inline citations

**API Routes:**
- `/api/search` - Fetches search results from SerpAPI
- `/api/generate` - Generates AI responses with Claude

**Data Management:**
- sessionStorage for conversation persistence
- No database required for MVP
- Conversation history maintained client-side

See `docs/AGENTS_APPENDLOG.md` for complete decision history and time tracking.

## Development

### Setup Instructions

```bash
# Navigate to frontend directory
cd apps/frontend

# Install dependencies (already done)
npm install

# Run development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

### Environment Variables

Copy `.env.example` to `.env.local` and add your API keys:

```bash
cp .env.example .env.local
```

Then add your API keys to `.env.local`:
- `ANTHROPIC_API_KEY` - Your Anthropic API key from https://console.anthropic.com/
- `SERPAPI_API_KEY` - Your SerpAPI key from https://serpapi.com/

**Required API Keys:**
1. **Anthropic API Key**: Sign up at https://console.anthropic.com/ (free tier available)
2. **SerpAPI Key**: Sign up at https://serpapi.com/ (100 free searches/month)

## Time Allocation

**Total Time Budget**: _TBD_

_Time spent on each phase will be documented here._

### What Would Be Improved With More Time

_This section will be updated as the project progresses._

## Documentation

This project maintains comprehensive documentation at multiple levels:

- **CLAUDE.md** - Instructions for AI agents working on this project (living document, updated with learnings)
- **docs/AGENTS.md** - Agent workflows and development patterns (evolves as methodology improves)
- **docs/AGENTS_APPENDLOG.md** - Complete decision and activity log (append-only, chronological narrative)

### Meta-Documentation Approach

This project uses a **conversation-driven development** methodology:
- Every significant change is logged in AGENTS_APPENDLOG.md with full context
- User prompts and agent responses are tracked to show decision evolution
- Insights are incorporated holistically into CLAUDE.md and AGENTS.md
- This creates a transparent narrative of the development process for the assignment writeup

**Documentation Workflow:**
1. Make a change → 2. Append to log → 3. Update summaries → 4. Incorporate insights → 5. Refine workflows

## License

MIT
