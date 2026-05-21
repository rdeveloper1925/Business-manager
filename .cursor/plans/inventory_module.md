# Inventory Module — Cursor Build Plan

> **How to use this plan:** Feed one phase at a time into Cursor's composer so it stays focused. Always show Cursor an existing file from your app first (e.g. an existing controller or page) and say _"match this pattern exactly"_ before generating new ones.
>
> Every section, chunk, and checklist item is numbered so you can reference them precisely — e.g. "redo chunk 5.2" or "skip to chunk 7.3".

---

## Chunk 0 — Global Engineering Standards

> Apply these principles across **every file** generated in this module. Do not deviate from them.

### 0.1 — OOP & Design Principles
- **Single Responsibility Principle (SRP):** Every class does one thing. Controllers handle HTTP only. Services handle business logic only. Models handle data representation only.
- **Open/Closed Principle:** Use interfaces and abstract contracts so behaviour can be extended without modifying existing classes.
- **Dependency Inversion:** High-level classes (controllers, services) must depend on **abstractions (interfaces)**, not concretions. Never instantiate a service or repository with `new` inside another class — always inject via constructor.
- **Don't Repeat Yourself (DRY):** Extract any logic used in more than one place into a shared method, trait, or helper class.
- **Fail fast:** Validate and guard at the boundary (Form Requests, service method entry points). Never let bad data travel deeper into the stack.

### 0.2 — Dependency Injection Rules
- All services, repositories, and dependencies must be injected via **constructor injection** — never resolved inline with `app()` or `resolve()` except in service providers.
- Controllers must receive their dependencies via constructor injection, not method injection (exception: Form Requests and route model bindings, which Laravel resolves automatically via method injection).
- Register all service bindings in a dedicated `InventoryServiceProvider`.

### 0.3 — Type Safety
- All method signatures must have **full PHP 8.x type hints** on parameters and return types (including `void`, `bool`, `?int`, etc.).
- Use **typed properties** on all classes.
- Prefer value objects or DTOs over raw `array` for passing structured data between layers.

### 0.4 — Error Handling
- Services must throw **domain-specific exceptions** (e.g. `InsufficientStockException`, `InvalidTransactionException`) rather than returning nulls or booleans.
- Controllers must catch domain exceptions and convert them to appropriate HTTP responses or Inertia error flashes — never let raw exceptions bubble to the user.

---

## Chunk 1 — Database Layer

> Create the database migrations for the inventory module. Do not touch any existing migrations.

### 1.1 — Migration: `create_parts_table`

| Column | Type | Notes |
|---|---|---|
| `part_id` | `bigIncrements` | Primary Key |
| `part_name` | `string` | |
| `part_number` | `string` | unique |
| `description` | `text` | nullable |
| `unit_of_measure` | `string` | |
| `cost_price` | `decimal(10,2)` | |
| `sell_price` | `decimal(10,2)` | |
| `supplier_id` | `FK → suppliers.supplier_id` | nullable, nullOnDelete |
| `reorder_point` | `integer` | default 0 |
| `min_stock_level` | `integer` | default 0 |
| `max_stock_level` | `integer` | default 0 |
| — | `timestamps` | |
| — | `softDeletes` | |

### 1.2 — Migration: `create_inventory_table`

| Column | Type | Notes |
|---|---|---|
| `inventory_id` | `bigIncrements` | Primary Key |
| `part_id` | `FK → parts.part_id` | cascadeOnDelete |
| `quantity_on_hand` | `integer` | default 0 |
| `quantity_reserved` | `integer` | default 0 |
| `quantity_on_order` | `integer` | default 0 |
| `latest_count` | `timestamp` | nullable |
| — | `timestamps` | **No softDeletes** |

### 1.3 — Migration: `create_inventory_transactions_table`

| Column | Type | Notes |
|---|---|---|
| `transaction_id` | `bigIncrements` | Primary Key |
| `part_id` | `FK → parts.part_id` | |
| `supplier_id` | `FK → suppliers.supplier_id` | nullable |
| `performed_by` | `FK → users.id` | |
| `reference_id` | `unsignedBigInteger` | nullable — polymorphic |
| `reference_type` | `string` | nullable — polymorphic |
| `transaction_type` | `enum` | `RESTOCK, SALE, DAMAGED, ADJUSTMENT, RETURN, TRANSFER, STOCKTAKE` |
| `qty_delta` | `integer` | signed: positive = inbound, negative = outbound |
| `qty_after` | `integer` | |
| `unit_cost` | `decimal(10,2)` | nullable |
| `condition` | `enum` | `GOOD, DAMAGED, DEFECTIVE` — default `GOOD` |
| `notes` | `text` | nullable |
| `transacted_at` | `timestamp` | |
| — | `timestamps` | |
| — | `softDeletes` | |

### 1.4 — Run Migrations
```bash
php artisan migrate
```

---

## Chunk 2 — Models & Relationships

> Create Eloquent models in `app/Models/`. Match the conventions used by existing models in the project.

### 2.0 — OOP Instructions
- Models are **data representation classes only** — no business logic, no service calls, no HTTP concerns.
- Use `$fillable` (not `$guarded`) for explicit mass-assignment protection on every model.
- Declare all properties and relationships with full **PHPDoc `@property` annotations** so IDEs and static analysis tools can infer types.
- Accessors/mutators must use the **Laravel 9+ `Attribute` casting API** (`protected function fieldName(): Attribute`) rather than the legacy `getXxxAttribute` pattern.
- Do not add query-building logic directly to models. If a scope is needed (e.g. `scopeLowStock`), define it as a named scope method — do not inline raw queries in controllers or services.

### 2.1 — `Part` Model
- `$primaryKey = 'part_id'`
- `$fillable`: all columns except PK and timestamps
- Use `SoftDeletes` trait
- **Relationships:**
  - `belongsTo(Supplier::class, 'supplier_id', 'supplier_id')`
  - `hasOne(Inventory::class, 'part_id', 'part_id')`
  - `hasMany(InventoryTransaction::class, 'part_id', 'part_id')`
- **Named scope:** `scopeLowStock(Builder $query): Builder` — filters where `inventory.quantity_on_hand <= parts.reorder_point` (joins inventory table)

### 2.2 — `Inventory` Model
- `$primaryKey = 'inventory_id'`
- `$fillable`: all columns except PK
- **No SoftDeletes**
- **Relationships:**
  - `belongsTo(Part::class, 'part_id', 'part_id')`

### 2.3 — `InventoryTransaction` Model
- `$primaryKey = 'transaction_id'`
- `$fillable`: all columns except PK
- Use `SoftDeletes` trait
- Cast `transacted_at` to `datetime`
- Cast `transaction_type` → `App\Enums\TransactionType` (string-backed enum)
- Cast `condition` → `App\Enums\ConditionType` (string-backed enum)
- **Relationships:**
  - `belongsTo(Part::class, 'part_id', 'part_id')`
  - `belongsTo(Supplier::class, 'supplier_id', 'supplier_id')`
  - `belongsTo(User::class, 'performed_by')`
  - `morphTo('reference')` using `reference_id` / `reference_type`

### 2.4 — Enums
- `App\Enums\TransactionType` — string-backed; cases: `RESTOCK`, `SALE`, `DAMAGED`, `ADJUSTMENT`, `RETURN`, `TRANSFER`, `STOCKTAKE`
- `App\Enums\ConditionType` — string-backed; cases: `GOOD`, `DAMAGED`, `DEFECTIVE`
- Add a `label(): string` method to each enum returning a human-readable label for display in the UI

---

## Chunk 3 — Data Transfer Objects (DTOs)

> Create immutable DTO classes to pass structured data between layers. **Never pass raw `array` between a controller and a service.**
> Place DTOs in `app/DataTransferObjects/Inventory/`.

### 3.0 — OOP Instructions
- DTOs must be **`readonly` classes** (PHP 8.2+) so they are immutable after construction.
- Every property must be **strictly typed**.
- Add a static `fromRequest(Request $request): static` factory method on each DTO so the controller can construct it from a Form Request cleanly.
- DTOs must have **no methods other than** the static factory and any value-object helpers (e.g. `toArray()` if needed for Eloquent).

### 3.1 — `RecordTransactionData`
```php
readonly class RecordTransactionData
{
    public function __construct(
        public int $partId,
        public TransactionType $transactionType,
        public int $qtyDelta,
        public ConditionType $condition,
        public Carbon $transactedAt,
        public ?int $supplierId,
        public ?int $referenceId,
        public ?string $referenceType,
        public ?float $unitCost,
        public ?string $notes,
    ) {}

    public static function fromRequest(StoreInventoryTransactionRequest $request): static { ... }
}
```

### 3.2 — `StockSummaryData`
```php
readonly class StockSummaryData
{
    public function __construct(
        public int $quantityOnHand,
        public int $quantityReserved,
        public int $quantityOnOrder,
        public int $available,
        public bool $isBelowReorder,
    ) {}
}
```

---

## Chunk 4 — Interfaces & Service Provider

> Define contracts (interfaces) for the service layer before implementing them. This enforces the Dependency Inversion Principle and makes the codebase testable and swappable.
> Place interfaces in `app/Contracts/Inventory/`.

### 4.1 — `InventoryServiceInterface`
```php
interface InventoryServiceInterface
{
    public function recordTransaction(RecordTransactionData $data, User $performedBy): InventoryTransaction;
    public function getLowStockParts(): Collection;
    public function getStockSummary(Part $part): StockSummaryData;
}
```

### 4.2 — `InventoryServiceProvider`
- Create `app/Providers/InventoryServiceProvider.php`
- Register it in `config/app.php` under `providers`
- Bind the interface to the concrete implementation:
```php
$this->app->bind(
    InventoryServiceInterface::class,
    InventoryService::class,
);
```
- **Do not** bind or resolve services anywhere else. All wiring happens here.

---

## Chunk 5 — Form Requests & Validation

> Create Laravel Form Request classes in `app/Http/Requests/Inventory/`.

### 5.0 — OOP Instructions
- Use `Rule::enum()` for enum validation rather than raw `in:` strings — this keeps validation coupled to the enum definition, so adding a new enum case automatically updates validation.
- Add a `protected function prepareForValidation(): void` method on `StoreInventoryTransactionRequest` to cast `qty_delta` to an integer and normalise `transacted_at` to a consistent datetime format before validation runs.
- Form Requests must **not** contain any business logic — only validation rules and authorization.

### 5.1 — `StorePartRequest`
- **Required:** `part_name`, `part_number` (unique), `unit_of_measure`, `cost_price`, `sell_price`
- **Optional:** `description`, `supplier_id` (exists in suppliers), `reorder_point`, `min_stock_level`, `max_stock_level`
- Numeric validation on price and stock fields; `min:0` on all stock level fields

### 5.2 — `UpdatePartRequest`
- Same rules as `StorePartRequest` but `part_number` unique rule must exclude the current record:
  `Rule::unique('parts', 'part_number')->ignore($this->part, 'part_id')`

### 5.3 — `StoreInventoryTransactionRequest`
- **Required:** `part_id` (exists in parts), `transaction_type` (`Rule::enum(TransactionType::class)`), `qty_delta` (integer, not zero), `condition` (`Rule::enum(ConditionType::class)`), `transacted_at` (date)
- **Optional:** `supplier_id`, `reference_id`, `reference_type`, `unit_cost`, `notes`
- `prepareForValidation()`: cast `qty_delta` to `(int)`, normalise `transacted_at` to `Y-m-d H:i:s`

### 5.4 — `UpdateInventoryRequest` _(manual stock adjustments)_
- `quantity_on_hand`, `quantity_reserved`, `quantity_on_order` — all integer, `min:0`
- `latest_count` — nullable date

---

## Chunk 6 — Service Layer

> Implement `app/Services/InventoryService.php`. This class must implement `InventoryServiceInterface`.

### 6.0 — OOP Instructions
- The service class must be **`final`** — it should not be extended; behaviour changes happen via the interface binding, not inheritance.
- Inject all dependencies via the constructor using type-hinted interfaces or concrete models consistently — do not mix.
- Define **private helper methods** for sub-steps (e.g. `private function applyDelta(Inventory $inventory, int $delta): void`) to keep public methods readable and single-purpose.
- Throw typed domain exceptions — create these in `app/Exceptions/Inventory/`:
  - `InsufficientStockException` — when a negative `qty_delta` would push `quantity_on_hand` below zero
  - `InvalidTransactionException` — for any other business rule violation

### 6.1 — Constructor
```php
public function __construct(
    private readonly Part $partModel,
    private readonly Inventory $inventoryModel,
    private readonly InventoryTransaction $transactionModel,
) {}
```

### 6.2 — `recordTransaction(RecordTransactionData $data, User $performedBy): InventoryTransaction`
- Wraps all DB writes in `DB::transaction()`
- Guards: throws `InsufficientStockException` if resulting stock would go negative
- Creates the `InventoryTransaction` record
- Calls `private function applyDelta()` to update `Inventory.quantity_on_hand`
- If `STOCKTAKE` → sets `Inventory.latest_count` to `now()`
- If `RESTOCK` → decrements `Inventory.quantity_on_order` by `qty_delta`
- Returns the created `InventoryTransaction`

### 6.3 — `getLowStockParts(): Collection`
- Delegates to `Part::lowStock()->with(['inventory', 'supplier'])->get()`
- Returns a typed `Collection` of `Part` models

### 6.4 — `getStockSummary(Part $part): StockSummaryData`
- Loads `$part->inventory` if not already loaded
- Returns a `StockSummaryData` DTO (never a raw array)

---

## Chunk 7 — Controllers & Routes

> Create controllers in `app/Http/Controllers/Inventory/`. Inject `InventoryServiceInterface` — never the concrete `InventoryService`.

### 7.0 — OOP Instructions
- All controllers must be **`final`** classes.
- Inject `InventoryServiceInterface` via **constructor injection**. Laravel's service container resolves it via the binding in `InventoryServiceProvider`.
- Controllers must contain **zero business logic**. Their only responsibilities: receive the HTTP request → delegate to the service → return an Inertia response or redirect.
- Wrap service calls in `try/catch` blocks. Catch domain exceptions (`InsufficientStockException`, `InvalidTransactionException`) and flash a user-friendly error — never let them propagate as 500s.
- Use route model binding for all `show`, `edit`, `update`, `destroy` methods — accept the model directly as a typed parameter, not a raw ID.

### 7.1 — `PartController` _(resource)_
```php
public function __construct(
    private readonly InventoryServiceInterface $inventoryService,
) {}
```

| Method | Action |
|---|---|
| `index` | Paginated list; search by `part_name`/`part_number`; filter by supplier; sort by name/cost/stock |
| `create` | Return Inertia create form |
| `store(StorePartRequest $request)` | Delegate to service or model; redirect to index on success |
| `show(Part $part)` | Load with inventory + last 10 transactions |
| `edit(Part $part)` | Return Inertia edit form |
| `update(UpdatePartRequest $request, Part $part)` | Delegate; redirect to show on success |
| `destroy(Part $part)` | Soft delete; redirect to index |

### 7.2 — `InventoryController`
```php
public function __construct(
    private readonly InventoryServiceInterface $inventoryService,
) {}
```

| Method | Action |
|---|---|
| `index` | Dashboard — calls `getLowStockParts()` and `getStockSummary()`; passes props to Inertia |
| `adjust(UpdateInventoryRequest $request)` | Constructs `RecordTransactionData` DTO → calls `recordTransaction()` → catch domain exceptions → redirect |

### 7.3 — `InventoryTransactionController`
```php
public function __construct(
    private readonly InventoryServiceInterface $inventoryService,
) {}
```

| Method | Action |
|---|---|
| `index` | Paginated; filterable by part, type, condition, date range |
| `store(StoreInventoryTransactionRequest $request)` | Constructs `RecordTransactionData::fromRequest($request)` → calls `recordTransaction()` → catch domain exceptions |
| `show(InventoryTransaction $transaction)` | Single transaction detail |
| `destroy(InventoryTransaction $transaction)` | Soft delete |

### 7.4 — Routes
Add to `routes/web.php`:

```php
Route::prefix('inventory')->name('inventory.')->middleware('auth')->group(function () {
    Route::get('/', [InventoryController::class, 'index'])->name('dashboard');
    Route::post('/adjust', [InventoryController::class, 'adjust'])->name('adjust');
    Route::resource('parts', PartController::class);
    Route::resource('transactions', InventoryTransactionController::class)
         ->only(['index', 'store', 'show', 'destroy']);
});
```

> ✅ **Checkpoint:** Run `php artisan route:list | grep inventory` to verify all routes. Resolve the service in tinker (`app(\App\Contracts\Inventory\InventoryServiceInterface::class)`) to confirm DI binding resolves correctly before proceeding to frontend.

---

## Chunk 8 — Frontend: Factories & Seeders

> Create factories and a seeder for the inventory module.

### 8.1 — `PartFactory`
- Realistic part names and part numbers (format: `PT-XXXXX`)
- Random `cost_price` and `sell_price` (cost < sell)
- Valid `supplier_id` drawn from existing suppliers
- Random but logical `reorder_point`, `min_stock_level`, `max_stock_level` values

### 8.2 — `InventoryFactory`
- Tied to a `Part`
- Random quantities within sensible ranges (on_hand ≥ 0, reserved ≤ on_hand)
- `latest_count` set to a recent timestamp

### 8.3 — `InventoryTransactionFactory`
- All enum values randomly selected
- `qty_delta` can be positive or negative
- `qty_after` calculated as a realistic running total
- `transacted_at` staggered across the past 90 days
- `performed_by` drawn from existing users

### 8.4 — `InventorySeeder`
- Create **30 Parts**, each with one `Inventory` record and 5–10 `InventoryTransaction` records
- Register in `DatabaseSeeder.php`

---

## Chunk 9 — Frontend: Inventory Dashboard

> Create `resources/js/pages/inventory/Index.jsx`.
> Follow the existing app's UI aesthetic exactly — reuse existing layout components, navigation, sidebar, color tokens, button styles, table styles, badge styles, and typography.

### 9.0 — React/JS Instructions
- Extract every distinct UI section into its own **named component** in `resources/js/components/inventory/`. Pages compose components — they do not contain inline JSX for complex sections.
- All components must be **pure and stateless** where possible. Lift state up to the page level.
- Pass explicit, named props to every component. Do not spread entire objects (`{...props}`) unless the component is a thin wrapper.
- Use `PropTypes` or **TypeScript interfaces** (if the project uses TS) for all component props.

### 9.1 — Props (from Inertia)
```js
{ summaryCards, lowStockParts, recentTransactions }
```

### 9.2 — `<InventorySummaryCards cards={summaryCards} />`
- 4-across grid: Total Parts, Total SKUs in Stock, Low Stock Alerts count, Pending Orders count

### 9.3 — `<LowStockAlertsTable parts={lowStockParts} />`
- Columns: Part Name | Part Number | Qty on Hand | Reorder Point | Action
- Per-row "Record Restock" button linking to `inventory.transactions.create` with part pre-selected

### 9.4 — `<RecentTransactionsFeed transactions={recentTransactions} />`
- Part name, type badge (colour-coded by `TransactionType`), qty delta (green positive / red negative), performed by, date

### 9.5 — Page Actions
- Prominent "New Transaction" button top-right

---

## Chunk 10 — Frontend: Parts CRUD Pages

> Create the following pages under `resources/js/pages/inventory/parts/`. Match the existing app's UI aesthetic.

### 10.0 — React/JS Instructions
- The Part form (`Create.jsx` / `Edit.jsx`) must share a **single `<PartForm />` component** (`resources/js/components/inventory/PartForm.jsx`). Do not duplicate form JSX across two pages.
- Use `useForm` from `@inertiajs/react` for all form state, submission, and error handling — do not manage form state with raw `useState`.
- The supplier field must be a **searchable/combobox select**, not a plain `<select>`. Reuse the existing searchable select component from the app if one exists.

### 10.1 — `Index.jsx` — Parts List
- Debounced search by part name / part number (use a `useDebounce` hook — extract to `resources/js/hooks/useDebounce.js` if not already present)
- Supplier filter dropdown
- Sortable columns: Part Name, Part Number, Cost Price, Sell Price, Stock on Hand
- **Table columns:** Part Number | Part Name | Supplier | Stock on Hand | Reorder Point | Status Badge (`OK` / `LOW` / `OUT`) | Actions (View, Edit, Delete)
- Pagination
- "Add Part" button top-right

### 10.2 — `Create.jsx` / `Edit.jsx` — Part Form (via shared `<PartForm />`)
**Fields:**
- Part Name, Part Number, Description (textarea), Unit of Measure
- Cost Price, Sell Price
- Supplier (searchable select — exclude soft-deleted suppliers)
- Reorder Point, Min Stock Level, Max Stock Level
- Inline validation errors under each field (`useForm.errors.field_name`)
- Cancel / Save buttons

### 10.3 — `Show.jsx` — Part Detail
- **`<PartInfoCard part={part} />`** — all fields read-only
- **`<InventoryStatusCard inventory={inventory} summary={summary} />`** — On Hand, Reserved, On Order, Available, status badge
- **`<TransactionHistoryTable transactions={transactions} />`** — paginated, last 20; columns: Date | Type | Delta | Condition | Notes | Performed By
- "Record Transaction" button

---

## Chunk 11 — Frontend: Transaction Pages

> Create the following pages under `resources/js/pages/inventory/transactions/`. Match the existing app's UI aesthetic.

### 11.0 — React/JS Instructions
- The transaction type badge colouring must be defined in a **single shared constant/map** (`resources/js/constants/transactionTypeConfig.js`) — colour, label, and icon per type. Import it wherever badges are rendered; never inline colour logic in multiple components.
- The live stock preview in `Create.jsx` must be a **pure derived value** computed from the selected part's current stock and the entered `qty_delta` — do not store `qty_after` in state separately; derive it inline.

### 11.1 — `Index.jsx` — Transactions List
- Filters: Part (searchable select), Transaction Type (multi-select), Condition, Date range picker
- **Table columns:** Date | Part | Type (badge) | Qty Delta | Qty After | Unit Cost | Condition | Performed By | Notes | Actions
- Toggle to show/hide soft-deleted records (hidden by default)
- Export to CSV button (stub with a `console.warn` if not yet implemented)

### 11.2 — `Create.jsx` — New Transaction Form
**Fields:**
- Part selector (searchable; on selection, display current stock from Inertia-passed part data)
- Transaction Type (enum dropdown, sourced from `transactionTypeConfig.js`)
- Qty Delta (signed integer input; derive and display `qty_after = currentStock + qtyDelta` as live read-only preview)
- Condition (enum dropdown)
- Unit Cost (optional)
- Supplier (optional — conditionally rendered only when type = `RESTOCK` or `RETURN`)
- Notes (textarea)
- Transacted At (datetime picker, defaults to `now`)

**Live Preview Panel:**
> _"Stock will change from **X** → **Y**"_ — red if `qty_after < 0`, amber if below reorder point, green otherwise.

### 11.3 — `Show.jsx` — Transaction Detail
- All fields in a clean read-only card layout

---

## Chunk 12 — Polish & Final Wiring

> Do a final wiring and polish pass across the entire module.

### 12.1 — Navigation
- [ ] Add inventory link(s) to the existing sidebar/nav using the same nav item component; icon + label; highlight active state

### 12.2 — Flash Messages
- [ ] Ensure create/update/delete success messages display via the existing toast/alert component on all Parts and Transaction pages

### 12.3 — Inertia Shared Data
- [ ] Verify auth user and flash messages are passed through all inventory controllers

### 12.4 — Soft-Delete Exclusions
- [ ] Ensure soft-deleted Parts are excluded from all dropdowns and select inputs throughout the module

### 12.5 — Route Model Binding
- [ ] Override `getRouteKeyName()` on `Part`, `Inventory`, and `InventoryTransaction` models to return the correct custom PKs (`part_id`, `inventory_id`, `transaction_id`)

### 12.6 — DI Binding Verification
- [ ] In tinker, run `app(\App\Contracts\Inventory\InventoryServiceInterface::class)` and confirm it resolves to `InventoryService` without errors

### 12.7 — Domain Exception Handling
- [ ] Trigger an `InsufficientStockException` manually in tinker and confirm the controller catches it and flashes a user-friendly message rather than a 500 page

### 12.8 — Smoke Test
- [ ] Add the following as reference comments at the top of `InventoryService.php`:

```php
// Tinker smoke test:
// $part = Part::factory()->create();
// Inventory::factory()->for($part, 'part')->create();
// $data = new RecordTransactionData(
//     partId: $part->part_id,
//     transactionType: TransactionType::RESTOCK,
//     qtyDelta: 50,
//     condition: ConditionType::GOOD,
//     transactedAt: now(),
//     supplierId: null,
//     referenceId: null,
//     referenceType: null,
//     unitCost: null,
//     notes: null,
// );
// app(\App\Contracts\Inventory\InventoryServiceInterface::class)
//     ->recordTransaction($data, User::first());
```

### 12.9 — Seed Verification
- [ ] Run `php artisan db:seed --class=InventorySeeder` and manually verify seed data renders correctly across all pages

---

## File Structure Reference

```
app/
├── Contracts/
│   └── Inventory/
│       └── InventoryServiceInterface.php       ← Chunk 4.1
├── DataTransferObjects/
│   └── Inventory/
│       ├── RecordTransactionData.php            ← Chunk 3.1
│       └── StockSummaryData.php                 ← Chunk 3.2
├── Enums/
│   ├── TransactionType.php                      ← Chunk 2.4
│   └── ConditionType.php                        ← Chunk 2.4
├── Exceptions/
│   └── Inventory/
│       ├── InsufficientStockException.php       ← Chunk 6.0
│       └── InvalidTransactionException.php      ← Chunk 6.0
├── Http/
│   ├── Controllers/Inventory/
│   │   ├── InventoryController.php              ← Chunk 7.2
│   │   ├── PartController.php                   ← Chunk 7.1
│   │   └── InventoryTransactionController.php   ← Chunk 7.3
│   └── Requests/Inventory/
│       ├── StorePartRequest.php                 ← Chunk 5.1
│       ├── UpdatePartRequest.php                ← Chunk 5.2
│       ├── StoreInventoryTransactionRequest.php ← Chunk 5.3
│       └── UpdateInventoryRequest.php           ← Chunk 5.4
├── Models/
│   ├── Part.php                                 ← Chunk 2.1
│   ├── Inventory.php                            ← Chunk 2.2
│   └── InventoryTransaction.php                 ← Chunk 2.3
├── Providers/
│   └── InventoryServiceProvider.php             ← Chunk 4.2
└── Services/
    └── InventoryService.php                     ← Chunk 6

database/
├── factories/
│   ├── PartFactory.php                          ← Chunk 8.1
│   ├── InventoryFactory.php                     ← Chunk 8.2
│   └── InventoryTransactionFactory.php          ← Chunk 8.3
├── migrations/
│   ├── xxxx_create_parts_table.php              ← Chunk 1.1
│   ├── xxxx_create_inventory_table.php          ← Chunk 1.2
│   └── xxxx_create_inventory_transactions.php   ← Chunk 1.3
└── seeders/
    └── InventorySeeder.php                      ← Chunk 8.4

resources/js/
├── components/inventory/
│   ├── InventorySummaryCards.jsx                ← Chunk 9.2
│   ├── LowStockAlertsTable.jsx                  ← Chunk 9.3
│   ├── RecentTransactionsFeed.jsx               ← Chunk 9.4
│   ├── PartForm.jsx                             ← Chunk 10.2
│   ├── PartInfoCard.jsx                         ← Chunk 10.3
│   ├── InventoryStatusCard.jsx                  ← Chunk 10.3
│   └── TransactionHistoryTable.jsx              ← Chunk 10.3
├── constants/
│   └── transactionTypeConfig.js                 ← Chunk 11.0
├── hooks/
│   └── useDebounce.js                           ← Chunk 10.1
└── pages/inventory/
    ├── Index.jsx                                ← Chunk 9
    ├── parts/
    │   ├── Index.jsx                            ← Chunk 10.1
    │   ├── Create.jsx                           ← Chunk 10.2
    │   ├── Edit.jsx                             ← Chunk 10.2
    │   └── Show.jsx                             ← Chunk 10.3
    └── transactions/
        ├── Index.jsx                            ← Chunk 11.1
        ├── Create.jsx                           ← Chunk 11.2
        └── Show.jsx                             ← Chunk 11.3
```