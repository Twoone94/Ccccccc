import tailwindcssAnimate from "tailwindcss-animate"
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				hover: 'var(--color-primary-hover)',
  				active: 'var(--color-primary-active)',
  				subtle: 'var(--color-primary-subtle)',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			info: {
  				DEFAULT: 'var(--color-info-default)',
  				hover: 'var(--color-info-hover)',
  				subtle: 'var(--color-info-subtle)'
  			},
  			success: {
  				DEFAULT: 'var(--color-success-default)',
  				hover: 'var(--color-success-hover)',
  				subtle: 'var(--color-success-subtle)'
  			},
  			warning: {
  				DEFAULT: 'var(--color-warning-default)',
  				hover: 'var(--color-warning-hover)',
  				subtle: 'var(--color-warning-subtle)'
  			},
  			error: {
  				DEFAULT: 'var(--color-error-default)',
  				hover: 'var(--color-error-hover)',
  				subtle: 'var(--color-error-subtle)'
  			},
  			brand: {
  				DEFAULT: 'var(--color-primary-default)',
  				hover: 'var(--color-primary-hover)'
  			},
  			bg: 'var(--color-bg)',
  			surface: 'var(--color-surface)',
  			border: 'hsl(var(--border))',
  			text: {
  				main: 'var(--color-text-primary)',
  				secondary: 'var(--color-text-secondary)',
  				disabled: 'var(--color-text-disabled)',
  				inverse: 'var(--color-text-inverse)'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
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
  		ringColor: {
  			DEFAULT: 'var(--color-primary-default)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-sans)'
  			],
  			mono: [
  				'var(--font-mono)'
  			],
  			brandSans: [
  				'var(--font-brand-sans)'
  			],
  			brandMono: [
  				'var(--font-brand-mono)'
  			]
  		},
  		fontSize: {
  			'display-lg': [
  				'2rem',
  				{
  					lineHeight: '2.5rem'
  				}
  			],
  			'display-md': [
  				'1.75rem',
  				{
  					lineHeight: '2.25rem'
  				}
  			],
  			'display-sm': [
  				'1.5rem',
  				{
  					lineHeight: '2rem'
  				}
  			],
  			h1: [
  				'1.5rem',
  				{
  					lineHeight: '2rem'
  				}
  			],
  			h2: [
  				'1.25rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			h3: [
  				'1.125rem',
  				{
  					lineHeight: '1.625rem'
  				}
  			],
  			'title-lg': [
  				'1.125rem',
  				{
  					lineHeight: '1.625rem'
  				}
  			],
  			'title-md': [
  				'1rem',
  				{
  					lineHeight: '1.5rem'
  				}
  			],
  			'title-sm': [
  				'0.9375rem',
  				{
  					lineHeight: '1.375rem'
  				}
  			],
  			'body-md': [
  				'0.875rem',
  				{
  					lineHeight: '1.375rem'
  				}
  			],
  			'body-sm': [
  				'0.8125rem',
  				{
  					lineHeight: '1.25rem'
  				}
  			],
  			'body-xs': [
  				'0.75rem',
  				{
  					lineHeight: '1.125rem'
  				}
  			],
  			'label-xs': [
  				'0.6875rem',
  				{
  					lineHeight: '1rem'
  				}
  			]
  		},
  		borderRadius: {
  			sm: 'calc(var(--radius) - 4px)',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)'
  		},
  		boxShadow: {
  			layer: '0 1px 2px rgba(0,0,0,.3)',
  			card: '0 1px 2px rgba(0,0,0,0.06)',
  			dialog: '0 8px 24px rgba(0,0,0,0.18)'
  		}
  	}
  },
    plugins: [tailwindcssAnimate]
}