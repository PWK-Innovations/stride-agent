#!/bin/bash
echo "Building Stride Agent..."
npm run build
if [ $? -eq 0 ]; then
  echo '{"status": "pass", "message": "Build successful"}'
  exit 0
else
  echo '{"status": "fail", "message": "Build failed"}' >&2
  exit 1
fi
