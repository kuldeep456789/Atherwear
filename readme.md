# VASTRA

VASTRA is a full-stack, production-grade fashion e-commerce platform built for Men and Women's clothing. Products are fetched live from CJ Dropshipping and served blazingly fast through a Redis caching layer — no static product database needed.


### 1. Backend Setup

Navigate to the backend directory, install dependencies, and configure environment variables.

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

### 2. Frontend Setup

Navigate to the frontend directory, install dependencies, and configure environment variables.

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Environment Variables Overview

Create `.env` files in both `frontend` and `backend` directories based on the `.env.example` files provided. Key variables include:

* `MONGODB_URI`
* `CJ_API_BASE_URL`, `CJ_API_KEY`, `CJ_EMAIL`
* `REDIS_URL`
* `JWT_SECRET`
* `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
* `RESEND_API_KEY`




## now checked the redis store data, 

>> cd backend
>>> npm run check-redis