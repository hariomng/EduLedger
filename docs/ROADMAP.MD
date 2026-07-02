# EduLedger Development Roadmap

EduLedger is a Web3‑enabled education marketplace where students mint notes, lab reports, and study guides as NFTs on the Celo blockchain. Creators earn when peers access or purchase their work, with rewards paid in crypto.

## Phases & Timeline

### Phase 1: MVP Completion
Focus: complete the core content cycle (upload → mint → purchase → download). Secondary/parallel items deferred.

#### 1.1 User Authentication & Security (🔴 Critical)
- Persistent sessions & token renewal
- Email verification flow
- Web3 signature–based login
- JWT creation/validation and refresh
- Rate limiting on sensitive APIs
- CSRF protection middleware
- Input validation/sanitization (server + client)

#### 1.2 Purchase & Payment System (🔴 Critical)
- Token‑based payment function in smart contract
- Fee‑split (platform 10 %) and creator balance tracking
- Transaction fee handling & gas estimation
- MongoDB models: purchase, transaction, payment history
- API endpoints for purchase, confirmation, history
- Transaction receipts, status polling
- Refund logic deferred (atomic blockchain txs)

#### 1.3 Material Metadata & Storage (🔴 Critical)
- Schema expansion: subject, level, tags, description, version
- Categorization: faculty, department, subject hierarchy
- File‑type validation, size limits, virus scanning
- Versioning support (replace, archive old versions)
- Frontend form fields and filters updated

#### 1.4 User Profile System (🟠 High)
- Complete profile page with bio and avatar upload
- Portfolio of published materials
- Display statistics: earnings, views, downloads, sales
- Edit profile & preferences
- Privacy settings (public/hidden profile)

#### 1.5 Search & Discovery (🟠 High)
- Full‑text search engine (MongoDB text indexes or Elastic)
- Filters: category, subject, level, price, date
- Sorting: popularity, price, recent, ratings
- Trending algorithm (views/downloads over time)
- Recommendations based on user history
- Search analytics dashboard (API usage, queries)

#### 1.6 Campus Ambassador & Community (⚪ Medium)
- Define ambassador tiers and incentives
- Marketing materials and onboarding docs
- Ambassador dashboard for referrals & stats
- Student‑union partnership templates
- Referral rewards (crypto or platform credits)
- Community onboarding flow separate from MVP launch

### Phase 2: Enhanced Features & UX
Further improve retention and engagement.

#### 2.1 Social Features & Community Engagement
- Follower/following relationships
- Ratings and reviews on materials
- Verification badges for trusted creators
- Comments and discussion threads
- Content moderation tools (reports, takedowns)

#### 2.2 Advanced Material Management
- Bulk upload and batch editing
- Drafts vs published states
- Collaborative authorship & royalty splits
- Material previews (limited pages)
- Download history for buyers
- License/usage rights selection

#### 2.3 Analytics & Dashboard
- Creator metrics (earnings trend, views, downloads)
- Material performance charts
- User engagement analytics and exports
- A/B testing framework in frontend
- Behavioral event tracking

#### 2.4 Smart Contract Enhancements
- Royalty support for secondary sales
- Multi‑creator payment splits
- Tiered licenses (basic/premium)
- Time‑locked or gated content release

### Phase 3: Scalability & Optimization

#### 3.1 Performance & Infrastructure
- Database indexing and query optimization
- Redis caching for sessions and hot data
- CDN for static and uploaded files
- API response compression & rate limiting
- Image/video optimization and lazy loading
- Code splitting, tree‑shaking, bundle analysis

#### 3.2 Testing & QA
- Jest unit tests and coverage
- Integration tests for API and DB
- E2E tests with Playwright or Cypress
- Smart contract test suite and formal verification
- Load testing (k6, Gatling) and monitoring
- Security pen‑testing and vulnerability scans
- Accessibility (WCAG 2.1) compliance checks

#### 3.3 Blockchain Optimization
- Prepare for Celo Mainnet migration
- Gas optimization in contracts
- Batch transaction support for bulk operations
- Event indexing via The Graph or subgraph
- Explore Layer‑2 or cross‑chain options

### Phase 4: Enterprise & Advanced Features

#### 4.1 Institutional Features
- University/institution profiles and verification
- Department‑level collections and admin tools
- Bulk licensing/government sales
- Custom branding, LMS (Blackboard/Canvas) integration

#### 4.2 Payment Gateway Expansion
- Accept stablecoins (USDC, DAI) and fiat via Stripe
- Multi‑currency support and conversion
- Creator withdrawal system with tax reports
- Subscription models and membership tiers

#### 4.3 API & Developer Tools
- Public REST API docs and SDKs
- Webhook support for events (purchase, upload)
- Developer dashboard with API keys and rate limits

---

## Dependency Chart

```
User Authentication (Phase 1.1) ✓ CRITICAL - Must complete first
    ├─ JWT Token System
    ├─ Session Management
    ├─ Email Verification
    └─ Rate Limiting

Payment System (Phase 1.2) - Depends on User Authentication
    ├─ Smart Contract Updates (10% fee)
    ├─ API Routes Implementation
    ├─ Transaction Database Schema
    └─ Creator Reward Distribution

Material Metadata & Storage Enhancement (Phase 1.3) - Depends on User Authentication
    ├─ Metadata Schema (Faculty, Department, Subject)
    ├─ File Validation
    ├─ Upload API Routes

User Profile System (Phase 1.4) - Depends on User Authentication
    ├─ Profile page
    ├─ Bio/avatar support
    ├─ Creator portfolio view
    ├─ User statistics

Campus Ambassador Program (Phase 1.6) - Depends on User Authentication & User Profile System
    ├─ Ambassador Dashboard
    ├─ Referral Tracking
    └─ Incentive System

Search & Discovery (Phase 1.5) - Depends on Material Metadata & Storage Enhancement
    ├─ Database Indexing
    ├─ Full-text Search
    ├─ Filter Logic (by category, subject, level)
    └─ Trending Algorithm

Social Features (Phase 2.1) - Dependent on User Authentication & Profiles
    ├─ Follower/Following System
    ├─ Ratings & Reviews
    └─ Community Moderation
```

---

## Technology Stack

### Current Stack
- **Frontend:** React 19, Next.js 16, Tailwind CSS 4
- **State Management:** TanStack Query, Wagmi
- **Backend:** Express.js
- **Database:** MongoDB
- **Blockchain:** Celo, Solidity
- **Web3:** Wagmi, Viem
- **Storage:** Pinata IPFS
- **Styling:** Tailwind CSS, Framer Motion
- **Package Manager:** npm

### Planned Additions
- Jest (testing)
- Playwright/Cypress (E2E testing)
- The Graph (blockchain indexing)
- Redis (caching)
- Docker (containerization)
- GitHub Actions (CI/CD)

---

## Success Metrics

### User Adoption
- [ ] 500+ registered users by end of Phase 1
- [ ] 100+ materials listed on marketplace
- [ ] 50+ completed transactions
- [ ] 10+ campus ambassadors actively recruiting
- [ ] 70%+ user retention rate (30-day)
- [ ] 80%+ of uploaded materials monetized

### Platform Performance
- [ ] < 2 second page load time
- [ ] 99.5% API uptime
- [ ] < 500ms average response time
- [ ] 99% smart contract transaction success rate

### Community Health
- [ ] Average 4+ star material rating
- [ ] User engagement rate > 60%
- [ ] Creator satisfaction score > 8/10
- [ ] Zero critical security issues

---

## Risk Management

### High-Risk Items
1. **Smart Contract Security** - Requires formal verification before mainnet
2. **Payment System Reliability** - Critical for platform trust
3. **Regulatory Compliance** - NFT regulations evolving globally
4. **Blockchain Dependency** - Network outages impact platform

### Mitigation Strategies
- [ ] Security audit for smart contracts
- [ ] Comprehensive testing before payment launch
- [ ] Legal review for compliance
- [ ] Fallback mechanisms for blockchain failures
- [ ] Graduated rollout to production

---

## Infrastructure Budget
- Celo testnet: Free
- Celo mainnet: $100-500/month (estimated)
- MongoDB Atlas: $100-300/month
- Pinata IPFS: $100-500/month (based on usage)
- Cloud hosting (Vercel): $20-100/month
- Development tools: $200-500/month

---

## Stakeholder Communication

- **Weekly dev standup:** Progress updates
- **Bi-weekly sprint review:** Completed features demo
- **Monthly roadmap review:** Adjust priorities based on feedback
- **User feedback sessions:** Quarterly user testing
