# SYNTHESIZE REALITY

Input data stream. Generate visual output.

A web application that leverages AI models through the g4f.dev API to generate images from text prompts.

## Features

*   **AI-Powered Image Generation:** Create unique images from descriptive text prompts.
*   **Model Selection:** Choose from a variety of AI models and providers, including options from 'worker' and 'api.airforce'.
*   **Rate Limiting Awareness:** Includes a cooldown mechanism for specific API providers to manage request rates.
*   **Generation History:** Keeps a local history of your generated images and prompts, powered by `localStorage`.
*   **Full-Screen Viewer:** Easily view your generated images in a larger format.

## Technologies Used

*   **Frontend:** React, Vite
*   **AI Integration:** g4f.dev API
*   **Styling:** Tailwind CSS (inferred from class names)
*   **Language:** TypeScript

## Installation & Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/Aegis-plus/AIGEN.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd AIGEN
    ```
3.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```

## Usage

1.  Open the application in your browser (usually at `http://localhost:5173` or a similar port).
2.  Select your desired AI model from the dropdown menu.
3.  Enter a descriptive prompt in the input field.
4.  Click the "Generate" button (or press Enter).
5.  View your generated image, and it will be added to your history.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue.

## License

This project is not specified with a license.

## Acknowledgements

*   Made by AEGIS+
*   Powered by [g4f.dev](https://g4f.dev)
