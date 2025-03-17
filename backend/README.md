# AI Chatbot Personality

## Overview

The AI Chatbot Personality project is a FastAPI-based application that integrates with the Cohere API to provide customizable personality profiles for chat interactions. Users can select different personalities to influence the tone and style of the chatbot's responses.

## Features

- Fetch available personalities
- Chat with the AI using different personality profiles
- Handle various input scenarios, including error cases

## Technologies Used

- **FastAPI**: A modern web framework for building APIs with Python 3.6+ based on standard Python type hints.
- **Cohere**: An AI model for natural language processing.
- **SQLAlchemy**: ORM for database interactions.
- **SQLite**: Lightweight database for storing conversation history.
- **Pydantic**: Data validation and settings management using Python type annotations.

## Installation

### Prerequisites

- **pyenv**: A tool to manage multiple Python versions. Install it following the instructions [here](https://github.com/pyenv/pyenv#installation).
- **Python 3.11.0** or higher (managed via `pyenv`)
- pip (Python package installer)

### Steps

1. **Clone the repository**:
  See [Repository README](../README.md) for more details.
   ```bash
   cd ai-chatbot-personality/backend
   ```

1. **Install Python using pyenv**:
   ```bash
   pyenv install 3.11.0
   pyenv local 3.11.0
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install dependencies**:
   ```bash
   make requirements-dev
   ```

5. **Load environment variables**:
   Copy the example environment file and set your API key:
   ```bash
   make load-env
   ```

   Create a copy of `.env.example` to `.env` and edit the `.env` file to include your Cohere API key:
   ```plaintext
   COHERE_API_KEY=<your_cohere_api_key_here>
   COHERE_MODEL=command-light
   ```

## Running the Application

To start the development server, run:
```bash
make run-dev
```

The application will be available at `http://localhost:8000`.

## API Endpoints

### 1. Get Available Personalities

- **Endpoint**: `GET /personalities`
- **Description**: Fetches a list of available personalities.
- **Response**:
  ```json
  {
      "personalities": [
          {
              "id": "formal_teacher",
              "name": "Formal Teacher",
              "description": "Educational and informative with a formal tone"
          },
          ...
      ]
  }
  ```

### 2. Chat with the AI

- **Endpoint**: `POST /chat`
- **Description**: Sends a message to the AI and receives a response based on the selected personality.
- **Request Body**:
  ```json
  {
      "message": "Tell me about artificial intelligence",
      "personality": "formal_teacher",
      "conversation_id": "optional-conversation-id"
  }
  ```
- **Response**:
  ```json
  {
      "response": "AI is a field of computer science...",
      "conversation_id": "generated-conversation-id"
  }
  ```

### Error Handling

The API handles various error cases, including:
- Invalid personality selection
- Empty messages
- Missing fields in the request

## Testing

You can test the API using the provided `collection.rest` file with reusable variables for Postman or any REST client.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [Cohere](https://cohere.com/)
- [SQLAlchemy](https://www.sqlalchemy.org/)