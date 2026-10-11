export function scannerPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>DeFi Vault & Yield Intelligence</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, system-ui, sans-serif; }
    body { margin: 0; background: #0d1117; color: #e6edf3; }
    main { max-width: 1180px; margin: 0 auto; padding: 32px 20px 64px; }
    h1 { margin-bottom: 6px; }
    .muted { color: #8b949e; }
    .panel { border: 1px solid #30363d; border-radius: 12px; padding: 16px; margin-top: 20px; background: #161b22; }
    .controls { display: flex; gap: 12px; flex-wrap: wrap; align-items: end; }
    label { display: grid; gap: 6px; font-size: 13px; color: #8b949e; }
    input, select, button { background: #0d1117; color: #e6edf3; border: 1px solid #30363d; border-radius: 8px; padding: 9px 10px; }
    button { cursor: pointer; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 14px; }
    th, td { text-align: right; padding: 10px 8px; border-bottom: 1px solid #30363d; }
    th:first-child, td:first-child { text-align: left; }
    .risk { font-weight: 700; }
    .GREEN { color: #3fb950; }
    .WATCH { color: #d29922; }
    .RED { color: #f85149; }
    .VERIFY { color: #8b949e; }
    .error { color: #f85149; white-space: pre-wrap; }
    .note { font-size: 12px; color: #8b949e; margin-top: 10px; }
  </style>
</head>
<body>
<main>
  <h1>DeFi Vault & Yield Intelligence</h1>
  <div class="muted">Evidence-backed yield comparison. Read-only analytics. Public capital remains locked.</div>

  <section class="panel">
    <div class="controls">
      <label>Chain
        <select id="chain"><option value="1">Ethereum</option></select>
      </label>
      <label>Asset
        <select id="asset"><option value="USDC">USDC</option></select>
      </label>
      <label>Principal USD (optional net estimate)
        <input id="principal" type="number" min="0" step="1000" placeholder="10000" />
      </label>
      <label>Annual costs USD
        <input id="costs" type="number" min="0" step="1" placeholder="0" />
      </label>
      <button id="scan">Scan live markets</button>
    </div>
    <div id="status" class="note">Free scanner: current snapshot only.</div>
  </section>

  <section class="panel">
    <div id="error" class="error"></div>
    <table>
      <thead>
        <tr>
          <th>Protocol</th>
          <th>Observed APY</th>
          <th>Net est.</th>
          <th>Risk</th>
          <th>Score</th>
          <th>Coverage</th>
          <th>Top borrower</th>
          <th>Risk-adj. yield</th>
        </tr>
      </thead>
      <tbody id="rows"></tbody>
    </table>
    <div id="assumptions" class="note"></div>
  </section>
</main>
<script>
const fmt = (v, digits=2) => v == null ? "—" : Number(v).toFixed(digits) + "%";
const money = (v) => v == null ? "—" : "$" + Number(v).toLocaleString(undefined,{maximumFractionDigits:0});

async function scan() {
  const status = document.getElementById("status");
  const error = document.getElementById("error");
  const body = document.getElementById("rows");
  const assumptions = document.getElementById("assumptions");
  error.textContent = "";
  body.innerHTML = "";
  status.textContent = "Scanning live markets…";

  const params = new URLSearchParams({
    chainId: document.getElementById("chain").value,
    asset: document.getElementById("asset").value
  });

  const principal = document.getElementById("principal").value;
  const costs = document.getElementById("costs").value;
  if (principal) params.set("principalUsd", principal);
  if (costs) params.set("annualCostsUsd", costs);

  try {
    const response = await fetch("/api/v1/scan?" + params.toString());
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Scanner request failed.");

    for (const row of data.rows) {
      const tr = document.createElement("tr");
      const ranking = data.rankingMetric === "riskAdjustedNetYieldPct"
        ? row.riskAdjustedNetYieldPct
        : row.riskAdjustedObservedYieldPct;
      tr.innerHTML =
        "<td><strong>" + row.protocol + "</strong><br><span class='muted'>" + money(row.suppliedUsd) + " supplied</span></td>" +
        "<td>" + fmt(row.observedGrossApyPct,3) + "</td>" +
        "<td>" + fmt(row.estimatedNetApyPct,3) + "</td>" +
        "<td class='risk " + row.riskStatus + "'>" + row.riskStatus + "</td>" +
        "<td>" + (row.riskScore == null ? "—" : row.riskScore.toFixed(2)) + "</td>" +
        "<td>" + fmt(row.evidenceCoveragePct,0) + "</td>" +
        "<td>" + fmt(row.topBorrowerPct,2) + "</td>" +
        "<td>" + fmt(ranking,3) + "</td>";
      body.appendChild(tr);
    }

    if (data.errors?.length) {
      error.textContent = data.errors.map(e => e.protocol + ": " + e.message).join("\n");
    }

    assumptions.textContent = data.assumptions.note;
    status.textContent =
      (data.complete ? "Complete" : "Partial") +
      " · Risk model " + data.riskModelVersion +
      " · " + new Date(data.generatedAt).toLocaleString();
  } catch (e) {
    error.textContent = e.message || String(e);
    status.textContent = "Scan failed.";
  }
}

document.getElementById("scan").addEventListener("click", scan);
</script>
</body>
</html>`;
}
