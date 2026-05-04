<<<<<<< HEAD
# cuacakita
=======
# ClimSight: AI-Powered Localized Climate Advisory

This repository contains the source code for **ClimSight**, an AI-Powered Localized Climate Advisory system with Community-Driven Validation. It features a Retrieval-Augmented Generation (RAG) chatbot and a crowd-sourced validation system.

## Project Structure

- `backend/`: The backend API service handling data pipelines, RAG system, validation engine, and API endpoints.
- `frontend/`: The frontend React application providing the chat interface, contribution forms, and dashboard stats.

## Prerequisites

- Node.js installed
- API Keys: 
  - OpenAI API Key (or Anthropic API Key)

## Setup & Quick Start

### 1. Environment Variables

Create a `.env` file in the root directory (or in the respective `backend/` and `frontend/` directories depending on your setup) based on `.env.example`. Make sure to include your API keys:

```env
OPENAI_API_KEY=sk-...
# Add any other required database or API connection strings
```

### 2. Start the Backend

Open a terminal, navigate to the `backend/` directory, install the dependencies, and start the development server:

```bash
cd backend
npm install
npm run dev
```

### 3. Start the Frontend

Open a new terminal window, navigate to the `frontend/` directory, install the dependencies, and start the frontend application:

```bash
cd frontend
npm install
npm run dev
```

Once both servers are running, open your browser and navigate to the frontend URL (typically `http://localhost:3000` or `http://localhost:5173` depending on the framework).

## Key Features

- **Interactive RAG Chatbot:** Conversational AI that answers climate and weather-related queries.
- **Continuous Feedback Loop:** Automatically prompts users with Call-to-Actions (CTAs) to submit live weather reports based on context.
- **Auto-Validation System:** Compares user-submitted data with official sources (like BMKG and NASA POWER) to calculate a correlation score for validation.
- **Dashboard:** Visualizes real-time contribution statistics and validation rates.
>>>>>>> a58ccda (initial)
