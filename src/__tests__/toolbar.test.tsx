import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Toolbar from '../components/ui/Toolbar'

describe('Toolbar', () => {
  it('renders three slots', () => {
    const { getByText } = render(
      <Toolbar>
        <span>left</span>
        <span>middle</span>
        <span>right</span>
      </Toolbar>
    )
    expect(getByText('left')).toBeTruthy()
    expect(getByText('middle')).toBeTruthy()
    expect(getByText('right')).toBeTruthy()
  })
})