export function scannerPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="theme-color" content="#07100f" />
  <meta name="description" content="Explore live USDC lending markets across Aave, Morpho, Compound and Spark with risk and evidence context." />
  <title>Explore Live Markets — DeFi Yield Intelligence</title>
  <style>
    :root{
      color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      --bg:#060c0c;--panel:#0d1716;--panel2:#111e1c;--line:rgba(194,255,229,.13);--line2:rgba(194,255,229,.25);
      --text:#f4fbf8;--soft:#c9d8d2;--muted:#8fa49c;--mint:#7bf0bd;--mint2:#b2f7d8;--gold:#f0c974;--red:#ff807a;--max:1220px;
    }
    *{box-sizing:border-box}body{margin:0;background:
      radial-gradient(circle at 8% 4%,rgba(123,240,189,.12),transparent 25rem),
      radial-gradient(circle at 92% 8%,rgba(127,176,255,.08),transparent 23rem),
      linear-gradient(180deg,#060c0c,#081211 55%,#060c0c);color:var(--text);min-height:100vh}
    a{color:inherit;text-decoration:none}.wrap{width:min(var(--max),calc(100% - 36px));margin:0 auto}
    .top{border-bottom:1px solid var(--line);background:rgba(6,12,12,.8);backdrop-filter:blur(18px);position:sticky;top:0;z-index:20}
    .topin{min-height:70px;display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{display:flex;align-items:center;gap:11px}
    .logo{width:36px;height:36px;border-radius:11px;position:relative;border:1px solid var(--line2);background:
      radial-gradient(circle at 50% 50%,rgba(123,240,189,.24) 0 16%,transparent 17%),
      radial-gradient(circle at 50% 50%,transparent 0 39%,rgba(123,240,189,.7) 40% 43%,transparent 44%),
      linear-gradient(135deg,rgba(123,240,189,.18),rgba(127,176,255,.12))}
    .logo:after{content:"";position:absolute;width:15px;height:2px;left:10px;top:17px;background:var(--mint);border-radius:99px;transform:rotate(-33deg)}
    .brand strong{display:block;font-size:14px}.brand span{display:block;color:var(--muted);font-size:10px;margin-top:2px}
    .back{font-size:12px;color:var(--muted);padding:9px 12px;border:1px solid var(--line);border-radius:10px}.back:hover{color:var(--text);border-color:var(--line2)}
    main{padding:48px 0 70px}.intro{display:flex;justify-content:space-between;align-items:end;gap:30px;margin-bottom:24px}
    .eyebrow{color:var(--mint2);font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.intro h1{font-size:clamp(38px,6vw,66px);letter-spacing:-.055em;line-height:.98;margin:10px 0 12px}.intro p{margin:0;color:var(--soft);font-size:17px;line-height:1.6;max-width:760px}
    .statuspill{flex:0 0 auto;border:1px solid var(--line2);border-radius:999px;padding:10px 12px;color:var(--mint);font-size:11px;background:rgba(123,240,189,.04)}
    .shell{display:grid;grid-template-columns:300px minmax(0,1fr);gap:16px;align-items:start}
    .panel{border:1px solid var(--line);border-radius:18px;background:rgba(13,23,22,.86);box-shadow:0 24px 70px rgba(0,0,0,.18)}
    .controls{padding:20px;position:sticky;top:88px}.controls h2{font-size:17px;margin:0 0 6px}.controls>p{font-size:12px;color:var(--muted);line-height:1.5;margin:0 0 18px}
    label{display:grid;gap:7px;font-size:11px;color:var(--muted);margin-bottom:13px;text-transform:uppercase;letter-spacing:.08em;font-weight:700}
    input,select,button{font:inherit;border-radius:11px;border:1px solid var(--line2);background:#09110f;color:var(--text);min-height:44px;padding:0 11px}
    input:focus,select:focus{outline:2px solid rgba(123,240,189,.22);border-color:rgba(123,240,189,.5)}
    button{width:100%;cursor:pointer;background:var(--mint);color:#04100b;font-weight:850;border-color:var(--mint);margin-top:4px;transition:.16s ease}
    button:hover{transform:translateY(-1px);background:var(--mint2)}
    .note{font-size:11px;line-height:1.55;color:var(--muted);margin-top:12px}.legend{margin-top:18px;padding-top:16px;border-top:1px solid var(--line)}
    .legend strong{display:block;font-size:12px;margin-bottom:9px}.legendrow{display:flex;justify-content:space-between;gap:12px;font-size:11px;color:var(--muted);margin:7px 0}.dot{width:7px;height:7px;border-radius:50%;display:inline-block;margin-right:6px}.g{background:var(--mint)}.w{background:var(--gold)}.r{background:var(--red)}.v{background:#71817b}
    .result{overflow:hidden}.rhead{padding:18px 20px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:16px;align-items:center}.rhead strong{font-size:14px}.rhead span{font-size:11px;color:var(--muted)}
    .error{color:var(--red);font-size:12px;white-space:pre-wrap;padding:0 20px}
    .tablewrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:13px;min-width:840px}th,td{text-align:right;padding:14px 12px;border-bottom:1px solid var(--line);vertical-align:middle}th{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;font-weight:800;background:rgba(255,255,255,.012)}th:first-child,td:first-child{text-align:left}
    td strong{font-size:14px}.sub{display:block;color:var(--muted);font-size:10px;margin-top:3px}.risk{font-weight:850}.GREEN{color:var(--mint)}.WATCH{color:var(--gold)}.RED{color:var(--red)}.VERIFY{color:var(--muted)}
    .after{padding:16px 20px 20px}.assumptions{font-size:11px;color:var(--muted);line-height:1.55}.next{margin-top:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.mini{border:1px solid var(--line);border-radius:12px;padding:13px;background:rgba(255,255,255,.014)}.mini strong{display:block;font-size:12px;margin-bottom:5px}.mini span{font-size:11px;line-height:1.45;color:var(--muted)}
    .explorebar{margin-top:16px;border:1px solid rgba(123,240,189,.28);border-radius:16px;background:linear-gradient(90deg,rgba(123,240,189,.06),rgba(127,176,255,.03));padding:17px 18px;display:flex;justify-content:space-between;gap:18px;align-items:center}.explorebar strong{font-size:13px}.explorebar span{display:block;font-size:11px;color:var(--muted);margin-top:4px}.smallbtn{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 12px;border:1px solid var(--line2);border-radius:10px;font-size:11px;font-weight:750}
    footer{padding:0 0 40px;color:var(--muted);font-size:10px}
    @media(max-width:930px){.shell{grid-template-columns:1fr}.controls{position:static}.intro{align-items:flex-start;flex-direction:column}.next{grid-template-columns:1fr}}
    @media(max-width:650px){.wrap{width:min(var(--max),calc(100% - 24px))}.brand span{display:none}main{padding-top:34px}.intro h1{font-size:43px}.tablewrap{overflow:visible}table{min-width:0}thead{display:none}tbody{display:grid;gap:12px;padding:14px}tr{display:grid;border:1px solid var(--line);border-radius:14px;padding:4px 12px;background:rgba(0,0,0,.12)}td{display:flex;justify-content:space-between;gap:12px;text-align:right!important;padding:10px 0;border-bottom:1px solid var(--line)}td:last-child{border-bottom:0}td:before{content:attr(data-label);color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.06em;text-align:left}.explorebar{flex-direction:column;align-items:flex-start}}
  </style>
</head>
<body>
  <header class="top">
    <div class="wrap topin">
      <a class="brand" href="/"><span class="logo" aria-hidden="true"></span><span><strong>DeFi Yield Intelligence</strong><span>A Proof & Signal product</span></span></a>
      <a class="back" href="/">← Product overview</a>
    </div>
  </header>

  <main>
    <div class="wrap">
      <div class="intro">
        <div><div class="eyebrow">Explore live intelligence</div><h1>Scan the market.<br/>Inspect the evidence.</h1><p>Compare live Ethereum USDC lending markets without treating APY as the whole story. This scanner is read-only and does not move funds.</p></div>
        <div class="statuspill">LIVE · READ ONLY</div>
      </div>

      <div class="shell">
        <aside class="panel controls">
          <h2>Build your scan</h2><p>Start with the pilot market, then add assumptions only if you want an estimated net-yield view.</p>
          <label>Chain<select id="chain"><option value="1">Ethereum</option></select></label>
          <label>Asset<select id="asset"><option value="USDC">USDC</option></select></label>
          <label>Principal USD · optional<input id="principal" type="number" min="0" step="1000" placeholder="10000" /></label>
          <label>Annual costs USD · optional<input id="costs" type="number" min="0" step="1" placeholder="0" /></label>
          <button id="scan">Scan live markets</button>
          <div id="status" class="note">Free scanner · current snapshot only.</div>
          <div class="legend">
            <strong>Risk signal guide</strong>
            <div class="legendrow"><span><i class="dot g"></i>GREEN</span><span>lower observed concern</span></div>
            <div class="legendrow"><span><i class="dot w"></i>WATCH</span><span>review context</span></div>
            <div class="legendrow"><span><i class="dot r"></i>RED</span><span>material concern</span></div>
            <div class="legendrow"><span><i class="dot v"></i>VERIFY</span><span>evidence unresolved</span></div>
          </div>
        </aside>

        <section class="panel result">
          <div class="rhead"><div><strong>Live comparison</strong><span id="stamp">Run a scan to populate the view.</span></div><span>Risk Model v0.3.1</span></div>
          <div id="error" class="error"></div>
          <div class="tablewrap">
            <table>
              <thead><tr><th>Protocol</th><th>Observed APY</th><th>Net est.</th><th>Risk</th><th>Score</th><th>Coverage</th><th>Top borrower</th><th>Risk-adj. yield</th></tr></thead>
              <tbody id="rows"></tbody>
            </table>
          </div>
          <div class="after">
            <div id="assumptions" class="assumptions">Net estimates appear only when you provide explicit principal/cost assumptions.</div>
            <div class="next">
              <div class="mini"><strong>1 · Compare</strong><span>Look for differences in yield, risk status and evidence completeness.</span></div>
              <div class="mini"><strong>2 · Question</strong><span>A high APY with weak evidence is not automatically a stronger decision.</span></div>
              <div class="mini"><strong>3 · Explore deeper</strong><span>Monitoring, reports and API access are tested only when repeated need is clear.</span></div>
            </div>
            <div class="explorebar"><div><strong>Need recurring monitoring or a decision-ready report?</strong><span>Founding access is being validated with real users before we build more.</span></div><a class="smallbtn" href="/#access">Explore PRO & B2B</a></div>
          </div>
        </section>
      </div>
    </div>
  </main>

  <footer><div class="wrap">© 2026 Proof & Signal. All rights reserved. · Analytical and educational information only; not investment advice.</div></footer>

<script>
const fmt=(v,digits=2)=>v==null?"—":Number(v).toFixed(digits)+"%";
const money=(v)=>v==null?"—":"$"+Number(v).toLocaleString(undefined,{maximumFractionDigits:0});

async function scan(){
  const status=document.getElementById("status");
  const error=document.getElementById("error");
  const body=document.getElementById("rows");
  const assumptions=document.getElementById("assumptions");
  const stamp=document.getElementById("stamp");
  error.textContent="";body.innerHTML="";status.textContent="Scanning live markets…";stamp.textContent="Refreshing protocol observations…";

  const pageParams=new URLSearchParams(window.location.search);
  const params=new URLSearchParams({chainId:document.getElementById("chain").value,asset:document.getElementById("asset").value,ui:"1"});
  for(const key of ["utm_source","utm_medium","utm_campaign","utm_content","source","campaign","intent"]){const value=pageParams.get(key);if(value)params.set(key,value)}
  const principal=document.getElementById("principal").value;
  const costs=document.getElementById("costs").value;
  if(principal)params.set("principalUsd",principal);
  if(costs)params.set("annualCostsUsd",costs);

  try{
    const response=await fetch("/api/v1/scan?"+params.toString());
    const data=await response.json();
    if(!response.ok)throw new Error(data.error?.message||"Scanner request failed.");

    for(const row of data.rows){
      const tr=document.createElement("tr");
      const ranking=data.rankingMetric==="riskAdjustedNetYieldPct"?row.riskAdjustedNetYieldPct:row.riskAdjustedObservedYieldPct;
      tr.innerHTML=
        "<td data-label='Protocol'><span><strong>"+row.protocol+"</strong><span class='sub'>"+money(row.suppliedUsd)+" supplied</span></span></td>"+
        "<td data-label='Observed APY'>"+fmt(row.observedGrossApyPct,3)+"</td>"+
        "<td data-label='Net est.'>"+fmt(row.estimatedNetApyPct,3)+"</td>"+
        "<td data-label='Risk' class='risk "+row.riskStatus+"'>"+row.riskStatus+"</td>"+
        "<td data-label='Score'>"+(row.riskScore==null?"—":row.riskScore.toFixed(2))+"</td>"+
        "<td data-label='Coverage'>"+fmt(row.evidenceCoveragePct,0)+"</td>"+
        "<td data-label='Top borrower'>"+fmt(row.topBorrowerPct,2)+"</td>"+
        "<td data-label='Risk-adj. yield'>"+fmt(ranking,3)+"</td>";
      body.appendChild(tr);
    }

    if(data.errors?.length)error.textContent=data.errors.map(e=>e.protocol+": "+e.message).join("\\n");
    assumptions.textContent=data.assumptions.note;
    status.textContent=(data.complete?"Complete":"Partial")+" · "+new Date(data.generatedAt).toLocaleString();
    stamp.textContent=data.rows.length+" live market observations · "+(data.complete?"complete":"partial")+" evidence pull";
  }catch(e){
    error.textContent=e.message||String(e);status.textContent="Scan failed.";stamp.textContent="Live refresh unavailable — retry.";
  }
}
document.getElementById("scan").addEventListener("click",scan);
scan();
</script>
</body>
</html>`;
}
