#!/bin/bash

echo "🔍 CONGRATSAI AUDITIONS - SYSTEM HEALTH CHECK"
echo "=============================================="
echo ""

# Check 1: Backend Server
echo "1️⃣ BACKEND SERVER (Port 4000)"
if lsof -ti:4000 > /dev/null 2>&1; then
    echo "   ✅ Running (PID: $(lsof -ti:4000))"
    # Test API
    if curl -s http://localhost:4000/api/opportunities > /dev/null 2>&1; then
        COUNT=$(curl -s http://localhost:4000/api/opportunities | jq '. | length' 2>/dev/null || echo "?")
        echo "   ✅ API responding (${COUNT} opportunities)"
    else
        echo "   ⚠️  Process running but API not responding"
    fi
else
    echo "   ❌ NOT running"
fi
echo ""

# Check 2: Frontend Server
echo "2️⃣ FRONTEND SERVER (Port 8080)"
if lsof -ti:8080 > /dev/null 2>&1; then
    echo "   ✅ Running (PID: $(lsof -ti:8080))"
else
    echo "   ❌ NOT running"
    echo "   💡 Start with: npm run dev"
fi
echo ""

# Check 3: Environment Variables
echo "3️⃣ ENVIRONMENT VARIABLES"
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    if grep -q "SUPABASE_URL=https://uvszvjbzcvkgktrvavqe" .env 2>/dev/null; then
        echo "   ✅ Correct Supabase URL configured"
    else
        echo "   ⚠️  Supabase URL might be wrong"
    fi
else
    echo "   ❌ .env file missing"
fi
echo ""

# Check 4: Database Connection
echo "4️⃣ DATABASE CONNECTION"
cd "$(dirname "$0")"
if node -e "require('dotenv').config({ path: './.env' }); const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY); supabase.from('opportunities').select('count').single().then(({ data, error }) => { if (error && error.code !== 'PGRST116') { console.log('   ❌ Database connection failed'); process.exit(1); } console.log('   ✅ Database connected'); }).catch(() => { console.log('   ❌ Connection error'); process.exit(1); });" 2>/dev/null; then
    :
else
    echo "   ⚠️  Could not verify database connection"
fi
echo ""

# Check 5: Node Modules
echo "5️⃣ DEPENDENCIES"
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules installed"
else
    echo "   ❌ node_modules missing"
    echo "   💡 Run: npm install"
fi
echo ""

# Summary
echo "=============================================="
echo "📋 QUICK COMMANDS:"
echo "   Start Backend:  cd backend && node server.js"
echo "   Start Frontend: npm run dev"
echo "   Test API:       curl http://localhost:4000/api/opportunities"
echo "   View Logs:      tail -f backend/uploads/submissions.log"
echo ""
