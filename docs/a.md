## Claude Prompts

Leverage AI coding tools effectively with structured prompting patterns. Use these templates when working with Claude to maximize code quality and architecture.

### 1️⃣ Complete Application from Scratch

Think like a senior full-stack engineer developing a **complete, production-ready application.**

**Process:**
- First, design the system architecture
- Then develop the minimal but scalable version

**Deliverables:**
- ✅ Architecture diagram
- ✅ File structure
- ✅ Database schema
- ✅ API endpoints
- ✅ UI architecture
- ✅ Complete, scalable code

**Best for:** Building new projects with startup MVP mindset and scalability considerations.

### 2️⃣ Codebase Understanding and Refactoring

**Role:** Think like a senior engineer who just joined a large, unfamiliar codebase.

**Process:**
- Analyze the entire architecture and data flow
- Identify structural problems, duplicated code, performance bottlenecks, maintainability risks

**Deliverables:**
- ✅ Architecture summary
- ✅ Problem areas with severity levels
- ✅ Refactoring strategies
- ✅ Improved code

**Key Point:** Functionality remains unchanged — quality is enhanced.

### 3️⃣ Senior Debugging Engineer

**Role:** Think like a senior debugging engineer investigating bugs in production.

**Process:**
- Carefully analyze the code
- Think step by step through execution flow
- Find the root cause with edge cases
- Propose robust solutions

**Deliverables:**
- ✅ Code functionality explanation
- ✅ Problem diagnosis
- ✅ Why it fails
- ✅ Edge case analysis
- ✅ Fixed production-ready code

### 4️⃣ System Design + Implementation

**Role:** Think like a senior systems architect.

**Process:**
- Design a scalable system for the product
- Develop the minimal production version

**Deliverables:**
- ✅ System architecture
- ✅ Component structure
- ✅ Data flow diagrams
- ✅ API design specifications
- ✅ Database schema
- ✅ Caching strategy
- ✅ Implementation code

### 5️⃣ Performance Optimization Tips

**Role:** Think like a performance engineer optimizing for production.

**Goals:**
- ⚡ Minimize latency
- 💾 Reduce memory usage
- 📈 Improve scalability

**Process:**
- Find performance bottlenecks
- Identify inefficient logic
- Remove unnecessary operations

**Deliverables:**
- ✅ Performance issues identified
- ✅ Optimization strategies
- ✅ Improved, benchmarked code

### 6️⃣ Clean Architecture Rebuild

**Role:** Think like a senior engineer converting code to clean architecture patterns.

**Goals:**
- 🏗️ Separate concerns
- 🧩 Increase modularity
- 🔗 Reduce coupling

**Deliverables:**
- ✅ New folder structure
- ✅ Architecture documentation
- ✅ Refactored code

**Key Point:** Behavior remains unchanged — structure is improved.

### 7️⃣ Claude Multi-Agent Workflow

**Setup:** You are 4 collaborating agents working on the same task.

**Agents & Roles:**
| Agent | Responsibility |
|-------|-----------------|
| 🏛️ **Architect** | Design system architecture |
| 🔧 **Engineer** | Develop implementation |
| 👀 **Reviewer** | Quality control & standards |
| ⚡ **Optimizer** | Performance improvement |

**Deliverables:**
- ✅ Architecture & design
- ✅ Complete implementation
- ✅ Review feedback & improvements
- ✅ Final optimized version

### 8️⃣ Production-Level UI Component Builder

**Role:** Think like a senior frontend engineer building reusable components.

**Requirements:**
- ✅ Reusable across the application
- ✅ Accessible (WCAG compliant)
- ✅ Production-ready

**Considerations:**
- 📍 Loading states and error handling
- 🎯 Edge cases and boundary conditions
- 📱 Responsive design patterns
- ♿ Accessibility standards

**Deliverables:**
- ✅ Component architecture
- ✅ Props design & typing
- ✅ Implementation with examples
- ✅ Usage documentation

### 🔑 Key Effective AI Engineering Pattern

Modern AI-assisted development is a **3-step system**:

#### Step 1: Create Mental Model
Have Claude analyze your entire repository and generate a **detailed architecture document** with diagrams (Mermaid). This establishes deep context before any coding.

```
Prompt: "Analyze this codebase and provide:
- System architecture overview
- Data flow diagrams
- Key components and dependencies
- Technology stack summary"
```

#### Step 2: Define Requirements with PRD
Instead of immediately coding, ask Claude to act as **Product Manager** and produce a structured PRD with **user stories** and **acceptance criteria** based on the existing system.

```
Prompt: "Based on the architecture, create a PRD for [feature]:
- User stories
- Acceptance criteria
- Technical requirements
- Integration points"
```

#### Step 3: Iteratively Implement Using Context
Instruct Claude to build the feature **step-by-step** (MVP first), referencing the architecture doc and PRD as guardrails, updating progress continuously.

```
Prompt: "Using the architecture and PRD provided:
1. Outline the implementation plan
2. Build the minimal viable version
3. Handle edge cases
4. Add comprehensive tests"
```

**Why This Works:**
- 🎯 Structured context → Better code decisions
- 📊 PRD alignment → No scope creep
- 🔄 Iterative approach → Lower risk of major rewrites
