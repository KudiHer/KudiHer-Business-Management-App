# KudiHer-Business-Management-App

KudiHer is an affordable, web-based business management platform that uses AI to automatically analyze sales patterns, optimize inventory, and predict cash flow for small Nigerian businesses.

---

## Why It Exists
Many women-led SMEs in Nigeria rely on manual bookkeeping, limiting visibility into their sales, expenses, and profitability. KudiHer provides a simple, AI-enhanced platform to:  
- Reduce errors in financial records  
- Improve inventory management  
- Generate loan-ready reports for financial inclusion  

By bridging the gap between traditional record-keeping and digital reporting, KudiHer empowers women entrepreneurs to grow their businesses confidently.  

---

## What It Does
**Core Features (MVP):**  
- User registration and business setup  
- Product (SKU) management  
- Sales and expense logging with automatic timestamp  
- Inventory tracking with automatic deductions  
- Profitability calculations and margin indicators  
- Dashboard summarizing revenue, expenses, top SKUs, and stock status  
- Exportable 3-month P&L reports and sales charts  

**Intelligent Behaviors:**  
- Prevents sale if stock is zero  
- Blocks margin calculation if the cost price is missing  
- Real-time dashboard updates  
- AI-assisted inventory predictions (stock depletion & classification)  

---

## How to Run It

### Backend (Node.js & MongoDB)
1. Clone the repository:  
```bash
git clone https://github.com/KudiHer/KudiHer-Business-Management-App.git
cd KudiHer-Business-Management-App/backend
```
2. Install dependency:
```bash
npm install
```
3. Set up environment variables. Create a .env file in the backend folder:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE → Token expiration (default: 30d)
```
4. Start the backend server
```bash
npm start
```
The server will run on: http://localhost:5000

### Frontend (React & Vite)

1. Navigate to frontend folder and install dependencies:
```bash
cd frontend
npm install
```
2. Set environment variables for API base URL:
```bash
VITE_API_URL= http://localhost:5000 (URL of backend API)
```
3. Start the development server:
```bash
npm run dev
```
4. Build for production
```bash
npm run build
```

## Who is it for
1. Users: Women entrepreneurs managing SMEs in Nigeria
2. Developers: Contributors building or extending the platform
3. Investors / Grant Committees: Organizations supporting women-led businesses or digital financial inclusion initiatives


## Technical Architecture
1. Frontend: React + Vite, interactive dashboard and forms
2. Backend: Node.js + Express, REST APIs for authentication, transactions, and reporting
3. Database: MongoDB, storing users, SKUs, transactions, and report data
4. APIs: Expose financial and sales data for dashboards and charts







