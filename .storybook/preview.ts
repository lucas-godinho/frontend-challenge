import type { Preview } from '@storybook/react-vite'
import '../src/styles.css'

const preview: Preview = {
  loaders: [async () => {
    const { worker, startRealtimeMocks } = await import('../src/mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
    await startRealtimeMocks()
    return {}
  }],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'todo' },
  },
}

export default preview
