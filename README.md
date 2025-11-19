FlowPulse: AI powered Dynamic Video Conferencing 🚀

Introduction

FlowPulse is a modern, full-stack video conferencing application built with Next.js, TypeScript, and the Stream Video SDK. It provides a secure, reliable platform for instant meetings and scheduled calls, replicating core features found in industry-leading services like Zoom.

Features 💡

Secure Authentication: User sign-in and sign-up powered by Clerk.

Real-Time Video/Audio: High-quality video and audio feeds via the Stream Video SDK.

Meeting Management: Users can start instant meetings or schedule meetings for the future.

Personal Room: Every user gets a permanent, unique personal meeting link.

Meeting Controls: Features like toggling camera/mic, managing participants, and screen-sharing (Stream features).

Responsive Design: Optimized for seamless use across mobile, tablet, and desktop devices using Tailwind CSS.

Tech Stack 🛠️

FlowPulse is built using a modern, scalable stack:

Framework: Next.js (App Router)

Language: TypeScript

Styling: Tailwind CSS

Authentication: Clerk

Video/Streaming: Stream Video SDK

Meeting Summarization: After meeting ends you can get a Summary of the meeting

Getting Started (Quick Setup)

Follow these steps to get FlowPulse running locally on your machine.

1. Clone the Repository

git clone [https://github.com/sarveshmaan/FlowPulse-AI-Based-Video-Conferencing.git]
cd flowpulse

2. Install Dependencies

npm install

# or

yarn install

3. Environment Variables (Critical Step)

You need to obtain API keys from Clerk and Stream.

Create a file named .env.local in the root of the project and add your credentials. Do not commit this file to GitHub!

# Clerk Authentication Keys

NEXT*PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test*...
CLERK*SECRET_KEY=sk_test*...

# Stream Video SDK Keys

NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_SECRET_KEY=your_stream_secret_key

# Deployment URL (e.g., http://localhost:3000 during development)

NEXT_PUBLIC_BASE_URL=http://localhost:3000

4. Run the Development Server

npm run dev

# or

yarn dev

Open http://localhost:3000 in your browser to see the application.


