import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				health: {
					beige: '#D5B69C',
					cream: '#F9E4A7',
					mint: '#A3D5C5',
					sky: '#A1C6F9',
					lavender: '#B4A1FF',
					pink: '#FFB0BB',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'fade-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'fade-down': {
					'0%': { opacity: '0', transform: 'translateY(-20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'fade-left': {
					'0%': { opacity: '0', transform: 'translateX(20px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' },
				},
				'fade-right': {
					'0%': { opacity: '0', transform: 'translateX(-20px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' },
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.85' },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-8px)' },
				},
				'sweep': {
					'0%': { left: '-100%' },
					'100%': { left: '100%' },
				},
				'heart-beat': {
					'0%, 100%': { transform: 'scale(1)' },
					'15%': { transform: 'scale(1.2)' },
					'30%': { transform: 'scale(1)' },
					'45%': { transform: 'scale(1.15)' },
					'60%': { transform: 'scale(1)' },
				},
				'slide-left': {
					'0%': { transform: 'translateX(0)', opacity: '0' },
					'20%': { transform: 'translateX(0)', opacity: '1' },
					'100%': { transform: 'translateX(-50px)', opacity: '1' },
				},
				'slide-in-text': {
					'0%': { transform: 'translateX(20px)', opacity: '0' },
					'20%': { transform: 'translateX(20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				'fade-in-delayed': {
					'0%, 50%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'skeleton-pulse': {
					'0%, 100%': { opacity: '0.5' },
					'50%': { opacity: '1' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.7s ease-out forwards',
				'fade-up': 'fade-up 0.7s ease-out forwards',
				'fade-down': 'fade-down 0.7s ease-out forwards',
				'fade-left': 'fade-left 0.7s ease-out forwards',
				'fade-right': 'fade-right 0.7s ease-out forwards',
				'scale-in': 'scale-in 0.7s ease-out forwards',
				'float': 'float 3s ease-in-out infinite',
				'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
				'fade-in-fast': 'fade-in 0.3s ease-out forwards',
				'fade-up-fast': 'fade-up 0.3s ease-out forwards',
				'heart-beat': 'heart-beat 1.5s ease-in-out infinite',
				'slide-left': 'slide-left 1.5s ease-out forwards',
				'slide-in-text': 'slide-in-text 1.8s ease-out forwards',
				'fade-in-delayed': 'fade-in-delayed 2s ease-out forwards',
				'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
