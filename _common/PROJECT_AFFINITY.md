# Project Affinity Matrix

Maps each agent to the project types where it provides the most value. Used by Nexus for intelligent routing and team assembly.

---

## Project Type Definitions

| Type | Description | Examples |
|------|-------------|---------|
| **SaaS** | Web application with user accounts, subscriptions, multi-tenant | B2B/B2C platforms, productivity tools |
| **E-commerce** | Online store with cart, checkout, inventory, payments | Shopify stores, marketplace platforms |
| **Dashboard** | Admin panel, analytics, data visualization, CRUD interfaces | CMS admin, monitoring dashboards |
| **CLI** | Command-line tool, terminal utilities | Developer tools, automation scripts |
| **Library** | Reusable package, SDK, framework | npm packages, API clients |
| **API** | Backend API service, microservices | REST/GraphQL backends, webhook services |
| **Mobile** | Mobile application (React Native, responsive-first) | iOS/Android apps, PWAs |
| **Static** | Static site, blog, documentation site | Marketing pages, blogs, docs sites |
| **Data** | Data pipeline, analytics, ETL/ELT | Batch processing, streaming, ML pipelines |

---

## Affinity Levels

| Level | Symbol | Meaning |
|-------|--------|---------|
| **High** | H | Agent is highly relevant; should be included in most workflows |
| **Medium** | M | Agent is useful but not essential; include when scope demands it |
| **Low** | — | Agent has minimal relevance; include only for specific edge cases |

---

## Affinity Matrix

### Universal Agents (High affinity for all project types)

These agents provide value regardless of project type. Nexus should always consider them.

| Agent | Role | Notes |
|-------|------|-------|
| Nexus | Orchestrator | Routes and coordinates all agents |
| Builder | Core implementer | Adapts to any stack |
| Radar | Testing | All languages, all test types |
| Judge | Code review | Language/framework agnostic |
| Zen | Refactoring | Readability improvements everywhere |
| Guardian | Git/PR strategy | All repos need good commits |
| Sherpa | Task breakdown | Complex tasks in any domain |
| Lens | Code investigation | Understands any codebase |
| Scout | Bug investigation | RCA works everywhere |
| Gear | DevOps/CI/CD | Every project needs a pipeline |
| Sweep | Cleanup | Dead code exists everywhere |
| Hone | Quality iteration | PDCA applies to all outputs |
| Ripple | Impact analysis | Change analysis is universal |
| Magi | Decision making | Multi-perspective judgment |
| Atlas | Architecture | Dependency analysis for any project |
| Rewind | Git archaeology | History investigation |
| Horizon | Modernization | Tech debt exists everywhere |
| Cipher | Intent decoding | Requirement clarity for all tasks |
| Rally | Parallel orchestration | Multi-session for any large task |
| Grove | Repo structure | Every project needs good structure |
| Canvas | Visualization | Diagrams for any architecture |
| Architect | Agent design | Meta-level, project-agnostic |

### Luna Original Agents

| Agent | SaaS | E-com | Dash | CLI | Lib | API | Mobile | Static | Data |
|-------|------|-------|------|-----|-----|-----|--------|--------|------|
| CEO | H | H | M | — | — | M | M | — | — |
| Analyst | H | H | H | — | — | M | — | — | H |
| Auditor | H | M | M | M | M | M | M | M | M |

> **Note**: Auditor is **MANDATORY** for LROS projects. For SaaS projects with spec documents, it is HIGH priority. All other project types are MEDIUM.

### Frontend / UX Agents

| Agent | SaaS | E-com | Dash | CLI | Lib | API | Mobile | Static | Data |
|-------|------|-------|------|-----|-----|-----|--------|--------|------|
| Artisan | H | H | H | — | — | — | H | M | — |
| Forge | H | H | H | M | — | M | H | M | — |
| Palette | H | H | H | — | — | — | H | M | — |
| Flow | H | H | H | — | — | — | H | M | — |
| Muse | H | H | H | — | — | — | H | M | — |
| Vision | H | H | H | — | — | — | H | M | — |
| Echo | H | H | H | M | — | — | H | — | — |
| Showcase | H | H | H | — | H | — | M | — | — |

### Growth / Product Agents

| Agent | SaaS | E-com | Dash | CLI | Lib | API | Mobile | Static | Data |
|-------|------|-------|------|-----|-----|-----|--------|--------|------|
| Growth | H | H | M | — | — | — | M | H | — |
| Retain | H | H | M | — | — | — | H | — | — |
| Voice | H | H | M | — | — | — | H | — | — |
| Pulse | H | H | M | — | — | — | H | — | M |
| Experiment | H | H | M | — | — | — | M | — | — |
| Researcher | H | H | M | — | — | — | H | — | — |
| Spark | H | H | M | — | — | — | M | — | — |
| Compete | H | H | — | — | — | — | M | — | — |
| Trace | H | H | M | — | — | — | H | — | — |
| Director | H | H | M | — | — | — | M | — | — |
| Bridge | H | H | M | — | — | H | M | — | — |

### Backend / Infrastructure Agents

| Agent | SaaS | E-com | Dash | CLI | Lib | API | Mobile | Static | Data |
|-------|------|-------|------|-----|-----|-----|--------|--------|------|
| Schema | H | H | H | — | — | M | — | — | H |
| Tuner | H | H | H | — | — | M | — | — | H |
| Gateway | H | M | M | — | M | H | M | — | — |
| Scaffold | H | M | M | — | — | H | — | — | H |
| Stream | M | M | M | — | — | M | — | — | H |
| Bolt | H | H | H | — | — | H | M | — | M |

### Testing / Security Agents

| Agent | SaaS | E-com | Dash | CLI | Lib | API | Mobile | Static | Data |
|-------|------|-------|------|-----|-----|-----|--------|--------|------|
| Voyager | H | H | H | — | — | — | M | — | — |
| Sentinel | H | H | M | — | M | H | M | — | — |
| Probe | H | H | M | — | — | H | — | — | — |
| Canon | H | M | M | — | H | H | — | — | — |
| Specter | H | M | M | — | — | H | — | — | H |
| Warden | H | H | M | — | — | — | H | M | — |

### Documentation / Release Agents

| Agent | SaaS | E-com | Dash | CLI | Lib | API | Mobile | Static | Data |
|-------|------|-------|------|-----|-----|-----|--------|--------|------|
| Quill | M | — | M | M | H | H | — | — | — |
| Scribe | H | M | M | M | H | H | — | — | — |
| Morph | M | — | M | — | M | — | — | M | — |
| Harvest | M | — | — | — | M | M | — | — | — |
| Launch | H | M | — | M | H | H | — | — | — |

### CLI / Tool Agents

| Agent | SaaS | E-com | Dash | CLI | Lib | API | Mobile | Static | Data |
|-------|------|-------|------|-----|-----|-----|--------|--------|------|
| Anvil | — | — | — | H | H | M | — | — | — |
| Reel | — | — | — | H | H | — | — | — | — |

### Specialized Agents

| Agent | SaaS | E-com | Dash | CLI | Lib | API | Mobile | Static | Data |
|-------|------|-------|------|-----|-----|-----|--------|--------|------|
| Polyglot | H | H | M | — | — | — | H | M | — |
| Navigator | H | H | H | — | — | — | — | M | — |
| Triage | H | H | M | — | — | H | — | — | — |
| Arena | H | M | — | M | M | H | — | — | — |

---

## Usage by Nexus

### Team Assembly

When Nexus receives a task and knows the project type, use this matrix to:

1. **Must-include**: Universal agents + agents with H affinity for the project type
2. **Consider**: Agents with M affinity (include if task scope demands it)
3. **Skip**: Agents with — affinity (unless explicitly requested)

### Example: SaaS Authentication Feature

```yaml
Project_Type: SaaS
Task: "Add OAuth2 authentication"

Must-include (H for SaaS):
  - Builder (implementation)
  - Sentinel (security)
  - Radar (testing)
  - Gateway (API design)
  - Schema (user model)
  - CEO (business decision)

Consider (M for SaaS):
  - Quill (API docs)
  - Stream (event logging)

Skip (— for SaaS):
  - Reel (CLI demos)
  - Anvil (CLI tools)
```

### Example: CLI Tool Development

```yaml
Project_Type: CLI
Task: "Build a database migration CLI"

Must-include (H for CLI):
  - Anvil (CLI/TUI)
  - Reel (demo recording)
  - Builder (core logic)

Consider (M for CLI):
  - Forge (prototype)
  - Echo (UX walkthrough)
  - Quill (help text / README)
  - Launch (release management)
  - Arena (multi-engine approach)

Skip (— for CLI):
  - Artisan (frontend)
  - Growth (SEO/CRO)
  - Retain (engagement)
  - CEO (business decision)
```

---

## In-File Format

Each agent's SKILL.md includes a compact `PROJECT_AFFINITY` tag in its CAPABILITIES_SUMMARY HTML comment:

```
PROJECT_AFFINITY: SaaS(H) E-commerce(H) Dashboard(H) Mobile(H) Static(M)
```

For universal agents:
```
PROJECT_AFFINITY: universal
```

Nexus reads these tags during routing to make informed team assembly decisions.
