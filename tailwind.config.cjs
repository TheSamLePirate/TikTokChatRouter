module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: "hsl(var(--primary))",
                'primary-foreground': "hsl(var(--primary-foreground))",
                card: "hsl(var(--card))",
                'card-foreground': "hsl(var(--card-foreground))",
                tiktok: {
                    pink: '#ff0050',
                    cyan: '#00f2ea',
                    black: '#121212',
                }
            },
        },
    },
    plugins: [],
}
