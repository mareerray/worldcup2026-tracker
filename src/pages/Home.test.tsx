import { render, screen, waitFor } from '@testing-library/react'
import { it, expect, vi, beforeEach } from 'vitest'
import Home from './Home'

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
        if (url.includes('standings')) {
            return Promise.resolve({
                json: () => Promise.resolve({ standings: [] }),
            } as Response)
        }

        if (url.includes('dateFrom=')) {
            return Promise.resolve({
                json: () => Promise.resolve({ matches: [] }),
            } as Response)
        }

        if (url.includes('status=LIVE')) {
            return Promise.resolve({
                json: () => Promise.resolve({ matches: [] }),
            } as Response)
        }

        if (url.includes('status=FINISHED')) {
            return Promise.resolve({
                json: () => Promise.resolve({ matches: [] }),
            } as Response)
        }

        if (url.includes('status=SCHEDULED')) {
            return Promise.resolve({
                json: () => Promise.resolve({ matches: [] }),
            } as Response)
        }

        if (url.includes('scorers')) {
            return Promise.resolve({
                json: () => Promise.resolve({ scorers: [] }),
            } as Response)
        }

        return Promise.resolve({
            json: () => Promise.resolve({ resultSet: { count: 0 } }),
        } as Response)
    }) as typeof fetch)
})

it('shows main sections', async () => {
    render(<Home />)

    await waitFor(() => {
        expect(screen.getByText('🔴 Live Matches')).toBeInTheDocument()
    })

    expect(screen.getByText('📅 Upcoming Matches')).toBeInTheDocument()
    expect(screen.getByText('⚽ Latest Results')).toBeInTheDocument()
})