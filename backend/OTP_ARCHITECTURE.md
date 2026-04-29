# OTP System Architecture & Scaling Plan

## Current Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Campus Connect OTP Flow                       │
└──────────────────────────────────────────────────────────────────────┘

  Student                    API Server                    MongoDB
     │                           │                           │
     │  POST /api/v1/otp/generateOTP                          │
     │──────────────────────────▶│                           │
     │                           │                           │
     │                           │  1. Generate 6-digit OTP   │
     │                           │────────────────────────────▶│
     │                           │                           │
     │                           │  2. Save to EmailOtp      │
     │                           │     (TTL: 5 minutes)       │
     │                           │◀──────────────────────────│
     │                           │                           │
     │                           │  3. Create JWT token      │
     │                           │                           │
     │                           │  4. await sendOtp()       │
     │                           │     ┌────────────────┐    │
     │                           │     │ Nodemailer     │    │
     │                           │     │ Transporter    │    │
     │                           │     │ (Gmail SMTP)   │    │
     │                           │     └───────┬────────┘    │
     │                           │             │             │
     │                           │             ▼             │
     │                           │     ┌────────────────┐   │
     │                           │     │ Gmail SMTP     │   │
     │                           │     │ Server         │   │
     │                           │     └───────┬────────┘   │
     │                           │             │             │
     │                           │             ▼             │
     │                           │     ┌────────────────┐   │
     │                           │     │ Student Email  │   │
     │                           │     └───────┬────────┘   │
     │                           │             │             │
     │◀──────────────────────────│             │             │
     │  { authtoken }            │             ▼             │
     │                           │     Email delivered      │
```

---

## Current Load Handling Analysis

### How Node.js Processes Concurrent OTP Requests

```
Event Loop (Single Threaded):
────────────────────────────

T=0ms    Request 1: OTP generated, await sendOtp() starts (blocking call to Gmail)
         │
T=50ms   Gmail responds → Response sent to Student 1

         Request 2-100: Were waiting in event loop queue
         Each one blocks on await sendOtp() for ~50-100ms

T=100ms  Student 2's email sent
T=150ms  Student 3's email sent
...
T=3000ms Last student (~60th) gets response
```

### Key Bottlenecks

| Component | Current Behavior | Impact |
|-----------|-----------------|--------|
| **Nodemailer** | Creates new transporter per email | No connection reuse, overhead |
| **Gmail SMTP** | ~50-100ms per email, sequential | Blocks event loop |
| **Rate Limiting** | 3 OTP req/min/IP | Good protection |
| **Email Verify** | `transporter.verify()` called each time | +500ms per email |
| **OTP Save** | Synchronous DB write | Fast but blocks |

### Throughput Math

- **Best case:** 10 emails/second (100ms each, sequential)
- **With 100 concurrent students:** Last student waits ~10 seconds
- **Gmail daily limit (personal):** 100-500 emails
- **Gmail daily limit (Google Workspace):** 2,000 emails

---

## Scaling Options

### Option 1: Simple Optimizations (Low Effort, Immediate Impact)

**Changes:**
- Remove `transporter.verify()` calls (saves ~500ms per email)
- Add connection pooling for nodemailer transporter
- Implement fire-and-forget email sending (don't await)
- Add email job caching (skip OTP generation if sent recently)

**Impact:**
- Reduces per-email time from ~600ms to ~50ms
- Handles ~100 concurrent requests before queueing

**Pros:** Quick to implement, no infrastructure changes
**Cons:** Still limited by Gmail SMTP, no retry logic

---

### Option 2: MongoDB-Based Email Queue (Medium Effort)

```
┌────────────────────────────────────────────────────────────────┐
│                      Enhanced Architecture                      │
└────────────────────────────────────────────────────────────────┘

  Student                    API Server                    MongoDB
     │                           │                    ┌────────────┐
     │                           │                    │ EmailQueue  │
     │  POST /generateOTP        │                    │ Collection  │
     │──────────────────────────▶│                    └──────┬───────┘
     │                           │                           │
     │                           │  1. Generate OTP          │
     │                           │  2. Save to EmailOtp       │
     │                           │  3. Create email job      │
     │                           │     in queue              │
     │                           │────────────────────────────▶
     │                           │                           │
     │◀──────────────────────────│                           │
     │  { authtoken } (fast!)    │                           │
     │                           │                           │
     │                           │     ┌────────────────┐    │
     │                           │     │ Email Worker   │    │
     │                           │     │ (Background   │    │
     │                           │     │  process)      │    │
     │                           │     └───────┬────────┘    │
     │                           │             │             │
     │                           │◀─────────────┘             │
     │                           │  Dequeue & process         │
     │                           │             │             │
     │                           │             ▼             │
     │                           │     ┌────────────────┐    │
     │                           │     │ Nodemailer     │    │
     │                           │     │ (still Gmail)   │    │
     │                           │     └────────────────┘    │
```

**Changes:**
- Save email jobs to `email_queue` collection with status (pending/processing/sent/failed)
- API returns immediately after queueing job
- Background worker polls queue and sends emails
- Retry logic with exponential backoff stored in job status

**Pros:**
- API responds immediately (~20ms)
- Handles burst traffic
- Survives restarts (jobs persist in MongoDB)
- Can add multiple workers

**Cons:**
- Still limited by Gmail SMTP
- Worker adds complexity
- Email timing is no longer synchronous

---

### Option 3: Redis + Bull Queue (Production Ready)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Production Architecture                            │
└─────────────────────────────────────────────────────────────────────┘

  ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────────┐
  │   API   │─────▶│  Redis  │─────▶│  Bull   │─────▶│  Email      │
  │ Server  │      │  Queue  │      │  Worker │      │  Provider   │
  └─────────┘      └─────────┘      └─────────┘      │ (SendGrid/  │
       │                                      │        │  AWS SES)   │
       │                                      │        └─────────────┘
       │                                      │
       │              ┌─────────────┐         │
       │              │  Dashboard  │◀────────┘
       │              │  (metrics)  │
       │              └─────────────┘
```

**Changes:**
- Replace MongoDB queue with Redis + Bull
- Add dedicated email provider (SendGrid/AWS SES)
- Multiple worker processes
- Real-time dashboard for email status

**Pros:**
- 10,000+ emails/hour possible
- Automatic retries with backoff
- Dead letter queue for failed emails
- Detailed analytics
- Multiple channels (email, SMS, push)

**Cons:**
- Requires Redis infrastructure
- API key management for email provider
- More complex deployment

---

### Option 4: Dedicated Notification Microservice (Scale to Multiple Universities)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Multi-Tenant Architecture                          │
└─────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │ Campus A API │         │ Campus B API │         │ Campus C API │
  └──────┬───────┘         └──────┬───────┘         └──────┬───────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │    Notification Service   │
                    │  ┌────────┐ ┌────────┐   │
                    │  │ Email  │ │  SMS   │   │
                    │  │ Worker │ │ Worker │   │
                    │  └────────┘ └────────┘   │
                    └─────────────┬─────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
        ┌─────▼─────┐       ┌─────▼─────┐       ┌─────▼─────┐
        │  SendGrid  │       │   AWS     │       │   Twilio  │
        │           │       │   SES     │       │   (SMS)   │
        └───────────┘       └───────────┘       └───────────┘
```

**Pros:**
- Shared service across multiple campuses
- Centralized logging and analytics
- Independent scaling per campus
- Template management system

**Cons:**
- Significant infrastructure investment
- Requires dedicated team
- More complex authentication (service-to-service)

---

## Recommended Implementation Plan

### Based on Campus Connect's Current Scale

**Analysis:**
- Estimated users: 500-2000 students + faculty
- Registration peak: Semester start (~100 concurrent/hour realistic)
- Current infrastructure: MongoDB only (no Redis)

**Recommendation:** **Option 2 (MongoDB Email Queue)** as the right balance

**Why not Option 1?** While quick, it doesn't solve the Gmail bottleneck and has no retry logic.

**Why not Option 3?** Redis adds infrastructure overhead. Better to implement when Gmail limits become real problem.

**Why not Option 4?** Overkill for single-university deployment.

---

### Implementation Phases

#### Phase 1: Quick Wins (Minimal Risk)

**Files to modify:**
- `src/utils/otpHelper.js`
- `src/routes/v1/otpRoutes.js`

**Changes:**
1. Remove `transporter.verify()` calls
2. Reuse transporter across calls (singleton pattern)
3. Add retry wrapper with 3 attempts

**Impact:** 5-10x improvement in email throughput

---

#### Phase 2: MongoDB Email Queue (Main Implementation)

**Files to create:**
- `src/models/EmailJob.js` - Queue schema
- `src/workers/emailWorker.js` - Background processor
- `src/utils/emailQueue.js` - Queue helper functions

**Files to modify:**
- `src/routes/v1/otpRoutes.js` - Queue instead of send
- `src/routes/v1/loginRoutes.js` - Queue password reset emails

**Schema:**
```javascript
{
  _id: ObjectId,
  type: 'OTP' | 'PASSWORD_RESET',
  to: String,
  data: { otp, email, ... },
  status: 'pending' | 'processing' | 'sent' | 'failed',
  attempts: Number,
  lastError: String,
  createdAt: Date,
  processedAt: Date
}
```

**Worker Logic:**
1. Poll `email_jobs` where `status: 'pending'`
2. Mark as `processing`, attempt send
3. On success: mark `sent`, log
4. On failure: increment `attempts`, if < 3 re-queue, else mark `failed`
5. Run every 5 seconds (adjustable)

---

#### Phase 3: Monitoring & Alerts (Optional)

**Add:**
- TTL index for cleanup of old jobs
- Metrics endpoint for queue size, failure rate
- Admin dashboard component

---

## Cost Comparison

| Option | Infrastructure Cost | Email Limit/Day | Complexity |
|--------|---------------------|-----------------|------------|
| Current (Gmail) | $0 | 100-2000 | Low |
| Option 2 (Queue + Gmail) | $0 | 100-2000 | Medium |
| Option 3 (SendGrid) | ~$20/month | 100,000+ | Medium |
| Option 4 (Microservice) | ~$100+/month | Unlimited | High |

---

## Email Provider Recommendations

### For Development / Small Scale
- **Gmail SMTP** (current) - Fine for <50 emails/day

### For Production
| Provider | Free Tier | Paid (100k/month) | Best For |
|----------|-----------|------------------|----------|
| **SendGrid** | 100/day | ~$20 | Easy setup, good docs |
| **AWS SES** | 62k/month free | ~$10 | AWS integrators |
| **Mailgun** | 5k/month | ~$20 | Developer friendly |
| **Postmark** | 100/day | ~$45 | Reliability focus |

**Recommendation:** AWS SES is cheapest at scale. SendGrid is easiest to set up.

---

## Success Metrics

After implementing Option 2, measure:

1. **Queue depth** - Number of pending emails (should be ~0 normally)
2. **Failure rate** - % of emails that fail after 3 retries
3. **Average processing time** - Time from job creation to sent
4. **Peak load handling** - Does the system survive 50+ concurrent registrations?

---

## Future Considerations

When to scale beyond Option 2:

1. **Daily email volume exceeds 2000**
2. **Need SMS/Push notifications**
3. **Multiple university deployment**
4. **Real-time email analytics required**

At that point, migrate to Option 3 (Redis + Bull) or Option 4 (Dedicated service).

---

## Files Reference

### Current OTP Flow

| File | Purpose |
|------|---------|
| `src/routes/v1/otpRoutes.js` | OTP generation & verification endpoints |
| `src/models/EmailOtp.js` | OTP storage (TTL: 5 min) |
| `src/middlewares/otpMiddleware.js` | JWT verification for OTP flow |
| `src/utils/otpHelper.js` | Email sending utility |

### Future Files (Option 2)

| File | Purpose |
|------|---------|
| `src/models/EmailJob.js` | Email queue schema |
| `src/workers/emailWorker.js` | Background email processor |
| `src/utils/emailQueue.js` | Queue management helpers |

---

## Questions to Answer Before Implementation

1. **What's the expected peak concurrent registrations?**
   - 10? 100? 1000?

2. **Do you want email sending to be synchronous (guaranteed delivery before response) or async (fast response, eventual delivery)?**
   - Async is faster but student won't know if email fails immediately

3. **Should failed emails be retried automatically, or just logged for manual retry?**
   - Auto-retry is better but adds complexity

4. **Do you have/want Redis infrastructure?**
   - If yes, Option 3 becomes more attractive

5. **What's the budget for email infrastructure?**
   - $0 = stay with Gmail
   - $20-50/month = SendGrid/AWS SES