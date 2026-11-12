// Experimental OP Mainnet RPC identity capture. Never used by production scanner.
export const OP_CHAIN_ID = "0xa";
const HASH = /^0x[0-9a-fA-F]{64}$/;
const HEX = /^0x[0-9a-fA-F]+$/;
export function verifyRpcEvidence(chainId, block) {
  const errors = [];
  if (chainId !== OP_CHAIN_ID) errors.push("CHAIN_ID_MISMATCH");
  if (!block || typeof block !== "object" || !HEX.test(block.number ?? "")) errors.push("BLOCK_NUMBER_INVALID");
  if (!HASH.test(block?.hash ?? "")) errors.push("BLOCK_HASH_INVALID");
  if (!HASH.test(block?.parentHash ?? "")) errors.push("PARENT_HASH_INVALID");
  if (!HEX.test(block?.timestamp ?? "")) errors.push("TIMESTAMP_INVALID");
  return { valid: errors.length === 0, errors };
}
export function compareRpcEvidence(a, b) {
  const aCheck = verifyRpcEvidence(a?.chainId, a?.block);
  const bCheck = verifyRpcEvidence(b?.chainId, b?.block);
  const matched = aCheck.valid && bCheck.valid &&
    a.block.number === b.block.number &&
    a.block.hash.toLowerCase() === b.block.hash.toLowerCase() &&
    a.block.parentHash.toLowerCase() === b.block.parentHash.toLowerCase();
  return Object.freeze({
    status: matched ? "MATCHED_BLOCK_IDENTITY" : "NOT_VERIFIED",
    independentSourceVerification: false,
    errors: [...aCheck.errors.map(x => "A_" + x), ...bCheck.errors.map(x => "B_" + x)],
    blockNumber: matched ? a.block.number : null,
    blockHash: matched ? a.block.hash.toLowerCase() : null,
    limitations: "RPC response agreement is not independent verification or proof of DeFi market accuracy",
  });
}
async function rpc(url, method, params, fetchFn) {
  const response = await fetchFn(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({jsonrpc:"2.0",id:1,method,params}),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("RPC_HTTP_FAILURE");
  const data = await response.json();
  if (data?.error || data?.result === undefined || data?.result === null) throw new Error("RPC_INVALID_RESPONSE");
  return data.result;
}
export async function captureTwoRpcSources(urlA, urlB, fetchFn = fetch) {
  for (const url of [urlA, urlB]) {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error("HTTPS_RPC_REQUIRED");
  }
  if (urlA === urlB) throw new Error("DISTINCT_ENDPOINTS_REQUIRED");
  // One provider determines a candidate block height; each must return that exact height.
  const [chainA, chainB, latest] = await Promise.all([
    rpc(urlA, "eth_chainId", [], fetchFn),
    rpc(urlB, "eth_chainId", [], fetchFn),
    rpc(urlA, "eth_blockNumber", [], fetchFn),
  ]);
  if (chainA !== OP_CHAIN_ID || chainB !== OP_CHAIN_ID || typeof latest !== "string" || !HEX.test(latest)) {
    throw new Error("CHAIN_OR_HEIGHT_INVALID");
  }
  const [blockA, blockB] = await Promise.all([
    rpc(urlA, "eth_getBlockByNumber", [latest, false], fetchFn),
    rpc(urlB, "eth_getBlockByNumber", [latest, false], fetchFn),
  ]);
  const a = {chainId:chainA,block:blockA}, b = {chainId:chainB,block:blockB};
  return Object.freeze({
    chain: "OP Mainnet",
    checkedAt: new Date().toISOString(),
    sourceCount: 2,
    sourceIdentity: "SELF_DECLARED_ENDPOINTS",
    comparison: compareRpcEvidence(a,b),
    blockA: {number:blockA?.number ?? null,hash:blockA?.hash ?? null},
    blockB: {number:blockB?.number ?? null,hash:blockB?.hash ?? null},
    verdict: "INDEPENDENT_REVIEW_REQUIRED",
  });
}
