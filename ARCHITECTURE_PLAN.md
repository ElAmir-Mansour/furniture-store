# System Architecture Refactoring Plan

**Project:** Premium Furniture E-commerce App
**Agent Role:** Lead Architect Agent
**Objective:** Transform current working prototype into a battle-tested, production-ready system.

---

## 🏗 Phase 1: Modular Architecture (Dismantling "God Files")

**Problem:** 
Several paramount files (e.g., `src/app/[locale]/page.tsx`, `src/app/[locale]/products/page.tsx`, `src/app/[locale]/products/[slug]/page.tsx`) exceed 400-500 lines. These files declare multiple UI sub-components natively (like `ProductCard`, `RelatedCard`, `CategoryCard`, and logic-heavy skeletons) creating monolithic "God Files" that violate our 200-line limitation rule and complicate maintenance.

**Execution:**
1.  **Extract UI Components:** Create a `src/components/shop/` and `src/components/ui/` directory.
2.  Move `ProductCard`, `CategoryCard`, and `RelatedCard` (and their respective skeletons) into strongly-typed standalone `.tsx` files.
3.  **Refactor Imports:** Clean up the main Page files to solely act as layout orchestrators and data fetchers, importing the extracted UI pieces.

---

## ⚡ Phase 2: Centralized Global State & Optimized Data Flow

**Problem:** 
Cart synchronization relies on native `window.dispatchEvent` DOM triggers to tell the Navbar to fetch fresh Cart numbers after "Add to Cart" interactions. This causes unnecessary network round-trips and isn't optimal React data flow. Furthermore, standard `useEffect` loops are handling layout-blocking data fetches.

**Execution:**
1.  **State Management:** Introduce **Zustand** (or native React Context) specifically for the Cart and Wishlist stores. Updates to the store will natively bubble to all subscribed UI elements (Navbar bubbles, Checkout numbers) instantly without manual re-fetches.
2.  **Optimized Fetching:** Shift `useEffect` fetches toward SWR/React Query for cached Client-Side-Rendering (CSR), or convert data-fetching pages completely to Next.js Server Components (RSC) to ship raw HTML with zero layout delay.

---

## 🛡️ Phase 3: Hardened API Boundaries (Type Safety)

**Problem:** 
Our `POST` / `PUT` backend API routes (e.g., `/api/v1/cart`) extract properties blindly using `await request.json()`. If a malformed or malicious payload arrives, the backend attempts to process it before crashing deeply in the database layer. 

**Execution:**
1.  **DTO Validation:** We already have `zod` in `package.json`. Introduce a middleware parsing step inside every POST/PUT route.
2.  **Implementation Pattern:**
    ```typescript
    const CartUpdateSchema = z.object({ variantId: z.string(), quantity: z.number().min(1) });
    const parsed = CartUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid payload" });
    ```
    This ensures failing fast and gracefully right at the API edge.

---

## 💳 Phase 4: Bulletproof Payment & Email Workflows

**Problem:** 
E-commerce payment gateways are inherently async. A user paying via Paymob could lose connection during the redirect holding state in limbo. In combination, sending confirmation emails synchronously blocks fast API response times. 

**Execution:**
1.  **Paymob Webhook Security:** Ensure the Webhook endpoint (`/api/v1/webhooks/paymob`) strictly calculates and enforces HMAC validation hashes, rejecting spoofed callbacks. 
2.  **Async Task Queueing:** Utilize `bullmq` and `ioredis` (installed dependencies) to handle order confirmation emails, shipment tracking emails, and database status flips. When an order succeeds, push a "Send Email" job to the queue rather than halting the `/checkout` or webhook thread to communicate directly with the Gmail API.

---

### Approval Needed
**Please review this artifact as the Product Owner. To proceed smoothly and tackle technical debt intelligently, I recommend starting linearly with Phase 1 (Component Extraction). Once approved, I will begin dismantling the "God Files" safely.**
