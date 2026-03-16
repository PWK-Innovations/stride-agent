#!/bin/bash
echo "Running Stride Agent tests..."

# Start dev server in background
npm run dev > /tmp/stride-test-server.log 2>&1 &
SERVER_PID=$!
sleep 5

# Detect port
PORT=3000
curl -s http://localhost:3000 > /dev/null 2>&1 || PORT=3001

PASS=0
FAIL=0

# Test 1: Calculator
echo "Test 1: Calculator..."
RESULT=$(curl -s -X POST http://localhost:$PORT/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is 247 * 18?","sessionId":"test-calc"}')
if echo "$RESULT" | grep -q '"toolUsed":"calculator"'; then
  echo '  {"test": "calculator", "status": "pass"}'
  PASS=$((PASS + 1))
else
  echo '  {"test": "calculator", "status": "fail", "output": "'"$RESULT"'"}' >&2
  FAIL=$((FAIL + 1))
fi

# Test 2: Web Search
echo "Test 2: Web Search..."
RESULT=$(curl -s -X POST http://localhost:$PORT/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Who won the last Super Bowl?","sessionId":"test-search"}')
if echo "$RESULT" | grep -q '"toolUsed":"web_search"'; then
  echo '  {"test": "web_search", "status": "pass"}'
  PASS=$((PASS + 1))
else
  echo '  {"test": "web_search", "status": "fail", "output": "'"$RESULT"'"}' >&2
  FAIL=$((FAIL + 1))
fi

# Test 3: Memory
echo "Test 3: Memory..."
RESULT=$(curl -s -X POST http://localhost:$PORT/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Now multiply that result by 3","sessionId":"test-calc"}')
if echo "$RESULT" | grep -q "13338\|13,338"; then
  echo '  {"test": "memory", "status": "pass"}'
  PASS=$((PASS + 1))
else
  echo '  {"test": "memory", "status": "fail", "output": "'"$RESULT"'"}' >&2
  FAIL=$((FAIL + 1))
fi

# Test 4: Validation
echo "Test 4: Validation..."
RESULT=$(curl -s -X POST http://localhost:$PORT/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"","sessionId":""}')
if echo "$RESULT" | grep -q '"error"'; then
  echo '  {"test": "validation", "status": "pass"}'
  PASS=$((PASS + 1))
else
  echo '  {"test": "validation", "status": "fail", "output": "'"$RESULT"'"}' >&2
  FAIL=$((FAIL + 1))
fi

# Cleanup
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

# Summary
TOTAL=$((PASS + FAIL))
echo ""
echo "{\"status\": \"$([ $FAIL -eq 0 ] && echo 'pass' || echo 'fail')\", \"total\": $TOTAL, \"passed\": $PASS, \"failed\": $FAIL}"

if [ $FAIL -gt 0 ]; then
  exit 1
else
  exit 0
fi
