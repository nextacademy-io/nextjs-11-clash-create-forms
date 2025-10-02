# Next.js Workshop: Clash Create - Forms, Server Actions and Validation

In this task you'll implement a clash creation form using [Next.js Forms and Server Actions](https://nextjs.org/docs/app/guides/forms). You'll learn how to handle form submissions, implement server-side mutations, add client-side validation with Zod, and create a seamless form experience that follows modern React patterns.

## Forms and Server Actions Overview

Before proceeding, familiarize yourself with Next.js form handling concepts:

- **[Forms and Server Actions](https://nextjs.org/docs/app/guides/forms)** - Complete guide to form handling in Next.js
- **[Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)** - Server-side form processing and mutations
- **[Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)** - For interactive form validation

> [!IMPORTANT]
> **Client vs Server Components for Forms**: While Server Components excel at data fetching, forms with validation require Client Components (`'use client'`) to handle user interactions and display validation feedback using hooks like [`useActionState`](https://react.dev/reference/react/useActionState).

## Dependencies Setup

### Install Zod for Validation

Install Zod for schema validation and type safety:

```bash
npm install zod
```

Zod provides TypeScript-first schema validation with static type inference, perfect for form validation.

> [!TIP]
> Learn more about Zod at [zod.dev](https://zod.dev/) for comprehensive schema validation patterns.

## Project Structure Setup

### Create Clash Creation Route Structure

Set up the file structure for clash creation functionality:

```
src/
├── app/
│   └── clashes/
│       ├── create/
│       │   └── page.tsx (clash create page)
│       └── page.tsx (existing clash list)
├── components/
│   └── clash-create/
│       ├── index.ts
│       └── clash-create.tsx (client component)
└── domain/
    └── clashes/
        ├── actions.ts (server actions)
        ├── schemas.ts (zod schemas)
        └── index.ts
```

## Form Schema Definition

### Create Validation Schema with Zod

Define your form validation schema following the GraphQL `CreateClashInput` type:

```typescript
// src/domain/clashes/schemas.ts
import { z } from 'zod';

export const createClashSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().min(1, 'Address is required'),
  date: z.string().min(1, 'Date is required'),
  createdByPeerId: z.number().int().positive('Valid peer ID required'),
});

export type CreateClashFormData = z.infer<typeof createClashSchema>;
```

> [!TIP]
> Use `z.infer<>` to automatically generate TypeScript types from your Zod schemas.

## Server Actions Implementation

### Create Clash Server Action

Implement the server-side form processing with proper error handling:

```typescript
// src/domain/clashes/actions.ts
'use server';

import { getClient } from '@/apollo/server';
import { gql } from '@apollo/client';
import { createClashSchema } from './schemas';
import { redirect } from 'next/navigation';

const CREATE_CLASH = gql`
  mutation CreateClash($input: CreateClashInput!) {
    createClash(createClashInput: $input) {
      id
      title
    }
  }
`;

export async function createClash(prevState: any, formData: FormData) {
  // Parse and validate form data with Zod
  // Return errors if validation fails
  // Execute GraphQL mutation
  // Handle success/error cases
  // Redirect on success
}
```

Key implementation points:

- Use `'use server'` directive for Server Actions
- Accept `prevState` as first parameter for [`useActionState`](https://react.dev/reference/react/useActionState) compatibility
- Validate input with Zod schema using `safeParse`
- Return error object if validation fails
- Execute GraphQL mutation with Apollo Client
- Use [`redirect()`](https://nextjs.org/docs/app/api-reference/functions/redirect) for successful submissions

> [!IMPORTANT]
> **Server Actions Security**: Always validate input on the server side, even with client-side validation. Never trust client data directly.

### Export Domain Functions

```typescript
// src/domain/clashes/index.ts
export { createClash } from './actions';
export { createClashSchema, type CreateClashFormData } from './schemas';
```

## Client Component Implementation

### Create ClashCreate Form Component

Build the interactive form component with validation:

```tsx
// src/components/clash-create/clash-create.tsx
'use client';

import { useActionState } from 'react';
import { createClash } from '@/domain/clashes';

export default function ClashCreate() {
  const initialState = { message: '', errors: {} };
  const [state, formAction, pending] = useActionState(createClash, initialState);

  return (
    <form action={formAction}>
      {/* Form fields with validation feedback */}
      {/* Submit button with loading state */}
    </form>
  );
}
```

Key features to implement:

- **Server-Side Validation**: Validate using Zod in Server Action
- **Error Display**: Show field-specific validation errors from server
- **Loading States**: Use `pending` boolean to disable form during submission
- **Accessibility**: Proper labels, ARIA attributes, and error associations

## Form Fields and Validation

### Essential Form Fields

Implement these form fields matching the GraphQL schema:

1. **Title** - Text input with length validation
2. **Description** - Textarea with minimum length requirement
3. **Location** - Text input for venue name
4. **Address** - Text input for full address
5. **Date** - Date input with future date validation
6. **Created By Peer** - Select dropdown or hidden field

### Server-Side Validation with Zod

Following the [Next.js Forms validation guide](https://nextjs.org/docs/app/guides/forms#form-validation), validate form data on the server using Zod's `safeParse` method:

```typescript
// In your Server Action (actions.ts)
export async function createClash(prevState: any, formData: FormData) {
  const validatedFields = createClashSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    location: formData.get('location'),
    address: formData.get('address'),
    date: formData.get('date'),
    createdByPeerId: Number(formData.get('createdByPeerId')),
  });

  // Return early if validation fails
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check your inputs.',
    };
  }

  // Proceed with mutation using validatedFields.data
  // ...
}
```

### Displaying Validation Errors with useActionState

Use React's [`useActionState`](https://react.dev/reference/react/useActionState) hook to handle form state and display validation errors:

```tsx
// In your Client Component (clash-create.tsx)
'use client';

import { useActionState } from 'react';
import { createClash } from '@/domain/clashes';

export default function ClashCreate() {
  const initialState = { message: '', errors: {} };
  const [state, formAction, pending] = useActionState(createClash, initialState);

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="title">Title</label>
        <input type="text" id="title" name="title" required />
        {state.errors?.title && <p className="text-red-600 text-sm">{state.errors.title[0]}</p>}
      </div>

      {/* Other form fields... */}

      <button type="submit" disabled={pending}>
        {pending ? 'Creating...' : 'Create Clash'}
      </button>

      {state.message && (
        <p aria-live="polite" className="text-red-600">
          {state.message}
        </p>
      )}
    </form>
  );
}
```

> [!TIP]
> The [`useActionState`](https://react.dev/reference/react/useActionState) hook automatically handles the Server Action response, providing `state` for errors/messages and `pending` for loading states. Learn more in the [Next.js validation errors documentation](https://nextjs.org/docs/app/guides/forms#validation-errors).

## Page Route Implementation

### Create the Clash Create Page

```tsx
// src/app/clashes/create/page.tsx
import ClashCreate from '@/components/clash-create';

export default function ClashCreatePage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Clash</h1>
        <p className="text-gray-600">Fill in the details to create a new clash event.</p>
      </div>
      <ClashCreate />
    </div>
  );
}
```

## Testing and Validation

### Form Testing Checklist

Test these scenarios:

1. **Valid Submission**: All fields filled correctly
2. **Validation Errors**: Empty required fields, invalid formats
3. **Server Errors**: Network issues, GraphQL errors
4. **Loading States**: Form disabled during submission
5. **Success Flow**: Redirect to clash detail or list

### GraphQL Integration Testing

Verify your `createClash` mutation works:

```graphql
# Test in GraphQL playground
mutation {
  createClash(
    createClashInput: {
      title: "Test Clash"
      description: "Test description for clash"
      location: "Test Location"
      address: "123 Test Street"
      date: "2024-12-25T10:00:00Z"
      createdByPeerId: 1
    }
  ) {
    id
    title
  }
}
```

## Navigation and Integration

### Add Create Button to Clash List

Update your clash list page to include a "Create Clash" button:

```tsx
// Add to clash list page
import Link from 'next/link';

<Link
  href="/clashes/create"
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
>
  Create New Clash
</Link>;
```

### Success Redirect Strategy

After successful creation, use [`redirect()`](https://nextjs.org/docs/app/api-reference/functions/redirect) to navigate to:

- **Clash Detail**: `redirect(\`/clashes/${newClash.id}\`)`
- **Clash List**: `redirect('/clashes')`
- **Success Page**: Custom confirmation page

## Form UI Template

Here's a responsive form template with Tailwind CSS styling to get you started:

```tsx
// Responsive form container with card styling
'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createClash } from '@/domain/clashes';

export default function ClashCreate() {
  const router = useRouter();
  const initialState = { message: '', errors: {} };
  const [state, formAction, pending] = useActionState(createClash, initialState);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <form action={formAction} className="space-y-6">
          {/* Form field group example */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={pending}
            />
            {state.errors?.title && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {state.errors.title[0]}
              </p>
            )}
          </div>

          {/* Textarea example */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:bg-gray-100"
              disabled={pending}
            />
            {state.errors?.description && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {state.errors.description[0]}
              </p>
            )}
          </div>

          {/* Two-column layout for tablet and desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={pending}
              />
              {state.errors?.location && (
                <p className="text-sm text-red-600 mt-1">{state.errors.location[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={pending}
              />
              {state.errors?.date && (
                <p className="text-sm text-red-600 mt-1">{state.errors.date[0]}</p>
              )}
            </div>
          </div>

          {/* Form actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 text-white 
                     font-medium rounded-md hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200"
            >
              {pending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Clash'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-300 
                     text-gray-700 font-medium rounded-md hover:bg-gray-50
                     focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>

          {/* Global error message */}
          {state.message && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600" aria-live="polite">
                {state.message}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
```

Key styling features:

- **Responsive Grid**: Single column on mobile, two columns on tablet/desktop
- **Focus States**: Clear visual feedback with ring utilities
- **Loading State**: Animated spinner and disabled state during submission
- **Error Display**: Red text with proper spacing and ARIA attributes
- **Accessible**: Proper labels, required indicators, and ARIA live regions

## File Structure Summary

After completing this task, your enhanced file structure will include:

```
src/
├── app/
│   └── clashes/
│       ├── create/
│       │   └── page.tsx
│       └── page.tsx (existing)
├── components/
│   └── clash-create/
│       ├── index.ts
│       └── clash-create.tsx
├── domain/
│   └── clashes/
│       ├── actions.ts
│       ├── schemas.ts
│       └── index.ts
└── apollo/ (existing)
```

## Key Learning Outcomes

By completing this workshop, you'll master:

- **[Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)** for secure form processing
- **[Form Validation](https://nextjs.org/docs/app/guides/forms#validation)** with Zod and TypeScript
- **Client-Server Communication** patterns in Next.js App Router
- **Error Handling** for both client and server-side validation
- **Progressive Enhancement** principles for form accessibility

> [!IMPORTANT]
> **Next.js Forms Documentation**: This workshop follows the official [Next.js Forms Guide](https://nextjs.org/docs/app/guides/forms). Refer to it for additional patterns and advanced use cases.
