# VibeSphere – The Sovereign Layer Identity Engine

Full-feature VibeSphere with Post & Handle management, wallet connect, and claim handle functionality.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Local Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/fiboy83/vibesphere-.git
    cd vibesphere-
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of your project and add your Privy App ID:
    ```
    NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Deployment on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

1.  Push your code to your Git repository.
2.  Import your project into Vercel.
3.  Configure the Environment Variables in the Vercel project settings. Add `NEXT_PUBLIC_PRIVY_APP_ID` with your Privy App ID.
4.  Deploy! Your application should be automatically deployed and accessible via a Vercel URL.
