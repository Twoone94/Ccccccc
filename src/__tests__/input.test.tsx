import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Input } from '../components/ui/shadcn/Input'

describe('Input', () => {
  it('renders input element', () => {
    const { container } = render(<Input type="text" placeholder="test" />)
    const input = container.querySelector('input')
    expect(input).toBeTruthy()
    expect(input?.getAttribute('placeholder')).toBe('test')
  })
})