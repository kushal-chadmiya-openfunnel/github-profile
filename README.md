# GitHub Profile UI Clone

A modern, high-fidelity clone of the GitHub Profile page built with Angular. This project demonstrates visual accuracy, responsive design, and dynamic data integration using the GitHub API.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (installed with Node.js)
- [Angular CLI](https://angular.dev/tools/cli) (`npm install -g @angular/cli`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kushal-chadmiya-openfunnel/github-profile.git
   cd github-profile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## ⚙️ Configuration

To fetch real-time data from GitHub, you need to provide a Personal Access Token (PAT).

1. **Generate a Token:**
   - Go to [GitHub Settings → Developer Settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/tokens?type=beta) (or Classic).
   - Generate a new token with at least `read:user` (and optionally `repo`) scope.

2. **Configure Environments:**
   - Open `src/environments/environment.ts` (for development) and `src/environments/environment.prod.ts` (for production).
   - Replace `'YOUR_GITHUB_TOKEN_HERE'` with your actual token:
     ```typescript
     export const environment = {
       production: false,
       githubToken: 'ghp_your_token_here'
     };
     ```

> [!IMPORTANT]
> The environment files are excluded from Git to protect your secrets. You must manually add your token after cloning.

## 🛠️ Features

- **Visual Accuracy**: Styled to match GitHub's modern dark/light themes.
- **Dynamic Profile Data**: Fetches user biography, statistics, and profile details via GitHub REST API.
- **Contribution Graph**: A fully functional contribution grid with the ability to switch between different contribution years.
- **Pinned Repositories**: Displays a curated list of repositories in the familiar GitHub layout.
- **Responsive Design**: Optimized for different screen sizes from mobile to desktop.

## 💻 Development Commands

| Command | Description |
| :--- | :--- |
| `ng serve` | Runs the app on `http://localhost:4200/`. |
| `ng build` | Builds the project for production in `dist/`. |
| `ng test` | Executes unit tests via Vitest. |
| `ng lint` | Runs linting checks (if configured). |

## 🔍 Note to Reviewer

- **Architecture**: The project follows a modular structure (Core, Shared, Features) for better maintainability.
- **State Management**: Uses Angular's reactive patterns and services to handle data flow.
- **Styling**: Leverages Vanilla CSS with a focus on CSS variables for theme consistency and layout flexibility.
- **Interceptors**: Uses a `github-auth.interceptor.ts` to automatically attach the PAT to all GitHub API requests.

---
*Created for the UptimeAI Technical Assessment.*
