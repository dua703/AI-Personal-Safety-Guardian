AI Personal Safety Guardian

AI Personal Safety Guardian is a full-stack application designed to enhance personal safety using AI-powered analysis. The app allows users to analyze images, videos, and text for potential threats, receive real-time safety recommendations, and get guidance to nearby safe locations.

Features
🔹 Threat Analysis

Analyze images, videos, and text for potential safety threats.

Detect low-light areas, isolated locations, and suspicious activity.

Display threat levels: Low, Medium, High, Critical with clear emoji indicators.

Provides recommended actions to stay safe.

🔹 Safe Route Guidance

Users can share their current location via the chatbox.

AI recommends the safest route to nearby safe places or police stations.

Shows safe/unsafe areas along the route using emoji indicators.

Interactive pop-up modal displays route information with a walking animation.

🔹 Emergency Contact

Quick access to emergency contacts via WhatsApp icon in the chatbox.

Promotes immediate assistance in case of threats.

🔹 User-Friendly Interface

Clean pastel/baby pink theme designed for ease of use.

Responsive chatbox with casual interactive AI assistant.

Pop-up modals for safe route and threat alerts overlay the chat without interrupting workflow.

🛠 Tech Stack

Frontend: React.js, TailwindCSS, Framer Motion

Backend: Node.js, Express.js

AI Analysis: Gemini AI API (Placeholder logic for demonstration)

Maps & Location: Google Maps API

Version Control: Git & GitHub

⚡ Installation

Clone the repository:

git clone https://github.com/dua703/AI-Personal-Safety-Guardian.git
cd AI-Personal-Safety-Guardian

Backend Setup
cd backend
npm install
# Create your .env file (example: .env.example)
node server.js

Frontend Setup
cd ../Frontend
npm install
npm start


Visit http://localhost:3000 to see the app in action.

🚀 Usage

Open the app in your browser.

Use the chatbox to:

Send a text description of your situation.

Upload images or videos for threat analysis.

Share your location for safe route recommendations.

Pop-up modals will display threat levels, recommendations, and safe route info.

Emergency contacts can be accessed via the WhatsApp icon.

⚠️ Notes

Environment files (.env.local) are excluded for security reasons.

AI analysis currently uses placeholder logic for testing.

Always check routes physically; the AI is advisory only.

📂 Project Structure
AI-Personal-Safety-Guardian/
│
├── backend/           # Node.js + Express API
├── Frontend/          # React.js frontend
├── syncGitHub.js      # Script to sync missing files to GitHub
├── package.json
└── README.md

👨‍💻 Contributing

Fork the repository.

Create a new branch: git checkout -b feature-name

Make your changes and commit: git commit -m "Feature description"

Push to branch: git push origin feature-name

Create a pull request.

📄 License

MIT License
