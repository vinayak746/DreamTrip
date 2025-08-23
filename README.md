# DreamTrip - Travel Planning Application

DreamTrip is a modern web application built with Next.js that helps users plan and organize their travel experiences. Create, manage, and share your travel itineraries with ease.

## Features

- 📝 Create and manage travel itineraries
- 🔐 User authentication
- 📱 Responsive design for all devices
- 🌍 Interactive map integration
- 📸 Photo uploads for trip memories
- ⚡ Fast and optimized performance

## Tech Stack

- **Frontend**: Next.js 13+ with TypeScript
- **Styling**: CSS Modules
- **Authentication**: Firebase Authentication
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn
- Firebase project with Firestore and Storage enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dreamtrip.git
   cd dreamtrip
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/                    # App router directory
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Dashboard components and pages
│   └── ...
├── contexts/               # React contexts
├── firebase/               # Firebase configuration
├── public/                 # Static files
├── services/               # API and service layers
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [CSS Modules](https://github.com/css-modules/css-modules)
- Deployed on [Vercel](https://vercel.com)
