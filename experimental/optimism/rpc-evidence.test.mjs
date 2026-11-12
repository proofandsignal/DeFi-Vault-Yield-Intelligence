import test from "node:test";
import assert from "node:assert/strict";
import {verifyRpcEvidence, compareRpcEvidence, captureTwoRpcSources} from "./rpc-evidence.mjs";
const h = "0x" + "a".repeat(64);
const p = "0x" + "b".repeat(64);
const b = {number:"0x10",hash:h,parentHash:p,timestamp:"0x69000000"};
test("valid OP chain identity requires complete block fields",()=>{
  assert.equal(verifyRpcEvidence("0xa",b).valid,true);
  assert.equal(verifyRpcEvidence("0x1",b).valid,false);
  assert.equal(verifyRpcEvidence("0xa",{...b,hash:"fake"}).valid,false);
});
test("matching RPC blocks are only identity agreement, not independent proof",()=>{
  const result=compareRpcEvidence({chainId:"0xa",block:b},{chainId:"0xa",block:{...b}});
  assert.equal(result.status,"MATCHED_BLOCK_IDENTITY");
  assert.equal(result.independentSourceVerification,false);
});
test("mismatched hashes are rejected",()=>{
  assert.equal(compareRpcEvidence({chainId:"0xa",block:b},{chainId:"0xa",block:{...b,hash:p}}).status,"NOT_VERIFIED");
});
test("read-only capture sends only eth_* inspection methods and records no URLs",async()=>{
  const calls=[];
  const fakeFetch=async(url,options)=>{
    const {method,params}=JSON.parse(options.body); calls.push({url,method,params});
    const result=method==="eth_chainId"?"0xa":method==="eth_blockNumber"?"0x10":b;
    return {ok:true,json:async()=>({jsonrpc:"2.0",id:1,result})};
  };
  const result=await captureTwoRpcSources("https://rpc-a.example.org","https://rpc-b.example.org",fakeFetch);
  assert.equal(result.comparison.status,"MATCHED_BLOCK_IDENTITY");
  assert.equal(result.verdict,"INDEPENDENT_REVIEW_REQUIRED");
  assert.equal(JSON.stringify(result).includes("rpc-a"),false);
  assert.deepEqual(new Set(calls.map(c=>c.method)),new Set(["eth_chainId","eth_blockNumber","eth_getBlockByNumber"]));
});
test("duplicate endpoint and non-HTTPS endpoint blocked",async()=>{
  await assert.rejects(captureTwoRpcSources("https://a.example","https://a.example"),/DISTINCT/);
  await assert.rejects(captureTwoRpcSources("http://a.example","https://b.example"),/HTTPS/);
});
test("chain mismatch fails closed",async()=>{
  const fake=async()=>({ok:true,json:async()=>({result:"0x1"})});
  await assert.rejects(captureTwoRpcSources("https://a.example","https://b.example",fake),/CHAIN_OR_HEIGHT_INVALID/);
});
