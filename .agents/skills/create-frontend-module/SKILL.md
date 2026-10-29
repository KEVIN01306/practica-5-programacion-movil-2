---
name: create-frontend-module
description: Creates or updates a feature module in frontend (Flutter) following Clean Architecture (domain, infrastructure, presentation) or references legacy React architecture in frontend_.
---

# Skill: Create Frontend Module (`create-frontend-module`)

## What It Does
Standardizes how feature modules are built in `frontend/` (Flutter), separating domain entities/contracts, infrastructure data sources / Dio repositories, and presentation state management & UI widgets.

## Flutter Directory Structure (`frontend/lib/`)
```text
frontend/lib/
├── core/
│   ├── network/          # Dio HTTP client, Interceptors, Base API Response
│   ├── constants/        # API endpoints, Asset paths, Environment config
│   ├── theme/            # App colors, Typography, ThemeData
│   └── errors/           # Failure & Exception classes
├── shared/
│   ├── widgets/          # Custom buttons, text fields, loaders, alert dialogs
│   └── utils/            # Formatters (currency, dates), Validators
└── modules/
    └── <modulo>/
        ├── domain/
        │   ├── models/           # Domain entities (immutable with copyWith, fromJson/toJson)
        │   └── repositories/     # Abstract repository contracts
        ├── infrastructure/
        │   ├── datasources/      # Remote data source (Dio HTTP requests)
        │   ├── mappers/          # DTO to Domain Entity mappers
        │   └── repositories/     # Concrete repository implementation
        └── presentation/
            ├── controllers/      # State management (BLoC, Cubit, or ChangeNotifier)
            ├── views/            # Screens/Pages (List, Form, Detail)
            └── widgets/          # Module-specific widgets (cards, list tiles)
```

## Legacy Reference (`frontend_/src/modules/<modulo>/`)
The original React + Vite project was structured with:
- `domain/`: Interfaces and Zod schemas
- `infrastructure/repositories/`: Axios API clients
- `presentation/`: Pages, components, custom hooks

The Flutter migration follows this exact separation of concerns, utilizing Dart strong typing and decoupled data layers.
