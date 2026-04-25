# FlowBuddy

**FlowBuddy** is a modern, premium MERN-stack period tracking and wellness application designed to help users track their cycles with elegance and ease. It features a unique **Trusted Circle** system that allows users to securely share their status with loved ones (partners, parents, doctors) and chat in real-time.


## Key Features

*   **Premium Dashboard**: Real-time cycle phase tracking (Flow, Follicular, Ovulation, Luteal) with advanced glassmorphism UI.
*   **Intelligent Insights**: Detailed analytical graphs showing cycle lengths, period durations, and mood patterns over time.
*   **Trusted Circle**: Secure viewer invitation system (Boyfriend, Husband, Parent, Doctor) with granular privacy controls.
*   **Persistent Chat**: Private 1-on-1 messaging system between the primary user and circle members.
*   **Dual Authentication**: Secure authentication via Google OAuth or OTP-based email verification.
*   **Mobile Optimized**: Fully responsive interface engineered for a native-like experience on mobile devices.

## Technology Stack

*   **Frontend**: React (Vite), Lucide-React (Icons), Recharts (Data Viz), Axios.
*   **Backend**: Node.js, Express.
*   **Database**: MongoDB Atlas.
*   **Auth**: JWT (JSON Web Tokens), Google OAuth (@react-oauth/google), Nodemailer (OTP).
*   **Styling**: Modern CSS with architectural CSS Variables and Glassmorphism.

## Getting Started

### Prerequisites
*   Node.js (v16+)
*   MongoDB Atlas Account
*   Google Cloud Console Project (for OAuth)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/FlowBuddy.git
    cd FlowBuddy
    ```

2.  **Install dependencies**:
    ```bash
    # Root
    npm install
    # Client
    cd client && npm install
    # Server
    cd ../server && npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the `server` directory:
    ```env
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    GOOGLE_CLIENT_ID=your_google_client_id
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    CLIENT_URL=http://localhost:5173
    ```

4.  **Local Execution**:
    ```bash
    # Terminal 1 (Backend)
    cd server && npm run dev
    # Terminal 2 (Frontend)
    cd client && npm run dev
    ```

## Deployment

FlowBuddy is optimized for deployment on platforms such as Render or Heroku. 
*   The backend is configured to serve the production build of the frontend automatically.
*   Refer to the [deployment_guide.md](./deployment_guide.md) for detailed production setup and architectural configuration.

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

Project maintained by the FlowBuddy Development Team
