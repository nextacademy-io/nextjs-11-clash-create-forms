# Next.js Workshop: Peer List and Peer Detail as Server Components

In this task you'll implement peer listing and individual peer detail pages using [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components). You'll learn how to fetch GraphQL data server-side, create dynamic routes with parameters, and build efficient server-rendered pages without client-side JavaScript.

## Server Components Overview

Before you proceed, make sure you're familiar with [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) and understand the difference between Server and Client Components in Next.js.

> [!IMPORTANT] > **Server Components vs Client Components**: Server Components run on the server and don't have access to browser APIs like `useState`, `useEffect`, or event handlers. They're perfect for data fetching and rendering static content. Client Components (marked with `'use client'`) run in the browser and handle interactivity.

## Server-Side GraphQL Setup

### Apollo Client for Server Components

Since Server Components run on the server, you cannot use Apollo Client's `useQuery` hook. Instead, you'll use the existing Apollo server setup in `src/apollo/server.ts`.

The project already has a server-side Apollo Client configured using the official Apollo Client Next.js integration:

```typescript
// src/apollo/server.ts (already exists)
import { HttpLink } from '@apollo/client';
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: 'http://localhost:3000/graphql',
      fetchOptions: {
        // Next.js-related fetch options regarding caching and revalidation
      },
    }),
  });
});
```

> [!IMPORTANT] > **Using Apollo Client in Server Components**: The project uses the official [Apollo Client Next.js integration](https://github.com/apollographql/apollo-client-integrations/tree/main/packages/nextjs#in-rsc). This provides the `getClient()` and `query()` functions for server-side GraphQL operations.

## Peer Routes Setup

### Create Peer Route Structure

Create the following file structure and components for peer functionality:

```
src/
├── app/
│   └── peers/
│       ├── page.tsx (main peer list page)
│       └── [peer-id]/
│           └── page.tsx (peer detail page)
└── components/
    ├── peer-list/
    │   ├── index.ts
    │   └── peer-list.tsx
    └── peer-detail/
        ├── index.ts
        └── peer-detail.tsx
```

### Component-Based Architecture

Create reusable components similar to the existing clash components in your workspace. Follow the established patterns from `src/components/` directory.

#### 1. Create PeerList Component

```tsx
// src/components/peer-list/peer-list.tsx
import { getClient } from '@/apollo/server';
import { gql } from '@apollo/client';

export default async function PeerList() {
  // Create GetPeers query for peers list
  // Use getClient().query() to fetch data
  // Return grid layout similar to clash cards
}
```

#### 2. Create PeerDetail Component

```tsx
// src/components/peer-detail/peer-detail.tsx
import { getClient } from '@/apollo/server';
import { gql } from '@apollo/client';

interface PeerDetailProps {
  peerId: string;
}

export default async function PeerDetail({ peerId }: PeerDetailProps) {
  // Create GetPeer query with $id variable
  // Fetch peer data using getClient().query()
  // Return peer details layout with back button
}
```

#### 3. Update Pages to Use Components

Create simple page components that import and render the peer components:

- **Peer List Page**: Import `PeerList` component and render with page title
- **Peer Detail Page**: Extract peer ID from params and pass to `PeerDetail` component

### Server Component Benefits

- No `'use client'` directive needed
- Direct async/await data fetching
- Better SEO and performance
- Server-side rendering by default

## GraphQL Schema Exploration

### Explore the Peer API

The GraphQL server provides the following peer-related queries:

1. `peers: [Peer!]!` - Returns a list of all peers
2. `peer(id: Int!): Peer!` - Returns a specific peer by ID (note: uses `Int!` not `ID!`)

The `Peer` type includes the following fields:

- `id: Int!` - Unique identifier
- `name: String!` - Full name
- `pictureUrl: String!` - Profile picture URL
- `city: String!` - City location
- `country: String!` - Country location
- `gender: Gender!` - Gender enum
- `clashes: [Clash!]!` - Associated clashes

> [!TIP]
> You can explore the full schema at `http://localhost:3000/graphql` in your GraphQL playground.

### Query Implementation Hints

The `GetPeers` query should:

- Return a list of peers with basic information
- Include fields like: `id`, `name`, `pictureUrl`
- No variables needed (returns all peers)

The `GetPeer` query should:

- Accept an `id` variable of type `Int!` (not `ID!`)
- Return detailed peer information including `city` and `country`
- Include additional fields as needed for your UI
- Handle error cases appropriately

> [!TIP]
> After updating your GraphQL queries, run `npm run codegen` to generate TypeScript types for server-side usage.

## Error Handling and Not Found

### Custom Not Found Page

Create a custom not found page for invalid peer IDs (`src/app/peers/[peer-id]/not-found.tsx`):

```tsx
import Link from 'next/link';

export default function PeerNotFound() {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <h1 className="text-3xl font-bold mb-4">Peer Not Found</h1>
      <p className="text-gray-600 mb-6">
        The peer you're looking for doesn't exist or has been removed.
      </p>
      <Link
        href="/peers"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-md border border-blue-200 hover:border-blue-300 transition-colors duration-200"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Peers
      </Link>
    </div>
  );
}
```

## Loading States with loading.tsx

Since Server Components handle data fetching during server rendering, loading states are shown while the server is processing the request.

### Peer List Loading (`src/app/peers/loading.tsx`)

```tsx
export default function PeersLoading() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Peers</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 shadow-sm bg-white">
              <div className="bg-gray-300 h-48 w-full rounded-md"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="mt-auto flex justify-end">
                <div className="h-8 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Peer Detail Loading (`src/app/peers/[peer-id]/loading.tsx`)

```tsx
export default function PeerDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="mb-6">
        <div className="h-10 bg-gray-300 rounded w-32 mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-48"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-300 h-96 rounded-lg"></div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-300 rounded w-3/4"></div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Testing Server Components

After implementing the basic structure:

1. Navigate to `http://localhost:3001/peers` - should display the peer list
2. Click any "View Profile" link - should navigate to `/peers/[peer-id]`
3. Test direct URL access like `/peers/123` - should work or show not found
4. Verify that page source shows server-rendered content
5. Check that no client-side JavaScript is loaded for the peer components

> [!TIP]
> Use "View Page Source" in your browser to verify that content is server-rendered and visible in the HTML source.

## File Structure Summary

After completing this task, your file structure should look like:

```
src/
├── apollo/
│   └── server.ts (existing Apollo Client setup)
├── app/
│   ├── clashes/ (existing)
│   └── peers/
│       ├── page.tsx (Server Component)
│       ├── loading.tsx
│       └── [peer-id]/
│           ├── page.tsx (Server Component)
│           ├── loading.tsx
│           └── not-found.tsx
└── components/ (existing components)
```
