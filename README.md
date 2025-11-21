# AIGEN - AI Image Generation

[![GitHub](https://img.shields.io/badge/github-Aegis--plus%2FAIGEN-blue?logo=github)](https://github.com/Aegis-plus/AIGEN)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React](https://img.shields.io/badge/react-19.2.0-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5.8.2-blue?logo=typescript)](https://www.typescriptlang.org)

> Transform text prompts into stunning AI-generated images with AIGEN—a fast, intuitive web application powered by advanced AI models via g4f.dev.

## 🌟 Overview

AIGEN is a modern web application that leverages cutting-edge AI models to generate high-quality images from descriptive text prompts. Built with React, TypeScript, and Vite, it provides a seamless user experience with support for multiple AI providers and models through the g4f.dev API.

**Live Demo:** [https://aigen.aegis-plus.my.id/](https://aigen.aegis-plus.my.id/)

## ✨ Features

- **🎨 AI-Powered Image Generation** - Create unique images from descriptive text prompts using state-of-the-art AI models
- **🔄 Multiple AI Models** - Choose from Lucid-origin (Leonardo), Phoenix 1.0 (Leonardo), Imagen 3 & 4 (Google), and Seedream 4 (ByteDance)
- **⚡ Smart Rate Limiting** - Built-in cooldown mechanism to manage g4f.dev API request rates efficiently
- **📜 Generation History** - Local storage-powered history to track and revisit your generated images and prompts
- **🖼️ Full-Screen Viewer** - Enhanced viewing experience with full-screen image display capabilities
- **📱 Responsive Design** - Fully responsive interface that works seamlessly across devices

## 🛠️ Technology Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Styling and responsive design |
| **g4f.dev API** | AI model integration and image generation |

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## 🚀 Getting Started

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aegis-plus/AIGEN.git
   cd AIGEN
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📖 Usage

1. **Launch the application** - Open AIGEN in your web browser
2. **Select an AI model** - Choose from available AI models using the model selector dropdown
3. **Enter a prompt** - Describe the image you want to generate in the text input field
4. **Generate** - Click the "Generate" button or press Enter to create your image
5. **View results** - Your generated image appears on screen and is automatically saved to your history
6. **Full-screen view** - Click on any generated image to view it in full-screen mode

## 📁 Project Structure

```
AIGEN/
├── components/           # React components
│   ├── Header.tsx
│   ├── PromptInput.tsx
│   ├── ModelSelector.tsx
│   ├── ImageDisplay.tsx
│   ├── HistoryGallery.tsx
│   ├── AspectRatioSelector.tsx
│   ├── FullScreenImageViewer.tsx
│   └── icons.tsx
├── services/            # Business logic and API integration
│   ├── AIService.ts
│   └── historyService.ts
├── utils/               # Utility functions
│   └── helpers.ts
├── App.tsx              # Main application component
├── index.tsx            # Entry point
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## 🔌 API Integration

AIGEN uses the g4f.dev API for image generation, providing access to multiple state-of-the-art AI models:

**Available Models:**
- **Lucid-origin** - Leonardo AI's advanced image generation model
- **Phoenix 1.0** - Leonardo AI's high-performance model
- **Imagen 3 & 4** - Google's cutting-edge image generation models
- **Seedream 4** - ByteDance's innovative image generation model

The application intelligently manages:
- Multiple AI model providers through g4f.dev
- Request rate limiting and cooldown periods
- Error handling and user feedback

## 💾 Local Storage

The application uses browser `localStorage` to persist:
- Generation history
- User preferences
- Previously generated prompts

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Created by:** [AEGIS+](https://github.com/Aegis-plus)
- **Powered by:** [g4f.dev](https://g4f.dev) - Free AI API aggregator
- **AI Models:** Leonardo AI, Google Imagen, and ByteDance Seedream
- **Built with:** [React](https://react.dev), [Vite](https://vitejs.dev), and [Tailwind CSS](https://tailwindcss.com)

## 📞 Support

For issues, questions, or suggestions, please:
- Open an [GitHub Issue](https://github.com/Aegis-plus/AIGEN/issues)
- Contact the development team

---

<div align="center">

**[⬆ Back to Top](#aigen---ai-image-generation)**

Made with ❤️ by AEGIS+

</div>
