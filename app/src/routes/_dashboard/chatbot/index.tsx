import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/chatbot/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/chatbot/"!</div>
}
