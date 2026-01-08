# Development Guidelines & Architecture Standards

This project follows strictly enforced coding principles to ensure maintainability, scalability, and clarity. All future development must adhere to these guidelines.

## core Principles

### 1. SOLID
- **Single Responsibility**: Classes/Components should do one thing.
  - *Backend*: Controllers delegate to Services. Services handle business logic. Repositories handle data access.
  - *Frontend*: Pages handle layout/state. UI Components (`@/components/ui`) handle visual rendering.
- **Open/Closed**: Code should be open for extension but closed for modification. Use interfaces and abstraction.

### 2. KISS (Keep It Simple, Stupid)
- **Avoid Over-Engineering**: Do not implement complex patterns (like Abstract Factories or Event Buses) unless absolutely necessary.
- **Readability First**: Code should be readable by a junior developer. Explicit is better than implicit.

### 3. DRY (Don't Repeat Yourself)
- **Frontend**: NEVER write inline styles for common elements. Use the reusable UI components (`Card`, `Button`, `Input`, `Modal`, `Alert`).
- **Backend**: Extract repeated logic into helper methods or utility classes.

### 4. YAGNI (You Aren't Gonna Need It)
- **No Speculative Features**: Do not add fields, methods, or endpoints "just in case" we need them later. Implement only what is required for the current feature.

---

## Backend Standards (Spring Boot)

1.  **Layered Architecture**: `Controller` -> `Service` -> `Repository`.
2.  **No Logic in Controllers**: Controllers strictly handle HTTP request parsing and response formatting. All Input/Output logic belongs in Services.
3.  **DTOs**: Use DTOs (Data Transfer Objects) for API requests/responses. Do not expose Entities directly if possible (though for simple CRUD, we currently relax this rule for KISS, but be mindful).
4.  **Logging**: Use `@Slf4j` and `log.info`/`log.error`. NEVER use `System.out.println`.

## Frontend Standards (React + Neo-Brutalism)

1.  **Neo-Brutalist Identity**:
    - High contrast, bold borders (`2px - 4px solid black`).
    - Harsh shadows (`box-shadow: 4px 4px 0 0 black`).
    - Vibrant, specific colors (e.g., `#fde047`, `#86efac`).
2.  **Component Reusability**:
    - Always import basic building blocks from `src/components/ui`.
    - Do not create custom buttons or inputs in page files.
3.  **State Management**:
    - Keep state as local as possible.
    - Use `axios` efficiently (handle errors gracefully with `Alert`).
