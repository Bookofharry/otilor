import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from '../context/AppProvider'
import Button from '../components/ui/Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('renders as disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders with variant primary by default', () => {
    render(<Button>Primary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn--primary')
  })

  it('renders with variant secondary when specified', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn--secondary')
  })

  it('renders with variant ghost when specified', () => {
    render(<Button variant="ghost">Ghost Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn--ghost')
  })

  it('renders in loading state', () => {
    render(<Button loading>Loading Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('btn--loading')
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('renders with size sm when specified', () => {
    render(<Button size="sm">Small Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn--sm')
  })

  it('renders with size lg when specified', () => {
    render(<Button size="lg">Large Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn--lg')
  })

  it('renders with danger variant', () => {
    render(<Button variant="danger">Danger Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn--danger')
  })
})

describe('App integration', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <div>Test App</div>
        </AppProvider>
      </BrowserRouter>
    )
    expect(document.body).toHaveTextContent('Test App')
  })
})
