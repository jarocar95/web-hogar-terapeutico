#!/bin/bash

# Development script for running E2E tests
# This script ensures the development server is running and then executes tests

set -e

echo "🚀 Starting E2E Test Environment..."

# Check if port 8080 is available
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Server is already running on port 8080"
else
    echo "🏗️  Starting development server..."
    npm start &
    SERVER_PID=$!

    # Wait for server to be ready
    echo "⏳ Waiting for server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:8080 > /dev/null 2>&1; then
            echo "✅ Server is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ Server failed to start within 30 seconds"
            exit 1
        fi
        sleep 1
    done
fi

# Run the tests
echo "🧪 Running E2E tests..."
if [ -n "$1" ]; then
    npm run test:e2e -- "$@"
else
    npm run test:e2e
fi

# Clean up if we started the server
if [ ! -z "$SERVER_PID" ]; then
    echo "🛑 Stopping development server..."
    kill $SERVER_PID
fi

echo "✅ E2E tests completed!"