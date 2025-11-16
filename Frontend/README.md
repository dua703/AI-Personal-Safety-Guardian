# AI Personal Safety Guardian - Frontend

A Next.js 14 frontend application for analyzing images, videos, audio, and text for safety threats.

## Features

- 🖼️ **Image Analysis** - Upload and analyze images for safety threats
- 🎥 **Video Analysis** - Upload and analyze videos for safety threats
- 🎤 **Audio Analysis** - Record or upload audio files for analysis
- 📝 **Text Analysis** - Analyze text content for safety concerns
- 📊 **Threat Results** - Beautiful UI displaying threat levels, risks, and recommended actions

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** (API client)
- **Zustand** (State management)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend server running (see backend folder)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Home page with mode selector
│   ├── mode/[mode]/page.tsx  # Dynamic upload/record pages
│   ├── results/page.tsx      # Results display page
│   ├── error/page.tsx        # Error fallback page
│   └── layout.tsx            # Root layout
├── components/
│   ├── FileUploader.tsx      # Image file upload component
│   ├── VideoUploader.tsx     # Video file upload component
│   ├── AudioRecorder.tsx     # Audio recording/upload component
│   ├── TextInput.tsx         # Text input component
│   └── ThreatResult.tsx       # Results display component
├── lib/
│   ├── api.ts                # Axios API client
│   └── store.ts              # Zustand state store
└── styles/
    └── globals.css           # Global styles
```

## API Endpoints

The frontend communicates with the following backend endpoints:

- `POST /api/analyze-image` - Analyze uploaded images
- `POST /api/analyze-video` - Analyze uploaded videos
- `POST /api/analyze-audio` - Analyze uploaded/recorded audio
- `POST /api/text-analysis` - Analyze text content
- `POST /api/safe-route` - Analyze route safety (optional)

## Build for Production

```bash
npm run build
npm start
```

## License

MIT

