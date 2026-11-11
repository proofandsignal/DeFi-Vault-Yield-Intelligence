export function landingPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="theme-color" content="#07100f" />
  <meta name="description" content="Proof & Signal DeFi Yield Intelligence compares live Aave, Morpho, Compound and Spark markets using yield, liquidity, concentration, risk signals and evidence coverage." />
  <title>Proof & Signal — DeFi Yield Intelligence</title>
  <style>
    :root{
      color-scheme:dark;
      font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      --bg:#060c0c;--bg2:#0a1312;--panel:#0d1716;--panel2:#111e1c;--line:rgba(194,255,229,.13);
      --line2:rgba(194,255,229,.25);--text:#f4fbf8;--soft:#c9d8d2;--muted:#8fa49c;--mint:#7bf0bd;
      --mint2:#b2f7d8;--blue:#7fb0ff;--gold:#f0c974;--red:#ff807a;--max:1180px;
    }
    *{box-sizing:border-box} html{scroll-behavior:smooth} body{margin:0;color:var(--text);background:
      radial-gradient(circle at 10% 4%,rgba(123,240,189,.14),transparent 27rem),
      radial-gradient(circle at 92% 10%,rgba(127,176,255,.10),transparent 26rem),
      linear-gradient(180deg,#060c0c 0%,#081211 50%,#060c0c 100%);min-height:100vh}
    a{color:inherit;text-decoration:none}.wrap{width:min(var(--max),calc(100% - 40px));margin:0 auto}
    .nav{position:sticky;top:0;z-index:30;background:rgba(6,12,12,.78);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}
    .navin{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:22px}.brand{display:flex;align-items:center;gap:12px}
    .logo{width:38px;height:38px;border-radius:12px;position:relative;border:1px solid var(--line2);background:
      radial-gradient(circle at 50% 50%,rgba(123,240,189,.24) 0 16%,transparent 17%),
      radial-gradient(circle at 50% 50%,transparent 0 39%,rgba(123,240,189,.7) 40% 43%,transparent 44%),
      linear-gradient(135deg,rgba(123,240,189,.18),rgba(127,176,255,.12));box-shadow:0 0 42px rgba(123,240,189,.12)}
    .logo:before,.logo:after{content:"";position:absolute;background:var(--mint);border-radius:99px}.logo:before{width:5px;height:5px;top:7px;right:8px;box-shadow:-18px 17px 0 rgba(127,176,255,.9)}.logo:after{width:15px;height:2px;left:12px;top:18px;transform:rotate(-33deg)}
    .brandtext strong{display:block;font-size:14px;letter-spacing:.01em}.brandtext span{display:block;font-size:11px;color:var(--muted);margin-top:2px}
    .navlinks{display:flex;align-items:center;gap:18px;color:var(--muted);font-size:13px}.navlinks a:hover{color:var(--text)}
    .btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:12px;border:1px solid var(--line2);font-weight:750;transition:.16s ease;background:rgba(255,255,255,.025)}
    .btn:hover{transform:translateY(-1px);border-color:rgba(123,240,189,.55);background:rgba(123,240,189,.06)}.btn.primary{background:var(--mint);border-color:var(--mint);color:#04100b;box-shadow:0 15px 46px rgba(123,240,189,.13)}
    .btn.primary:hover{background:var(--mint2)}.btn.small{min-height:39px;padding:0 13px;font-size:13px}
    .hero{padding:88px 0 52px;display:grid;grid-template-columns:minmax(0,1.04fr) minmax(390px,.96fr);gap:56px;align-items:center}
    .badge{display:inline-flex;align-items:center;gap:8px;color:var(--mint2);font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
    .badge:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--mint);box-shadow:0 0 18px rgba(123,240,189,.75)}
    h1{font-size:clamp(50px,7vw,86px);line-height:.94;letter-spacing:-.06em;margin:18px 0 22px;max-width:760px}
    .gradient{background:linear-gradient(90deg,#fff,var(--mint2) 55%,#a8c8ff);-webkit-background-clip:text;background-clip:text;color:transparent}
    .lead{max-width:720px;color:var(--soft);font-size:clamp(18px,2vw,22px);line-height:1.62;margin:0}
    .actions{display:flex;flex-wrap:wrap;gap:11px;margin-top:28px}.micro{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px}
    .chip{font-size:11px;color:var(--muted);padding:8px 10px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.018)}
    .visual{position:relative;min-height:520px;border:1px solid var(--line2);border-radius:26px;background:
      linear-gradient(180deg,rgba(123,240,189,.055),transparent 30%),rgba(9,20,18,.88);overflow:hidden;box-shadow:0 32px 100px rgba(0,0,0,.34)}
    .visual:before{content:"";position:absolute;inset:-80px;background:radial-gradient(circle at 50% 46%,rgba(123,240,189,.11),transparent 31%);pointer-events:none}
    .vhead{position:relative;display:flex;justify-content:space-between;gap:20px;padding:22px 22px 16px;border-bottom:1px solid var(--line)}
    .vhead strong{font-size:14px}.vhead span{display:block;color:var(--muted);font-size:11px;margin-top:4px}.live{font-size:11px;color:var(--mint);display:flex;align-items:center;gap:7px}.live:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--mint)}
    .radar{position:relative;height:250px;margin:18px 22px 0;border:1px solid var(--line);border-radius:18px;background:
      radial-gradient(circle at center,rgba(123,240,189,.14) 0 2px,transparent 3px),
      radial-gradient(circle at center,transparent 0 25%,rgba(194,255,229,.10) 26% 27%,transparent 28% 49%,rgba(194,255,229,.08) 50% 51%,transparent 52% 73%,rgba(194,255,229,.06) 74% 75%,transparent 76%),
      linear-gradient(90deg,transparent 49.7%,rgba(194,255,229,.07) 50%,transparent 50.3%),
      linear-gradient(transparent 49.7%,rgba(194,255,229,.07) 50%,transparent 50.3%)}
    .center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center}.center strong{display:block;font-size:25px;letter-spacing:-.04em}.center span{font-size:10px;color:var(--muted)}
    .node{position:absolute;padding:8px 10px;border:1px solid var(--line2);border-radius:10px;background:#0c1715;font-size:11px;font-weight:750}.n1{top:18px;left:22px}.n2{top:35px;right:20px}.n3{bottom:24px;left:28px}.n4{bottom:20px;right:28px}
    .pulse{width:8px;height:8px;border-radius:50%;background:var(--mint);display:inline-block;margin-right:6px;box-shadow:0 0 14px rgba(123,240,189,.6)}
    .metrics{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:9px;padding:18px 22px 22px}.metric{border:1px solid var(--line);border-radius:12px;padding:12px;background:rgba(0,0,0,.13)}.metric span{display:block;font-size:10px;color:var(--muted);margin-bottom:6px}.metric strong{font-size:16px}.WATCH{color:var(--gold)}.GREEN{color:var(--mint)}.RED{color:var(--red)}.VERIFY{color:var(--muted)}
    section{padding:68px 0}.head{max-width:780px;margin-bottom:28px}.head h2{font-size:clamp(34px,5vw,54px);line-height:1.02;letter-spacing:-.05em;margin:10px 0 14px}.head p{font-size:17px;line-height:1.65;color:var(--muted);margin:0}
    .explore{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{border:1px solid var(--line);border-radius:18px;background:rgba(13,23,22,.82);padding:22px}.num{font-size:11px;color:var(--mint);font-weight:800;letter-spacing:.13em;text-transform:uppercase}.card h3{font-size:21px;letter-spacing:-.025em;margin:13px 0 9px}.card p{font-size:14px;line-height:1.6;color:var(--muted);margin:0}
    .protocols{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.protocol{min-height:152px;display:flex;flex-direction:column;justify-content:space-between}.protocol .picon{width:34px;height:34px;border-radius:11px;border:1px solid var(--line2);background:linear-gradient(135deg,rgba(123,240,189,.13),rgba(127,176,255,.09));display:grid;place-items:center;font-weight:850;color:var(--mint2)}.protocol strong{font-size:21px}.protocol span{font-size:12px;color:var(--muted)}
    .products{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.product{display:flex;flex-direction:column;min-height:340px}.product.featured{border-color:rgba(123,240,189,.43);background:linear-gradient(180deg,rgba(123,240,189,.06),transparent 55%),rgba(13,23,22,.9)}.price{font-size:35px;font-weight:850;letter-spacing:-.045em;margin:18px 0 3px}.price small{font-size:12px;color:var(--muted);font-weight:600}.features{list-style:none;margin:20px 0 26px;padding:0;display:grid;gap:10px;color:var(--soft);font-size:13px}.features li:before{content:"✓";color:var(--mint);margin-right:8px}.product .btn{margin-top:auto}
    .about{display:grid;grid-template-columns:.8fr 1.2fr;gap:18px;align-items:stretch}.aboutbrand{border:1px solid var(--line2);border-radius:22px;padding:28px;background:linear-gradient(145deg,rgba(123,240,189,.08),rgba(127,176,255,.04)),var(--panel)}.aboutbrand .logo{width:58px;height:58px;border-radius:17px}.aboutbrand h3{font-size:28px;letter-spacing:-.04em;margin:22px 0 8px}.aboutbrand p{color:var(--muted);line-height:1.6;margin:0}.aboutcopy{border:1px solid var(--line);border-radius:22px;padding:30px;background:rgba(13,23,22,.78)}.aboutcopy h2{font-size:38px;letter-spacing:-.045em;margin:0 0 14px}.aboutcopy p{color:var(--soft);line-height:1.72;margin:0 0 14px}.aboutcopy .fine{font-size:12px;color:var(--muted)}
    .cta{border:1px solid rgba(123,240,189,.34);border-radius:24px;padding:clamp(28px,5vw,50px);background:radial-gradient(circle at 85% 20%,rgba(123,240,189,.14),transparent 18rem),var(--panel2);display:flex;justify-content:space-between;align-items:center;gap:30px}.cta h2{font-size:clamp(32px,5vw,50px);letter-spacing:-.05em;margin:8px 0 10px}.cta p{max-width:700px;color:var(--muted);line-height:1.6;margin:0}
    .legal{border-top:1px solid var(--line);padding-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:24px;color:var(--muted);font-size:12px;line-height:1.65}footer{padding:30px 0 48px;color:var(--muted);font-size:11px}
    @media(max-width:920px){.hero{grid-template-columns:1fr;gap:28px;padding-top:66px}.visual{min-height:480px}.explore,.products{grid-template-columns:1fr}.protocols{grid-template-columns:repeat(2,1fr)}.about{grid-template-columns:1fr}.cta{flex-direction:column;align-items:flex-start}.legal{grid-template-columns:1fr}}
    @media(max-width:650px){.wrap{width:min(var(--max),calc(100% - 26px))}.navlinks a:not(.btn){display:none}.brandtext span{display:none}h1{font-size:50px}.metrics{grid-template-columns:repeat(2,1fr)}.protocols{grid-template-columns:1fr}.visual{min-height:500px}.radar{height:245px;margin-left:14px;margin-right:14px}.metrics{padding-left:14px;padding-right:14px}section{padding:52px 0}}
  </style>
</head>
<body>
  <nav class="nav">
    <div class="wrap navin">
      <a class="brand" href="/" aria-label="DeFi Yield Intelligence home">
        <span class="logo" aria-hidden="true"></span>
        <span class="brandtext"><strong>DeFi Yield Intelligence</strong><span>A Proof & Signal product</span></span>
      </a>
      <div class="navlinks">
        <a href="#explore">Explore</a><a href="#markets">Markets</a><a href="#access">Access</a><a href="#about">About</a>
        <a class="btn small" href="/go/scanner?source=landing&campaign=nav">Open Scanner</a>
      </div>
    </div>
  </nav>

  <main>
    <div class="wrap hero">
      <div>
        <div class="badge">Live · Read-only · Evidence-backed</div>
        <h1><span class="gradient">See the risk behind the yield.</span></h1>
        <p class="lead">Compare DeFi yield beyond APY. Explore live USDC markets across Aave, Morpho, Compound and Spark with liquidity, concentration, risk signals and evidence coverage in one decision view.</p>
        <div class="actions">
          <a class="btn primary" href="/go/scanner?source=landing&campaign=hero-primary">Explore Live Markets</a>
          <a class="btn" href="#explore">See How It Works</a>
        </div>
        <div class="micro">
          <span class="chip">No deposits</span><span class="chip">No custody</span><span class="chip">No automated execution</span><span class="chip">Risk Model v0.3.1</span>
        </div>
      </div>

      <aside class="visual" aria-label="Thematic live DeFi risk and yield signal map">
        <div class="vhead">
          <div><strong>Live Intelligence Map</strong><span>Ethereum · USDC · multi-protocol</span></div>
          <div id="live-state" class="live">Loading</div>
        </div>
        <div class="radar">
          <div class="node n1"><span class="pulse"></span>Aave</div>
          <div class="node n2"><span class="pulse"></span>Morpho</div>
          <div class="node n3"><span class="pulse"></span>Compound</div>
          <div class="node n4"><span class="pulse"></span>Spark</div>
          <div class="center"><strong id="live-apy">—</strong><span>Observed APY sample</span></div>
        </div>
        <div class="metrics">
          <div class="metric"><span>Risk status</span><strong id="live-risk">—</strong></div>
          <div class="metric"><span>Risk score</span><strong id="live-score">—</strong></div>
          <div class="metric"><span>Evidence</span><strong id="live-coverage">—</strong></div>
          <div class="metric"><span>Mode</span><strong>READ ONLY</strong></div>
        </div>
      </aside>
    </div>

    <section id="explore">
      <div class="wrap">
        <div class="head"><div class="badge">Explore in 60 seconds</div><h2>From rate hunting to decision context.</h2><p>The demo is designed to answer three questions quickly: what pays, what can change the risk, and how complete the evidence is.</p></div>
        <div class="explore">
          <article class="card"><div class="num">01 · Scan</div><h3>Compare live markets</h3><p>Run a fresh read-only scan across the current Ethereum USDC pilot and see protocol-native yield side by side.</p></article>
          <article class="card"><div class="num">02 · Inspect</div><h3>Look beyond headline APY</h3><p>Review liquidity, borrower concentration, evidence coverage and a versioned engineering risk signal instead of treating yield as a single number.</p></article>
          <article class="card"><div class="num">03 · Decide</div><h3>Choose the next evidence need</h3><p>Use the gaps to decide whether you need monitoring, a focused Risk/Yield Report or an API integration.</p></article>
        </div>
      </div>
    </section>

    <section id="markets">
      <div class="wrap">
        <div class="head"><div class="badge">Pilot market coverage</div><h2>Four protocols. One comparable view.</h2><p>The live validation surface is intentionally narrow: Ethereum USDC first, with a multi-protocol, multi-chain and multi-asset architecture underneath.</p></div>
        <div class="protocols">
          <article class="card protocol"><div class="picon">A</div><div><strong>Aave</strong><br><span>Aave V3 reserve market</span></div></article>
          <article class="card protocol"><div class="picon">M</div><div><strong>Morpho</strong><br><span>Morpho Blue isolated markets</span></div></article>
          <article class="card protocol"><div class="picon">C</div><div><strong>Compound</strong><br><span>Compound III USDC market</span></div></article>
          <article class="card protocol"><div class="picon">S</div><div><strong>Spark</strong><br><span>SparkLend reserve market</span></div></article>
        </div>
      </div>
    </section>

    <section id="access">
      <div class="wrap">
        <div class="head"><div class="badge">Choose your depth</div><h2>Explore free. Go deeper only when the need is real.</h2><p>We are validating which paid layer creates recurring value before building unnecessary billing or account complexity.</p></div>
        <div class="products">
          <article class="card product">
            <div class="num">Explore</div><h3>Live Yield Scanner</h3><div class="price">€0</div>
            <ul class="features"><li>Current live market snapshot</li><li>Aave / Morpho / Compound / Spark</li><li>Risk status and evidence coverage</li><li>Optional net-yield assumptions</li></ul>
            <a class="btn" href="/go/scanner?source=landing&campaign=free-card">Explore Scanner</a>
          </article>
          <article class="card product featured">
            <div class="num">Founding Beta</div><h3>PRO Monitoring</h3><div class="price">€9–19 <small>/ month test</small></div>
            <ul class="features"><li>History and change tracking</li><li>Yield / risk alerts</li><li>Saved watchlists</li><li>Expanded evidence access</li></ul>
            <a class="btn primary" href="/go/interest?product=pro&source=landing&campaign=founding-beta">Join Founding Beta</a>
          </article>
          <article class="card product">
            <div class="num">B2B</div><h3>Comparison API</h3><div class="price">Pilot <small>/ validation pricing</small></div>
            <ul class="features"><li>Normalized market data</li><li>Risk/yield comparison layer</li><li>Keyed access path ready</li><li>Wallet / treasury / fintech use cases</li></ul>
            <a class="btn" href="/go/interest?product=b2b&source=landing&campaign=b2b-api">Explore API Access</a>
          </article>
        </div>
      </div>
    </section>

    <section id="about">
      <div class="wrap about">
        <div class="aboutbrand"><div class="logo" aria-hidden="true"></div><h3>DeFi Yield Intelligence</h3><p>A focused Proof & Signal product for evidence-backed DeFi market comparison.</p></div>
        <div class="aboutcopy"><h2>About Proof & Signal</h2><p>Proof & Signal builds independent intelligence products for decisions where headline numbers are not enough. This product turns protocol data, risk evidence and market context into a readable comparison layer without taking custody or executing on behalf of users.</p><p class="fine">The current risk output is an engineering classification, not a probability of loss or investment recommendation. Unknown evidence remains visible as unresolved rather than being replaced with reassuring assumptions.</p></div>
      </div>
    </section>

    <section>
      <div class="wrap cta">
        <div><div class="badge">Founding validation</div><h2>Explore the live scanner before we build more.</h2><p>We want real usage to decide whether the next layer should be monitoring, focused reports, more markets or B2B API depth.</p></div>
        <a class="btn primary" href="/go/scanner?source=landing&campaign=final-explore">Explore Live Intelligence</a>
      </div>
    </section>

    <section>
      <div class="wrap legal">
        <div><strong style="color:var(--text)">Proof & Signal — DeFi Yield Intelligence</strong><br/>Independent, read-only DeFi market intelligence for research and product validation.</div>
        <div>Analytical and educational information only; not investment advice. No deposits, custody, portfolio management or automated execution. DeFi protocols and smart contracts can fail; displayed signals do not guarantee safety or future returns.</div>
      </div>
    </section>
  </main>

  <footer><div class="wrap">© 2026 Proof & Signal. All rights reserved. · DeFi Yield Intelligence is a Proof & Signal product.</div></footer>

  <script>
    const pct=(value,digits=2)=>value==null?"—":Number(value).toFixed(digits)+"%";
    async function loadLiveSample(){
      const state=document.getElementById("live-state");
      try{
        const response=await fetch("/api/v1/scan?chainId=1&asset=USDC&protocols=compound",{headers:{"accept":"application/json"}});
        const payload=await response.json();
        if(!response.ok||!payload.rows?.length)throw new Error("Live sample unavailable");
        const row=payload.rows[0];
        document.getElementById("live-apy").textContent=pct(row.observedGrossApyPct,3);
        const risk=document.getElementById("live-risk");risk.textContent=row.riskStatus||"—";risk.className=row.riskStatus||"VERIFY";
        document.getElementById("live-score").textContent=row.riskScore==null?"—":Number(row.riskScore).toFixed(2);
        document.getElementById("live-coverage").textContent=pct(row.evidenceCoveragePct,0);
        state.textContent=payload.complete?"Live":"Partial";
      }catch(error){state.textContent="Retry in scanner";state.style.color="var(--gold)"}
    }
    loadLiveSample();
  </script>
</body>
</html>`;
}
