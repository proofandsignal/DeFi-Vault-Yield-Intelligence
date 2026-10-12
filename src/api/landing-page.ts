export function landingPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="theme-color" content="#07110e" />
  <meta
    name="description"
    content="Proof & Signal DeFi Yield Intelligence compares live Aave, Morpho, Compound and Spark markets using yield, liquidity, concentration, risk signals and evidence coverage."
  />
  <title>Proof & Signal — DeFi Yield Intelligence</title>
  <style>
    :root {
      color-scheme: dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --bg: #06100d;
      --bg-2: #0a1713;
      --panel: rgba(13, 29, 24, 0.78);
      --panel-strong: #0d1d18;
      --line: rgba(167, 243, 208, 0.14);
      --line-strong: rgba(167, 243, 208, 0.25);
      --text: #effbf6;
      --muted: #9cb4aa;
      --soft: #c5d8cf;
      --accent: #64f0b4;
      --accent-2: #8af5ca;
      --watch: #f4c96b;
      --danger: #ff7b72;
      --max: 1160px;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      color: var(--text);
      background:
        radial-gradient(circle at 12% 8%, rgba(47, 173, 126, 0.16), transparent 30rem),
        radial-gradient(circle at 88% 18%, rgba(48, 122, 255, 0.08), transparent 28rem),
        linear-gradient(180deg, #06100d 0%, #071410 48%, #06100d 100%);
      min-height: 100vh;
    }

    a { color: inherit; text-decoration: none; }
    button, a.button { font: inherit; }
    .wrap { width: min(var(--max), calc(100% - 40px)); margin: 0 auto; }

    .nav {
      position: sticky;
      top: 0;
      z-index: 20;
      backdrop-filter: blur(18px);
      background: rgba(6, 16, 13, 0.78);
      border-bottom: 1px solid var(--line);
    }
    .nav-inner {
      min-height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 760;
      letter-spacing: -0.02em;
    }
    .mark {
      width: 32px;
      height: 32px;
      border-radius: 9px;
      border: 1px solid var(--line-strong);
      background:
        linear-gradient(135deg, rgba(100, 240, 180, 0.95), rgba(100, 240, 180, 0.16)),
        #0b2019;
      box-shadow: 0 0 40px rgba(100, 240, 180, 0.12);
      position: relative;
    }
    .mark::after {
      content: "";
      position: absolute;
      inset: 8px;
      border: 2px solid #04100c;
      border-radius: 4px;
      transform: rotate(45deg);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 20px;
      color: var(--muted);
      font-size: 14px;
    }
    .nav-links a:hover { color: var(--text); }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 46px;
      padding: 0 18px;
      border-radius: 10px;
      border: 1px solid var(--line-strong);
      background: rgba(255,255,255,0.025);
      color: var(--text);
      font-weight: 720;
      transition: 150ms ease;
    }
    .button:hover {
      transform: translateY(-1px);
      border-color: rgba(100, 240, 180, 0.5);
      background: rgba(100, 240, 180, 0.06);
    }
    .button.primary {
      color: #03110c;
      border-color: var(--accent);
      background: var(--accent);
      box-shadow: 0 12px 40px rgba(100, 240, 180, 0.12);
    }
    .button.primary:hover { background: var(--accent-2); }
    .button.small { min-height: 40px; padding: 0 14px; font-size: 14px; }

    .hero {
      padding: 96px 0 70px;
      display: grid;
      grid-template-columns: minmax(0, 1.12fr) minmax(360px, .88fr);
      gap: 70px;
      align-items: center;
    }
    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--accent-2);
      font-size: 12px;
      font-weight: 760;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .eyebrow::before {
      content: "";
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: var(--accent);
      box-shadow: 0 0 18px rgba(100,240,180,.7);
    }
    h1 {
      margin: 18px 0 20px;
      font-size: clamp(48px, 7vw, 82px);
      line-height: .98;
      letter-spacing: -.055em;
      max-width: 860px;
    }
    .hero-copy {
      max-width: 700px;
      color: var(--soft);
      font-size: clamp(18px, 2.1vw, 22px);
      line-height: 1.6;
    }
    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 30px;
    }
    .trust-row {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
      margin-top: 28px;
    }
    .chip {
      border: 1px solid var(--line);
      background: rgba(255,255,255,.02);
      color: var(--muted);
      padding: 8px 10px;
      border-radius: 999px;
      font-size: 12px;
    }

    .live-card {
      position: relative;
      overflow: hidden;
      border: 1px solid var(--line-strong);
      border-radius: 20px;
      background:
        linear-gradient(180deg, rgba(100,240,180,.055), transparent 35%),
        var(--panel);
      box-shadow: 0 32px 80px rgba(0,0,0,.25);
      padding: 22px;
    }
    .live-card::before {
      content: "";
      position: absolute;
      inset: 0 0 auto;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
      opacity: .7;
    }
    .live-head {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: center;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--line);
    }
    .live-label { font-weight: 700; }
    .live-status {
      color: var(--accent);
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .live-status::before {
      content: "";
      width: 7px;
      height: 7px;
      background: var(--accent);
      border-radius: 999px;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 18px;
    }
    .metric {
      padding: 15px;
      border-radius: 12px;
      border: 1px solid var(--line);
      background: rgba(0,0,0,.14);
    }
    .metric span {
      display: block;
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 7px;
    }
    .metric strong { font-size: 22px; letter-spacing: -.03em; }
    .risk-WATCH { color: var(--watch); }
    .risk-GREEN { color: var(--accent); }
    .risk-RED { color: var(--danger); }
    .risk-VERIFY { color: var(--muted); }
    .live-foot {
      margin-top: 16px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.55;
    }

    section { padding: 70px 0; }
    .section-head {
      max-width: 760px;
      margin-bottom: 30px;
    }
    .section-head h2 {
      font-size: clamp(32px, 5vw, 52px);
      letter-spacing: -.045em;
      line-height: 1.05;
      margin: 10px 0 15px;
    }
    .section-head p {
      color: var(--muted);
      font-size: 18px;
      line-height: 1.65;
      margin: 0;
    }

    .dimension-grid,
    .protocol-grid,
    .product-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }
    .protocol-grid { grid-template-columns: repeat(4, 1fr); }
    .card {
      border: 1px solid var(--line);
      border-radius: 16px;
      background: var(--panel);
      padding: 22px;
    }
    .card .index {
      color: var(--accent);
      font-size: 12px;
      letter-spacing: .12em;
      text-transform: uppercase;
      font-weight: 760;
    }
    .card h3 {
      margin: 14px 0 10px;
      font-size: 20px;
      letter-spacing: -.025em;
    }
    .card p {
      margin: 0;
      color: var(--muted);
      line-height: 1.58;
      font-size: 14px;
    }

    .protocol {
      min-height: 148px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .protocol strong { font-size: 22px; }
    .protocol span { color: var(--muted); font-size: 13px; }
    .protocol .dot {
      width: 9px;
      height: 9px;
      border-radius: 999px;
      background: var(--accent);
      box-shadow: 0 0 18px rgba(100,240,180,.4);
    }

    .flow {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      align-items: stretch;
    }
    .flow-step {
      min-height: 120px;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 18px;
      background: rgba(255,255,255,.018);
      position: relative;
    }
    .flow-step:not(:last-child)::after {
      content: "→";
      position: absolute;
      right: -12px;
      top: 44%;
      z-index: 2;
      color: var(--accent);
      font-weight: 800;
    }
    .flow-step strong { display: block; margin-bottom: 10px; }
    .flow-step span { color: var(--muted); font-size: 13px; line-height: 1.5; }

    .product {
      display: flex;
      flex-direction: column;
      min-height: 310px;
    }
    .product.featured {
      border-color: rgba(100,240,180,.42);
      background:
        linear-gradient(180deg, rgba(100,240,180,.06), transparent 55%),
        var(--panel);
    }
    .price {
      font-size: 34px;
      font-weight: 800;
      letter-spacing: -.04em;
      margin: 18px 0 6px;
    }
    .price small { font-size: 13px; font-weight: 600; color: var(--muted); }
    .features {
      list-style: none;
      padding: 0;
      margin: 22px 0 28px;
      color: var(--soft);
      display: grid;
      gap: 10px;
      font-size: 14px;
    }
    .features li::before {
      content: "✓";
      color: var(--accent);
      margin-right: 9px;
    }
    .product .button { margin-top: auto; }

    .beta {
      border: 1px solid rgba(100,240,180,.3);
      border-radius: 22px;
      background:
        radial-gradient(circle at 84% 20%, rgba(100,240,180,.12), transparent 18rem),
        var(--panel-strong);
      padding: clamp(28px, 5vw, 54px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 34px;
    }
    .beta h2 {
      margin: 8px 0 12px;
      font-size: clamp(30px, 5vw, 48px);
      letter-spacing: -.045em;
    }
    .beta p {
      color: var(--muted);
      line-height: 1.6;
      max-width: 700px;
      margin: 0;
    }

    .legal {
      display: grid;
      grid-template-columns: 1.1fr .9fr;
      gap: 28px;
      border-top: 1px solid var(--line);
      padding-top: 28px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.65;
    }
    footer { padding: 34px 0 48px; }

    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; gap: 34px; padding-top: 72px; }
      .dimension-grid, .product-grid { grid-template-columns: 1fr; }
      .protocol-grid { grid-template-columns: repeat(2, 1fr); }
      .flow { grid-template-columns: 1fr; }
      .flow-step:not(:last-child)::after { content: "↓"; right: 18px; top: auto; bottom: -16px; }
      .beta { flex-direction: column; align-items: flex-start; }
      .legal { grid-template-columns: 1fr; }
    }

    @media (max-width: 650px) {
      .wrap { width: min(var(--max), calc(100% - 28px)); }
      .nav-links a:not(.button) { display: none; }
      .brand span:last-child { font-size: 14px; }
      h1 { font-size: 48px; }
      .protocol-grid, .metric-grid { grid-template-columns: 1fr; }
      section { padding: 52px 0; }
    }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="wrap nav-inner">
      <a class="brand" href="/" aria-label="Proof & Signal home">
        <span class="mark" aria-hidden="true"></span>
        <span>Proof & Signal <span style="color:var(--muted);font-weight:560">/ DeFi Yield Intelligence</span></span>
      </a>
      <div class="nav-links">
        <a href="#method">Method</a>
        <a href="#coverage">Markets</a>
        <a href="#access">Access</a>
        <a class="button small" href="/go/scanner?source=landing&campaign=nav">Open Scanner</a>
      </div>
    </div>
  </nav>

  <main>
    <div class="wrap hero">
      <div>
        <div class="eyebrow">Evidence-backed DeFi market intelligence</div>
        <h1>Compare DeFi yield beyond APY.</h1>
        <p class="hero-copy">
          Live Aave, Morpho, Compound and Spark markets — normalized into one view with
          yield, liquidity, borrower concentration, risk signals and evidence coverage.
        </p>
        <div class="hero-actions">
          <a class="button primary" href="/go/scanner?source=landing&campaign=hero-primary">Open Yield Scanner</a>
          <a class="button" href="#access">PRO & API Early Access</a>
        </div>
        <div class="trust-row" aria-label="Product safeguards">
          <span class="chip">Read-only intelligence</span>
          <span class="chip">No deposits</span>
          <span class="chip">No custody</span>
          <span class="chip">No automated execution</span>
          <span class="chip">Risk Model v0.3.1</span>
        </div>
      </div>

      <aside class="live-card" aria-label="Live production sample">
        <div class="live-head">
          <div>
            <div class="live-label">Live production sample</div>
            <div style="color:var(--muted);font-size:12px;margin-top:4px">Ethereum · USDC · Compound III</div>
          </div>
          <div id="live-state" class="live-status">Loading</div>
        </div>
        <div class="metric-grid">
          <div class="metric">
            <span>Observed APY</span>
            <strong id="live-apy">—</strong>
          </div>
          <div class="metric">
            <span>Risk status</span>
            <strong id="live-risk">—</strong>
          </div>
          <div class="metric">
            <span>Risk score</span>
            <strong id="live-score">—</strong>
          </div>
          <div class="metric">
            <span>Evidence coverage</span>
            <strong id="live-coverage">—</strong>
          </div>
        </div>
        <div id="live-foot" class="live-foot">
          Pulling a fresh read-only market observation from the production scanner.
        </div>
      </aside>
    </div>

    <section id="method">
      <div class="wrap">
        <div class="section-head">
          <div class="eyebrow">Why APY alone is incomplete</div>
          <h2>Yield is one signal. Risk context changes the decision.</h2>
          <p>
            A higher advertised yield can sit beside weaker liquidity, concentrated debt,
            unresolved evidence or a different protocol risk profile. We keep those dimensions visible.
          </p>
        </div>
        <div class="dimension-grid">
          <article class="card">
            <div class="index">01 / Yield</div>
            <h3>Observed market yield</h3>
            <p>Current protocol-native supply APY, normalized into a comparable market view.</p>
          </article>
          <article class="card">
            <div class="index">02 / Market depth</div>
            <h3>Liquidity & utilization</h3>
            <p>Supply, borrow and liquidity context to avoid treating APY as an isolated number.</p>
          </article>
          <article class="card">
            <div class="index">03 / Concentration</div>
            <h3>Borrower concentration</h3>
            <p>Where independently verifiable, the scanner surfaces top-borrower concentration rather than assuming diversification.</p>
          </article>
          <article class="card">
            <div class="index">04 / Evidence</div>
            <h3>Evidence coverage</h3>
            <p>Missing dimensions stay unresolved. The engine does not silently replace unknowns with reassuring zeros.</p>
          </article>
          <article class="card">
            <div class="index">05 / Risk</div>
            <h3>Versioned risk signals</h3>
            <p>GREEN, WATCH, RED or VERIFY classifications from a transparent, versioned engineering model — not a probability of loss.</p>
          </article>
          <article class="card">
            <div class="index">06 / Net assumptions</div>
            <h3>Explicit cost assumptions</h3>
            <p>Net-yield estimates only appear when principal and cost assumptions are explicitly supplied.</p>
          </article>
        </div>
      </div>
    </section>

    <section id="coverage">
      <div class="wrap">
        <div class="section-head">
          <div class="eyebrow">Pilot market coverage</div>
          <h2>One normalized view across four lending markets.</h2>
          <p>
            The current live pilot focuses on Ethereum USDC. The architecture is multi-protocol,
            multi-chain and multi-asset; the validation surface stays deliberately narrow.
          </p>
        </div>
        <div class="protocol-grid">
          <article class="card protocol"><div class="dot"></div><div><strong>Aave</strong><br><span>Aave V3 reserve market</span></div></article>
          <article class="card protocol"><div class="dot"></div><div><strong>Morpho</strong><br><span>Morpho Blue isolated market</span></div></article>
          <article class="card protocol"><div class="dot"></div><div><strong>Compound</strong><br><span>Compound III Comet</span></div></article>
          <article class="card protocol"><div class="dot"></div><div><strong>Spark</strong><br><span>SparkLend reserve market</span></div></article>
        </div>
      </div>
    </section>

    <section>
      <div class="wrap">
        <div class="section-head">
          <div class="eyebrow">How it works</div>
          <h2>From raw protocol data to a comparable decision surface.</h2>
        </div>
        <div class="flow">
          <div class="flow-step"><strong>Live data</strong><span>Protocol and on-chain observations.</span></div>
          <div class="flow-step"><strong>Normalization</strong><span>Common market schema across adapters.</span></div>
          <div class="flow-step"><strong>Evidence</strong><span>Freshness, confidence and unresolved dimensions.</span></div>
          <div class="flow-step"><strong>Risk model</strong><span>Versioned evidence-backed classification.</span></div>
          <div class="flow-step"><strong>Comparison</strong><span>Yield and risk context in one scanner/API.</span></div>
        </div>
      </div>
    </section>

    <section id="access">
      <div class="wrap">
        <div class="section-head">
          <div class="eyebrow">Validation access</div>
          <h2>Start free. Pay only when the repeated need is clear.</h2>
          <p>
            We are validating which layer creates recurring value before building billing or a large account system.
          </p>
        </div>
        <div class="product-grid">
          <article class="card product">
            <div class="index">Free</div>
            <h3>Yield Scanner</h3>
            <div class="price">€0</div>
            <ul class="features">
              <li>Current live market snapshot</li>
              <li>Aave / Morpho / Compound / Spark</li>
              <li>Risk status and score</li>
              <li>Evidence coverage</li>
            </ul>
            <a class="button" href="/go/scanner?source=landing&campaign=free-card">Open Scanner</a>
          </article>

          <article class="card product featured">
            <div class="index">Founding Beta</div>
            <h3>PRO Monitoring</h3>
            <div class="price">€9–19 <small>/ month test</small></div>
            <ul class="features">
              <li>History and change tracking</li>
              <li>Yield / risk alerts</li>
              <li>Saved watchlists</li>
              <li>Expanded evidence access</li>
            </ul>
            <a class="button primary" href="/go/interest?product=pro&source=landing&campaign=founding-beta">Join Founding Beta</a>
          </article>

          <article class="card product">
            <div class="index">B2B Early Access</div>
            <h3>Comparison API</h3>
            <div class="price">Pilot <small>/ validation pricing</small></div>
            <ul class="features">
              <li>Normalized market data</li>
              <li>Risk/yield comparison layer</li>
              <li>Keyed access path ready</li>
              <li>Wallet / treasury / fintech use cases</li>
            </ul>
            <a class="button" href="/go/interest?product=b2b&source=landing&campaign=b2b-api">Request API Access</a>
          </article>
        </div>
      </div>
    </section>

    <section>
      <div class="wrap beta">
        <div>
          <div class="eyebrow">Founding users</div>
          <h2>Help decide what v0.5 becomes.</h2>
          <p>
            Monitoring, more markets or B2B API? We are using real user behavior and willingness to pay
            to decide the next build — not feature guesses.
          </p>
        </div>
        <a class="button primary" href="/go/interest?product=pro&source=landing&campaign=first-10">Join the first 10 users</a>
      </div>
    </section>

    <section>
      <div class="wrap legal">
        <div>
          <strong style="color:var(--text)">Proof & Signal — DeFi Yield Intelligence</strong><br />
          Independent, read-only DeFi market intelligence for research and product validation.
        </div>
        <div>
          Information is analytical and educational, not investment advice. No deposits, custody,
          portfolio management or automated execution are offered. DeFi protocols and smart contracts
          can fail; displayed signals do not guarantee safety or future returns.
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="wrap" style="color:var(--muted);font-size:12px">
      Proof & Signal · DeFi Yield Intelligence · Public capital functionality is not part of this product.
    </div>
  </footer>

  <script>
    const pct = (value, digits = 2) =>
      value == null ? "—" : Number(value).toFixed(digits) + "%";

    async function loadLiveSample() {
      const state = document.getElementById("live-state");
      const foot = document.getElementById("live-foot");

      try {
        const response = await fetch(
          "/api/v1/scan?chainId=1&asset=USDC&protocols=compound",
          { headers: { "accept": "application/json" } }
        );
        const payload = await response.json();

        if (!response.ok || !payload.rows?.length) {
          throw new Error(payload.error?.message || "Live sample unavailable.");
        }

        const row = payload.rows[0];
        document.getElementById("live-apy").textContent =
          pct(row.observedGrossApyPct, 3);

        const risk = document.getElementById("live-risk");
        risk.textContent = row.riskStatus || "—";
        risk.className = "risk-" + (row.riskStatus || "VERIFY");

        document.getElementById("live-score").textContent =
          row.riskScore == null ? "—" : Number(row.riskScore).toFixed(2);

        document.getElementById("live-coverage").textContent =
          pct(row.evidenceCoveragePct, 0);

        state.textContent = payload.complete ? "Live" : "Partial";
        foot.textContent =
          "Fresh production observation · Risk Model " +
          payload.riskModelVersion +
          " · " +
          new Date(payload.generatedAt).toLocaleString();
      } catch (error) {
        state.textContent = "Unavailable";
        state.style.color = "var(--watch)";
        foot.textContent =
          "The landing page is available, but the live sample could not be refreshed. Open the scanner to retry.";
      }
    }

    loadLiveSample();
  </script>
</body>
</html>`;
}
