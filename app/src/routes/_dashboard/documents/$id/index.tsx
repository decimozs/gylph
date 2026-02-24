import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/documents/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/documents/$id/"!</div>
}
