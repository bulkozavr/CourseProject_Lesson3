#!/usr/bin/env bash
# Smoke tests for M1: API endpoints for locale-reference
# Usage: bash test/api-test.sh
# Requires: server running on localhost:3000

set -euo pipefail

BASE="http://localhost:3000"
PASS=0
FAIL=0

green() { printf "  \033[32m✓ %s\033[0m\n" "$1"; }
red()   { printf "  \033[31m✗ %s\033[0m\n" "$1"; }

# --- test helpers ---
assert_status() {
  local desc="$1" url="$2" expected="$3"
  local actual
  actual=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$actual" = "$expected" ]; then
    green "$desc (HTTP $actual)"
    PASS=$((PASS + 1))
  else
    red "$desc — expected $expected, got $actual"
    FAIL=$((FAIL + 1))
  fi
}

assert_json_len() {
  local desc="$1" url="$2" min="$3"
  local count
  count=$(curl -s "$url" | node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{const a=JSON.parse(d); console.log(Array.isArray(a)?a.length:'not-array')})")
  if [ "$count" != "not-array" ] && [ "$count" -ge "$min" ]; then
    green "$desc ($count locales)"
    PASS=$((PASS + 1))
  else
    red "$desc — expected array with >=$min items, got $count"
    FAIL=$((FAIL + 1))
  fi
}

assert_field() {
  local desc="$1" url="$2" field="$3" expected="$4"
  local val
  val=$(curl -s "$url" | node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{const o=JSON.parse(d); console.log(o['$field']??'__missing__')})")
  if [ "$val" = "$expected" ]; then
    green "$desc ($field=$val)"
    PASS=$((PASS + 1))
  else
    red "$desc — expected $field=$expected, got $val"
    FAIL=$((FAIL + 1))
  fi
}

echo "--- M1 API Smoke Tests ---"

assert_status "GET /api/locales"              "$BASE/api/locales"         200
assert_status "GET /api/locales/en-AU"        "$BASE/api/locales/en-AU"   200
assert_status "GET /api/locales/unknown"      "$BASE/api/locales/unknown" 404
assert_status "GET /nonexistent"              "$BASE/nonexistent"         404

assert_json_len "Locale list count >= 5"      "$BASE/api/locales"         5

assert_field "en-AU code"   "$BASE/api/locales/en-AU" "code"     "en-AU"
assert_field "en-AU flag"   "$BASE/api/locales/en-AU" "flag"     "🇦🇺"
assert_field "en-AU tld"    "$BASE/api/locales/en-AU" "tld"      ".au"
assert_field "en-AU currency" "$BASE/api/locales/en-AU" "currency" "AUD"

assert_field "pt-BR code"   "$BASE/api/locales/pt-BR" "code"     "pt-BR"
assert_field "pt-BR flag"   "$BASE/api/locales/pt-BR" "flag"     "🇧🇷"
assert_field "ja-JP code"   "$BASE/api/locales/ja-JP" "code"     "ja-JP"

echo ""
echo "--- Results ---"
echo "Passed: $PASS"
echo "Failed: $FAIL"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
