Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       STARTING CAMPUSNEX PLATFORM SERVERS                " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# Start Backend in new process
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd campusnex/backend; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# Start Frontend in new process
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd campusnex/frontend; npm run dev"

Write-Host "Backend running at:  http://127.0.0.1:8000 (Docs: /docs)" -ForegroundColor Yellow
Write-Host "Frontend running at: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Demo Credentials: student@campusnex.edu / password123" -ForegroundColor Green

