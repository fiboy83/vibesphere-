# VibeSphere – The Sovereign Layer Identity T Engine

Full-feature VibeSphere with Post & Handle management, wallet connect, and claim handle functionality.

## Running Locally

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Create a `.env.local` file and add your Privy App ID:
    ```
    NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:9002](http://localhost:9002) in your browser.

## Deploying to Vercel

1.  Push your code to a GitHub repository.
2.  Go to [Vercel](https://vercel.com/new) and import your project from GitHub.
3.  Configure the environment variables. Add `NEXT_PUBLIC_PRIVY_APP_ID` with your Privy App ID.
4.  Click "Deploy".
