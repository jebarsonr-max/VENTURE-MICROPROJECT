# CAMPUSNEX — Smart Campus Delivery Ecosystem
> **"Your Campus. Your Delivery. Your Time."**  
> *An Academic Full-Stack Micro-Project in Smart Mobility & Autonomous Logistics (Integrating CO1, CO3, and CO4).*

Please refer to the full master documentation in [campusnex/README.md](./campusnex/README.md).

### Quick Start
To launch both frontend and backend concurrently:
- On Windows: Run `start.bat` or `powershell -ExecutionPolicy Bypass -File .\start.ps1`
- Or run manually:
  ```powershell
  # Terminal 1: Backend
  cd campusnex/backend
  python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

  # Terminal 2: Frontend
  cd campusnex/frontend
  npm run dev
  ```

Frontend Web App: [http://localhost:5173](http://localhost:5173)  
Backend REST API & Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

