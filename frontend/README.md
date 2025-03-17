# AI Chatbot Personality Frontend 🤖

## 🗣 Introduction
The frontend of the AI Chatbot Personality project is built using Next.js. It provides a user-friendly interface for interacting with the AI chatbot, allowing users to customize their experience with different personality profiles.

## ✨ Features
- Responsive design for various devices
- Integration with the backend API for chat functionalities
- Customizable themes and layouts
- Support for multiple personality profiles

## 🚀 Get Started

### Prerequisites
- **nvm**: Node Version Manager to manage Node.js versions. Install it following the instructions [here](https://github.com/nvm-sh/nvm#installing-and-updating).
- **Node.js**: Use the LTS version (currently `lts/jod`).

### Steps

1. **Clone the repository**:
   See [Repository README](../README.md) for more details.
   ```bash
   cd ai-chatbot-personality/frontend
   ```

1. **Install Node.js using nvm**:
   ```bash
   nvm install --lts
   nvm use --lts
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file to include your API URL:
   ```plaintext
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

## 🖥 Installation
Once you have cloned the repository and set up the environment, you may need to install the project's dependencies. Follow the instructions below to set up the frontend.

## 🚨 License
This project is licensed under the [MIT License](https://opensource.org/license/mit/). Refer to the [LICENSE](../LICENSE) file for more information.

## Acknowledgments
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)