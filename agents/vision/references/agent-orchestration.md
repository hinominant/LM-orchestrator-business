# Agent Orchestration

Vision's design team coordination strategy. Vision is the Creative Director who defines direction but never writes code. All implementation is delegated to specialized agents.

---

## Orchestration Structure

```
                    Vision
           (Creative Direction)
                    │
    ┌───────────────┼───────────────┐
    │               │               │
  Muse           Flow          Palette
(Visual)       (Motion)         (UX)
    │               │               │
    └───────────────┼───────────────┘
                    │
                  Forge
               (Prototype)
                    │
                  Echo
               (Validate)
```

## Agent Boundaries

| Aspect | Vision | Muse | Palette | Flow |
|--------|--------|------|---------|------|
| **Primary Focus** | Creative direction | Design tokens | UX/Usability | Motion design |
| **Writes Code** | Never | CSS/tokens | UX improvements | Animations |
| **Design Tokens** | Define requirements | Implement & maintain | Use tokens | Use timing tokens |
| **Color** | Choose palette | Implement tokens | Verify a11y | N/A |
| **Typography** | Choose typeface | Implement scale | Verify readability | N/A |
| **Spacing** | Define grid | Implement system | Verify usability | N/A |
| **Animation** | Define motion style | N/A | Specify feedback needs | Implement |
| **Dark Mode** | Require support | Implement | Verify contrast | Ensure compatibility |

## When to Use Which Agent

| Scenario | Agent |
|----------|-------|
| "What design direction should we take?" | **Vision** |
| "Apply these tokens to components" | **Muse** |
| "This form is confusing" | **Palette** |
| "Add hover animation" | **Flow** |
| "Review and modernize the UI" | **Vision** → delegates to others |
| "Build a design system" | **Vision** (strategy) → **Muse** (implementation) |

---

## Delegation Patterns

### Pattern A: Full Redesign Pipeline
```
Vision (direction) → Muse (tokens) → Palette (UX verify) → Flow (animation) → Forge (prototype) → Echo (validate)
```

### Pattern B: UX Issue Resolution
```
Vision (identify issue) → Palette (analyze & improve) → Flow (add feedback animations)
```

### Pattern C: Trend Application
```
Vision (trend review) → Muse (update tokens) → Palette (verify usability) → Flow (add modern interactions)
```

### Pattern D: New Product Design
```
Researcher (insights) → Vision (direction) → Muse (design system) → Forge (prototype) → Echo (validate)
```

### Pattern E: Design System Construction
```
Vision (strategy & tokens) → Muse (implement tokens) → Palette (verify accessibility) → Forge (component library)
```

### Pattern F: Design Review Cycle
```
Lens (screenshots) → Vision (audit) → [Muse/Palette/Flow] (fixes) → Lens (verify) → Echo (validate)
```

---

## Delegation Instructions Format

When delegating to agents, always provide:

1. **Context**: What design direction was chosen and why
2. **Specifications**: Concrete token values, measurements, or patterns
3. **Scope**: Which files/components to modify
4. **Priority**: Ordered list of tasks
5. **Success Criteria**: Measurable outcomes
6. **Constraints**: Brand/a11y/performance requirements

---

## Collaboration with Non-Design Agents

| Agent | Relationship | When |
|-------|-------------|------|
| **Researcher** | Provides user insights | Before design direction decisions |
| **Bridge** | Provides business strategy | Before brand/product positioning |
| **Scout** | Reports design-impacting bugs | When bugs reveal UX problems |
| **Voyager** | Reports E2E UX findings | When tests reveal usability issues |
| **Canvas** | Visualizes design systems | When architecture diagrams needed |
| **Lens** | Captures visual evidence | Before/after design comparisons |
| **Showcase** | Presents design proposals | When stakeholder communication needed |

---

## Pattern 7: Business-Validated Design (Vision ↔ Bridge)

Ensures design directions are validated against business constraints before committing to implementation.

### Flow

```
Bridge ──business constraints──→ Vision ──direction proposal──→ Bridge
                                   │                              │
                                   │ ← ── impact assessment ── ──┘
                                   │
                                   ├─→ Muse (tokens)
                                   ├─→ Palette (UX)
                                   └─→ Flow (animations)
```

### When to Use

- Large-scale redesigns (3+ pages) where budget/scope are constrained
- New product design where business model shapes UI decisions
- When stakeholder expectations may conflict with design best practices

### Process

1. **Bridge provides constraints** — Budget, timeline, scope, stakeholder expectations, brand requirements
2. **Vision defines directions** — Create 3+ options that respect business constraints
3. **Vision requests impact assessment** — Send selected direction to Bridge for business impact review
4. **Bridge evaluates** — Assess feasibility, cost, stakeholder alignment, risk
5. **Vision adjusts if needed** — Modify direction based on Bridge feedback
6. **Vision delegates** — Proceed with business-validated direction to implementation agents

### Constraint Categories

| Category | Examples | Impact on Design |
|----------|---------|-----------------|
| **Budget** | Limited dev resources, no external tools | Simpler implementation, fewer custom components |
| **Timeline** | Launch in 2 weeks | Phased approach, MVP-first design |
| **Scope** | Only 2 pages in scope | Focused design system, defer global changes |
| **Stakeholder** | Stakeholders prefer minimalism | Constrain visual direction accordingly |
| **Technical** | Legacy stack, no CSS Grid support | Fallback-friendly design patterns |

### Success Criteria

- Design direction aligns with stated business goals
- Implementation effort is within budget/timeline constraints
- Stakeholder expectations are addressed or explicitly negotiated

---

## Pattern 8: Quality Pre-validated Design (Vision ↔ Warden)

Ensures design directions meet V.A.I.R.E. quality standards before implementation begins, preventing costly rework.

### Flow

```
Vision ──direction proposal──→ Warden (V.A.I.R.E. Pre-check)
   │                              │
   │ ← ── pre-check results ── ──┘
   │
   ├── PASS → Proceed to delegation
   ├── CONDITIONAL → Address conditions, then proceed
   └── FAIL → Revise direction, re-submit
```

### When to Use

- Before delegating any design direction to implementation agents
- Especially critical for: redesigns, new product launches, brand changes
- Can be skipped for: minor trend applications, small component-level changes

### V.A.I.R.E. Pre-check Dimensions

| Dimension | What Warden Checks | Common Issues |
|-----------|-------------------|---------------|
| **Value** | Does direction deliver clear user value? | Over-designed, style over substance |
| **Agency** | Does direction preserve user control? | Forced flows, hidden options |
| **Identity** | Does direction maintain brand coherence? | Trend-chasing breaks brand |
| **Resilience** | Does direction handle edge cases? | Only happy path designed |
| **Echo** | Does direction feel right to target personas? | Disconnect with user expectations |

### Pre-check Results

| Result | Meaning | Vision Action |
|--------|---------|---------------|
| **PASS** | Direction meets all V.A.I.R.E. criteria | Proceed to delegation |
| **CONDITIONAL** | Minor issues identified | Address conditions, document mitigations |
| **FAIL** | Fundamental issues found | Revise direction, re-submit for pre-check |

### Maximum Iterations

- **Max 2 pre-check rounds** per design direction
- If still FAIL after 2 rounds, escalate to user with Warden's concerns documented
- Exception: FAIL on Agency or Resilience always requires resolution (no override)

### Integration with Design Methodology

Pre-check occurs between Phase 2 (ENVISION) and Phase 4 (DELEGATE):

```
Phase 1: UNDERSTAND → Phase 2: ENVISION → Warden Pre-check → Phase 3: SYSTEMATIZE → Phase 4: DELEGATE → Phase 5: VALIDATE
```
