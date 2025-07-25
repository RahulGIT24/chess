# Chess App

A real-time chess application built with a modern full-stack architecture. This app offers smooth gameplay, AI opponent integration, and robust move management with persistent clocks—even if users disconnect or leave the game.

## Features

- **React + TypeScript** frontend for a responsive and interactive user interface.
- **Node.js** backend providing APIs and game logic coordination.
- **PostgreSQL** is used as the main database for persistent storage.
- **Redis** serves as an in-memory data store for fast retrieval and management of live chess moves and game states.
- Robust clock management that continues accurately even if a player disconnects or leaves.
- Ability for users to make moves seamlessly without backend issues.
- Game review features to analyze past games. 
- Integration with Google OAuth for user authentication.
- Reconnection capabilities to restore game state if a player disconnects.

## Architecture Overview

- **Frontend**: Built with React and TypeScript, delivering the chessboard UI, move inputs, and clocks.
- **Backend**: Node.js service handling game state management, move validation, clock synchronization, and communication with the database layers.
- **Database**: PostgreSQL for long-term game data persistence, player info, and stats.
- **Caching & Live State**: Redis stores ongoing game moves and time-related data for fast read/write to ensure smooth gameplay experience.

## Installation

### Setup 1.

#### Server Setup

1. Clone the repo using
    ```bash
    git clone https://github.com/RahulGIT24/chess
    ```
2. Navigate to backend directory
    ```bash
    cd server1
    ```
3. Install backend dependencies
    ```bash
    pnpm install
    ```
4. Create a `.env` file in the `server1` directory and configure your database. Take reference from `.env.example`.
5. Genrerate Prisma client
    ```bash
    npx prisma generate
    ```
6. Run migrations to set up the database schema
    ```bash
    npx prisma migrate dev --name init
    ```
7. Build the backend
    ```bash
    pnpm run build
    ```
8. Start the backend server
    ```bash
    pnpm run dev
    ```

#### Client Setup
1. Navigate to the client directory
    ```bash
    cd client
    ```
2. Install client dependencies
    ```bash
    pnpm install
    ```
3. Create a `.env` file in the `client` directory. Take reference from `.env.example`.
4. Start the client
    ```bash
    pnpm run dev
    ``` 

### Make sure while doing setup (without Docker) you have stockfish installed in your system and the path is set in the `.env` file.