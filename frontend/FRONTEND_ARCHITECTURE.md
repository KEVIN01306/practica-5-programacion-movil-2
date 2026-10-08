# Frontend Architecture — Web Admin System

## 1. Purpose

This document defines the frontend architecture, folder structure, naming conventions, routing strategy, authentication flow, API communication rules, and form implementation standards for the **Web Admin System**.

The project follows **Clean Architecture** principles with a strong separation between:
* **Global Core** (API, State Store, Theme, Utils)
* **Domain definitions & DTOs**
* **API services & infrastructure**
* **Module-specific presentation** (Components, Pages, Routing)
* **Shared reusable UI** (Tables, Dialogs, Loaders, Layouts)

---

## 2. Directory Structure

```text
frontend/src/
├── core/
│   ├── api/
│   │   ├── axios.instance.ts
│   │   ├── config.ts
│   │   └── index.ts
│   ├── store/
│   │   └── authStore.ts
│   ├── theme/
│   │   ├── index.ts
│   │   ├── palette.ts
│   │   └── typography.ts
│   └── utils/
│       ├── formatters.ts
│       └── permissions.ts
│
├── modules/
│   ├── auth/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── users/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── roles/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── audit/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── profile/
│   │   └── presentation/
│   └── websites/
│       ├── domain/
│       │   └── dto/
│       │       ├── websites.dto.ts
│       │       ├── content-types.dto.ts
│       │       ├── email-templates.dto.ts
│       │       └── forms.dto.ts
│       ├── infrastructure/
│       │   ├── schemas/
│       │   │   ├── website.schema.ts
│       │   │   ├── content-type.schema.ts
│       │   │   ├── content-field.schema.ts
│       │   │   ├── email-template.schema.ts
│       │   │   ├── form.schema.ts
│       │   │   └── form-field.schema.ts
│       │   └── services/
│       │       ├── websites.service.ts
│       │       ├── content-types.service.ts
│       │       ├── email-templates.service.ts
│       │       └── forms.service.ts
│       └── presentation/
│           ├── components/
│           │   ├── WebsiteFormDialog.tsx
│           │   ├── ContentTypeFormDialog.tsx
│           │   ├── ContentFieldFormDialog.tsx
│           │   ├── ContentTypesTab.tsx
│           │   ├── EmailTemplatesTab.tsx
│           │   ├── EmailTemplateFormDialog.tsx
│           │   ├── EmailTemplatePreview.tsx
│           │   ├── EmailTemplatePreviewDialog.tsx
│           │   ├── FormsTab.tsx
│           │   ├── FormFormDialog.tsx
│           │   ├── FormFieldFormDialog.tsx
│           │   ├── FormSubmissionDetailDialog.tsx
│           │   └── PublicFormApiDocDialog.tsx
│           ├── pages/
│           │   ├── WebsitesList.page.tsx
│           │   ├── WebsiteDetail.page.tsx
│           │   ├── ContentTypeDetail.page.tsx
│           │   └── FormDetail.page.tsx
│           ├── websites.lazy.ts
│           └── websites.routes.tsx
│
├── presentation/
│   ├── layouts/
│   │   ├── blankLayout/
│   │   │   └── BlankLayout.tsx
│   │   └── fullLayout/
│   │       ├── navbar/
│   │       ├── sidebar/
│   │       └── FullLayout.tsx
│   └── routes/
│       ├── ProtectedRoute.tsx
│       └── appRouter.tsx
│
└── shared/
    ├── components/
    │   ├── RouteProtector/
    │   ├── common/
    │   │   ├── PageHeader.tsx
    │   │   ├── GoogleSearchBar.tsx
    │   │   └── WebsiteFavicon.tsx
    │   ├── dialog/
    │   │   └── ConfirmDialog.tsx
    │   ├── loaders/
    │   └── tables/
    │       ├── ListTable.tsx
    │       └── ListTableSimple.tsx
    └── pages/
        ├── AccessDenied.page.tsx
        └── Dashboard.page.tsx
```

---

## 3. Core Layer

### 3.1 Centralized API (`core/api`)
Manages the Axios instance with interceptors for:
* Injecting `Authorization: Bearer <token>` automatically on authenticated requests.
* Intercepting HTTP 401 errors and orchestrating token refresh / logout.

### 3.2 Global Store (`core/store/authStore.ts`)
Zustand store managing authentication state:
* Current user object (`id`, `email`, `firstName`, `lastName`, `roles`, `permissions`, `isVerify`).
* Tokens (`accessToken`, `tokenExpiration`).
* Actions: `login()`, `logout()`, `setUser()`, `setAccessToken()`.

### 3.3 Permissions Engine (`core/utils/permissions.ts`)
UX permission helpers:
* `hasPermission(user, permission)`: Checks if the user has a specific permission or `SUPER_ADMIN` role.
* `hasSomePermission(user, [permissions])`: Checks if the user has any of the listed permissions.
* `hasAllPermissions(user, [permissions])`: Checks if the user has all listed permissions.

---

## 4. Modules Overview

### 4.1 `auth`
* **Pages**: Login, Password Reset Request, Password Reset Verify OTP, Password Reset New Password, Verify Account OTP / Activation.
* **Standards**: OTP validation integrated directly with the backend microservice.

### 4.2 `users`
* **Pages**: UsersList with search, role badges, status switches, creation/edit modals, and logical deactivation.
* **Forms**: Validated with Zod schemas and `zodResolver`.

### 4.3 `roles`
* **Pages**: Roles & Permissions Management with interactive Permissions Matrix Grid (`PermissionsMatrixGrid`).
* **Features**: Dynamic module grouping (Users, Roles, Websites, Content Types, Content Fields, Forms, Form Fields, Form Submissions, Email Templates, Emails, Audit) and bulk role permission assignment.

### 4.4 `audit`
* **Pages**: Audit Logs List with filters by resource, action, user, and interactive JSON diff inspector.

### 4.5 `profile`
* **Pages**: User profile overview, assigned institutional roles, account verification status, and password change.

### 4.6 `websites` (Core Domain, Headless CMS, Email Templates & Forms)
* **Navigation Architecture**:
  ```text
  Websites (/websites)
     ↓
  Website Detail (/websites/:websiteId)
     ├── Overview & Configuration Tab (?tab=)
     ├── Content Types Tab (?tab=content-types)
     │      ↓
     │   Content Type Detail (/websites/:websiteId/content-types/:contentTypeId)
     │      └── Content Schema Fields & Headless Items Management
     │
     ├── Email Templates Tab (?tab=email-templates)
     │      └── Email Templates Management, Editor & Live Sandbox Preview
     │
     └── Forms Tab (?tab=forms)
            ↓
         Form Detail (/websites/:websiteId/forms/:formId)
            ├── Overview Tab (?tab=overview): Email notifications, recipients & templates
            ├── Fields Tab (?tab=fields): Form fields typed schema management
            └── Submissions Tab (?tab=submissions): Submissions list, status & payload inspector
  ```
* **Pages**:
  * `WebsitesList.page.tsx`: Full responsive list of registered websites, domains, hosting providers, active/inactive toggles, API key overview, and deletion/regeneration dialogs.
  * `WebsiteDetail.page.tsx`: Detail view of website configuration with tabbed navigation (`Overview & Configuration`, `Content Types`, `Email Templates`, and `Forms`).
  * `ContentTypeDetail.page.tsx`: Dedicated management view for a specific `ContentType` and its structural `ContentField` schema list.
  * `FormDetail.page.tsx`: Detail view of a specific `Form` with tabbed navigation for `Overview`, `Fields` management, and `Submissions` history.
* **Components**:
  * `WebsiteFormDialog.tsx`: Dialog for creating and updating website configurations with real-time domain regex validation.
  * `ContentTypeFormDialog.tsx`: Dialog for creating and updating ContentTypes with slug auto-generation.
  * `ContentFieldFormDialog.tsx`: Dialog for creating and updating ContentFields with support for all 7 `FieldType` enum values (`STRING`, `TEXT`, `NUMBER`, `BOOLEAN`, `DATE`, `JSON`, `URL`).
  * `ContentTypesTab.tsx`: Embedded panel in `WebsiteDetail` displaying ContentTypes cards grid, stats counter, quick actions, and search filtering.
  * `EmailTemplatesTab.tsx`: Embedded panel in `WebsiteDetail` displaying all email templates, linked forms counter, search filtering, and CRUD operations.
  * `EmailTemplateFormDialog.tsx`: Dedicated split-view and tabbed HTML email editor dialog with starter templates, snippet insertion (`{{name}}`, `{{email}}`, etc.), Tab key indent support, and real-time live preview.
  * `EmailTemplatePreview.tsx`: Isolated, sandboxed `<iframe>` preview component with Desktop and Mobile viewport toggle.
  * `EmailTemplatePreviewDialog.tsx`: Modal for instant full-screen/dialog preview of existing email templates.
  * `FormsTab.tsx`: Embedded panel in `WebsiteDetail` displaying forms list, field counts, submission counts, email notification status, search, and CRUD dialogs.
  * `FormFormDialog.tsx`: Dialog for creating and updating Forms, slug generation, email notifications toggle, dynamic recipient management (tag list), and website-scoped EmailTemplate selector.
  * `FormFieldFormDialog.tsx`: Dialog for creating and updating FormFields with friendly type descriptions, required toggles, and key format validations.
  * `FormSubmissionDetailDialog.tsx`: Modal for inspecting dynamic submission `data` payloads, associated `Contact` details, and updating submission statuses (`PENDING`, `PROCESSED`, `SPAM`, `FAILED`).
  * `PublicFormApiDocDialog.tsx`: Interactive integration guide and API reference modal providing `curl`, `fetch`, and `axios` snippets for `POST /api/v1/forms/:slug/submit` with `x-api-key`.

---

## 5. Routing Strategy & Guards

```text
appRouter.tsx
├── /auth (BlankLayout, Public)
│   ├── /login
│   ├── /forgot-password
│   ├── /reset-password
│   └── /verify-account
│
└── / (FullLayout, Protected via ProtectedRoute)
    ├── / (DashboardPage)
    ├── /access-denied (AccessDeniedPage)
    ├── /websites (websitesRoutes, Protected by 'websites:read')
    │   ├── /:id (WebsiteDetailPage, Protected by 'websites:read')
    │   ├── /:websiteId/content-types/:contentTypeId (ContentTypeDetailPage, Protected by 'content-types:read')
    │   └── /:websiteId/forms/:formId (FormDetailPage, Protected by 'forms:read')
    ├── /users (usersRoutes, Protected by 'users:read')
    ├── /roles (rolesRoutes, Protected by 'roles:read')
    ├── /audit-logs (auditRoutes, Protected by 'audit:read')
    └── /profile (profileRoutes)
```

Route-level security is enforced through `<RouteProtector requiredPermission="..." />`. If the authenticated user lacks the required permission, they are automatically redirected to `/access-denied`.