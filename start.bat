@echo off
echo ==========================================================
echo        STARTING CAMPUSNEX PLATFORM SERVERS                
echo ==========================================================

start "CAMPUSNEX Backend (FastAPI)" cmd /k "cd campusnex\backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "CAMPUSNEX Frontend (Vite React)" cmd /k "cd campusnex\frontend && npm run dev"

echo Backend URL:  http://127.0.0.1:8000
echo Frontend URL: http://localhost:5173
echo.
echo Demo Accounts:
echo - Student: student@campusnex.edu / password123
echo - Vendor:  vendor@campusnex.edu / password123
echo - Admin:   admin@campusnex.edu / password123
pause

