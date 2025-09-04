import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatPane } from './ChatPane'

async function typeAndSend(text: string) {
  const input = await screen.findByPlaceholderText('Type a message…')
  await userEvent.type(input, text)
  await userEvent.keyboard('{Enter}')
}

test('renders and sends a message with echo', async () => {
  render(<ChatPane />)

  expect(screen.getByText('Start by typing a message…')).toBeInTheDocument()

  await typeAndSend('hello')

  expect(await screen.findByText('hello')).toBeInTheDocument()
  expect(await screen.findByText('Noted: hello')).toBeInTheDocument()
}) 