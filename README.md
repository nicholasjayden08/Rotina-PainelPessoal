# Routinely

Routinely is a full-stack personal productivity dashboard designed to help users build consistent routines through task management, habit tracking, focus sessions, notes, and data-driven insights.

The application follows a local-first approach, storing all data on the user's machine without requiring authentication or cloud services.

---

## Overview

Routinely centralizes the essential tools for daily organization into a single application.

Instead of switching between multiple apps for tasks, habits, notes and productivity tracking, Routinely provides a unified experience focused on consistency rather than complexity.

The project consists of a Spring Boot REST API and a React frontend communicating through HTTP.

---

## Features

- Daily task management
- Daily habits tracking
- Atomic habits tracking
- Water intake tracking
- Mood and sleep tracking
- Habit consistency analysis
- Monthly statistics
- Automatic monthly insights
- Focus sessions
- Markdown notes
- Local-first data storage

---

## Tech Stack

### Backend

- Java 21
- Spring Boot 3
- Spring Data JPA
- Maven

### Frontend

- React
- Vite
- JavaScript

### Database

- H2 Database (file-based)

---

## Architecture

```
frontend/
    │
React + Vite
    │
REST API
    │
Spring Boot
    │
Spring Data JPA
    │
H2 Database
```

The backend exposes a REST API consumed by the React frontend. All application data is persisted locally using an H2 file-based database.

---

## Project Structure

```
routinely/
├── backend/
│   ├── src/
│   ├── data/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

Before running the project, make sure the following tools are installed:

- Java 21
- Node.js 18 or newer
- Maven (or IntelliJ IDEA with Maven support)

---

## Running the Backend

Open the `backend` directory as a Maven project.

Start the Spring Boot application by running:

```
RotinaApplication
```

The API will be available at:

```
http://localhost:8080
```

You can verify that everything is working by accessing:

```
http://localhost:8080/api/tarefas
```

If successful, the API should return an empty JSON array (`[]`) on a fresh database.

---

## Running the Frontend

Navigate to the frontend directory.

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

The backend must be running before opening the frontend.

---

## Accessing from Mobile Devices

To access the application from another device connected to the same local network:

Start Vite exposing the host:

```bash
npm run dev -- --host
```

Update the allowed origins inside:

```
backend/src/main/java/com/nicholas/rotina/config/CorsConfig.java
```

adding your local frontend address.

Example:

```
http://192.168.1.42:5173
```

Restart the backend after updating the CORS configuration.

---

## Data Persistence

Routinely stores all information locally using an H2 file-based database.

Database location:

```
backend/data/rotina.mv.db
```

Backing up the application only requires copying this file.

---

## Roadmap

Completed

- Daily task management
- Daily habits
- Atomic habits
- Water intake tracking
- Mood tracking
- Sleep tracking
- Statistics dashboard
- Habit consistency
- Monthly insights
- Focus mode
- Markdown notes

Planned

- Data export
- Custom themes
- Cloud synchronization
- User authentication

---

## License

This project is currently available for educational and personal portfolio purposes.
