# Contributing to BrainMessenger

Welcome! We are thrilled that you are interested in contributing to BrainMessenger. This project is built on the principles of **quality, systematic thinking, and creating real value** (Principle 2, 3, 9). Your contributions are essential for making BrainMessenger the best communication platform it can be.

This document outlines the guidelines and processes for contributing to this project. By participating, you are expected to uphold these guidelines.

## Table of Contents

1.  [Code of Conduct](#code-of-conduct)
2.  [How Can I Contribute?](#how-can-i-contribute)
    *   [Reporting Bugs](#reporting-bugs)
    *   [Suggesting Enhancements](#suggesting-enhancements)
    *   [Your First Code Contribution](#your-first-code-contribution)
3.  [Development Setup](#development-setup)
4.  [Styleguides & Standards](#styleguides--standards)
5.  [Pull Request Process](#pull-request-process)

## Code of Conduct

We take our open-source community seriously and hold ourselves and other contributors to high standards of communication. By participating and contributing to this project, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). (Примечание: Тебе нужно будет создать этот файл CODE_OF_CONDUCT.md, используя стандартный шаблон, например, Contributor Covenant).

## How Can I Contribute?

### Reporting Bugs

Bugs are tracked as GitHub issues. Before creating a bug report, please check the list of existing issues to see if the problem has already been reported.

When creating a bug report, please include:
*   A clear and descriptive title.
*   **Steps to reproduce** the behavior.
*   Expected behavior vs. Actual behavior.
*   Screenshots or GIFs if applicable.
*   Your environment (OS, Browser version).

### Suggesting Enhancements

Feature requests are welcome. Please open a GitHub issue and describe the feature, the problem it solves, and why it would be valuable for BrainMessenger.

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through issues labeled `good first issue` or `help wanted`.

## Development Setup

To set up your local development environment, please follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Induktr/BrainMessenger.git
    cd BrainMessenger
    ```

2.  **Backend Setup (NestJS):**
    *   Navigate to the backend directory: `cd backend`
    *   Install dependencies: `npm install` (or `yarn install`)
    *   Set up your `.env` file (see `.env.example` for required variables).
    *   Start the backend services (PostgreSQL, Redis) using Docker Compose:
      ```bash
      docker compose up -d db redis
      ```
    *   Run Prisma migrations: `npx prisma migrate dev`
    *   Start the NestJS server: `npm run start:dev`

3.  **Frontend Setup (Next.js):**
    *   Navigate to the frontend directory: `cd frontend`
    *   Install dependencies: `npm install` (or `yarn install`)
    *   Set up your `.env.local` file (see `.env.example`).
    *   Start the Next.js development server: `npm run dev`

## Styleguides & Standards

We enforce a consistent code style through ESLint and Prettier.

*   **Git Commit Messages:** We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard (e.g., `feat: add user login`, `fix: resolve websocket auth error`).
*   **TypeScript:** All code must be written in TypeScript with strict typing enabled.
*   **Code Quality:** Ensure your code is clean, readable, and follows the project's architectural patterns (e.g., FSD for frontend).

Before submitting a PR, please run:
```bash
npm run lint
npm run format

Pull Request Process

    Fork the repository and create your branch from main (e.g., feat/new-feature or fix/bug-fix).

    Make your changes. Ensure your code adheres to the Styleguides.

    Write tests! If you add a new feature or fix a bug, please add corresponding unit or E2E tests.

    Ensure the test suite passes (npm test).

    Update the documentation (README.md or files in /Docs) if your changes introduce new functionality or change existing behavior.

    Submit the Pull Request (PR) to the main branch.

    Provide a clear description in the PR: What problem does it solve? How did you solve it? Link to the relevant issue if available.

    Respond to feedback during the code review process.
