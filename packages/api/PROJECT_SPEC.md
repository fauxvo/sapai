# SAP S/4HANA Integration Service — Project Specification

> **Living Document** — This spec serves as the single source of truth for our SAP integration codebase.
> Claude Code agents should read this before making any changes. Update this file as decisions evolve.

---

## 1. Project Overview

### Goal

Build an enterprise-grade, type-safe SAP S/4HANA integration service in TypeScript that provides robust CRUD operations across core SAP business objects. The service should abstract the complexity of SAP's deeply hierarchical OData entity models behind clean, composable service interfaces.

### Target System

- **SAP S/4HANA 2025** Fully Activated Appliance (on-prem via GCP)
- **Region**: GCP `northamerica-northeast1` (Montreal)
- **Protocol**: OData V2 (see Decision Log for rationale)
- **SDK**: `@sap-cloud-sdk/odata-v2` v3.x, `@sap-cloud-sdk/http-client` v3.x

### Runtime & Language

- **Node.js** (LTS)
- **TypeScript** — strict mode, no `any` types in production code
- **Generated OData clients** via SAP Cloud SDK generator for full type safety

---

## 2. Architecture & Design Principles

### 2.1 Layered Architecture

```
┌──────────────────────────────────────────────────┐
│                   Consumers                       │
│         (REST API / Salesforce / CLI)             │
├──────────────────────────────────────────────────┤
│              Service Layer                        │
│    PurchaseOrderService, BusinessPartnerService   │
│    SalesOrderService, ProductService, etc.        │
│    ─── Encapsulates full entity hierarchies ───   │
├──────────────────────────────────────────────────┤
│            OData Client Layer                     │
│    Generated typed clients per API service        │
│    ─── Handles request building & execution ───   │
├──────────────────────────────────────────────────┤
│           Connection / Auth Layer                 │
│    Destination management, CSRF tokens,           │
│    retry logic, error extraction                  │
├──────────────────────────────────────────────────┤
│            SAP S/4HANA 2025                       │
│         OData V2 API Endpoints                    │
└──────────────────────────────────────────────────┘
```

### 2.2 Core Principles

1. **Each SAP business object gets a dedicated service class** that encapsulates its entire entity hierarchy (header → items → sub-entities).
2. **Deep inserts for creation** — when the API supports it, create the full object graph in a single request via navigation properties (`to_Item`, `to_ScheduleLine`, etc.).
3. **Strict typing** — all entity shapes come from generated OData clients or manually maintained interfaces that mirror the `$metadata` schema exactly.
4. **Error handling must surface SAP business messages** — not just HTTP status codes. SAP returns detailed error objects in the response body with message class, number, and variable substitutions. These must be parsed and surfaced.
5. **ETag-based optimistic locking** — all update/delete operations must respect ETags returned by SAP. The SDK handles this automatically when entities are read before mutation.
6. **CSRF token management** — all mutating requests (POST/PATCH/DELETE) require a valid CSRF token. The SDK handles this, but custom HTTP calls must fetch tokens explicitly.
7. **No hardcoded URLs or credentials in committed code** — all connection config via environment variables or destination service.

### 2.3 Directory Structure

```
src/
├── generated/                    # Auto-generated OData clients (DO NOT EDIT)
│   ├── purchase-order-service/   # API_PURCHASEORDER_PROCESS_SRV (32 files)
│   ├── sales-order-service/      # API_SALES_ORDER_SRV (73 files)
│   └── batch-request.ts
├── services/                     # Business logic service layer
│   ├── base/
│   │   ├── BaseService.ts        # Shared connection, error handling, CSRF
│   │   └── types.ts              # Shared result/error types
│   ├── purchase-order/
│   │   ├── PurchaseOrderService.ts
│   │   ├── PurchaseOrderService.test.ts
│   │   ├── types.ts              # PO header + item input/output types
│   │   └── index.ts
│   ├── purchase-order-notes/
│   │   ├── PurchaseOrderNoteService.ts
│   │   ├── PurchaseOrderNoteService.test.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── purchase-order-schedule-lines/
│   │   ├── PurchaseOrderScheduleLineService.ts
│   │   ├── PurchaseOrderScheduleLineService.test.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── purchase-order-account-assignments/
│   │   ├── PurchaseOrderAccountAssignmentService.ts
│   │   ├── PurchaseOrderAccountAssignmentService.test.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── purchase-order-pricing-elements/
│   │   ├── PurchaseOrderPricingElementService.ts
│   │   ├── PurchaseOrderPricingElementService.test.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── business-partner/         # Phase 3 (planned)
│   ├── sales-order/              # Phase 4 (planned)
│   └── product/                  # Phase 4 (planned)
├── routes/sap/
│   ├── health.ts                 # GET /sap/health (SAP connectivity check)
│   ├── purchase-orders.ts        # PO header + item routes (11 routes)
│   ├── po-notes.ts               # PO + item note routes (10 routes)
│   ├── po-schedule-lines.ts      # Schedule line + component routes (9 routes)
│   ├── po-account-assignments.ts # Account assignment routes (5 routes)
│   └── po-pricing-elements.ts    # Pricing element routes (4 routes)
├── schemas/
│   └── error.ts                  # sapErrorResponses, mapSapStatus, sanitize
├── config/
│   ├── destination.ts            # SAP HttpDestination factory
│   ├── destination.test.ts
│   ├── environment.ts            # Zod-validated env vars
│   └── environment.test.ts
├── utils/
│   ├── error-parser.ts           # SAP OData error message extraction
│   └── error-parser.test.ts
├── app.ts                        # OpenAPIHono app, route mounting, OpenAPI spec
└── index.ts                      # Server entry point
```

---

## 3. OData Protocol Decision

### Why V2 over V4?

| Factor                           | V2                                     | V4                                              |
| -------------------------------- | -------------------------------------- | ----------------------------------------------- |
| **API maturity for procurement** | Fully mature, battle-tested            | Still catching up, some gaps                    |
| **SAP Cloud SDK support**        | Complete, stable                       | Complete, but V2 APIs are more documented       |
| **Deep insert support**          | Well-established patterns              | Supported, but less community knowledge         |
| **Community resources**          | Extensive (SAP Community, blogs, KBAs) | Growing but limited                             |
| **Default payload format**       | XML/Atom (JSON via `$format=json`)     | JSON natively                                   |
| **S/4HANA 2025 coverage**        | All procurement APIs available         | `API_PURCHASEORDER_2` available but less proven |

**Decision**: Stay with OData V2 via `@sap-cloud-sdk/odata-v2` v3.x. Revisit for V4 migration when coverage and community maturity reach parity. The SDK's abstraction layer means migration cost will be manageable.

**Key V2 behaviors to be aware of:**

- Navigation properties prefixed with `to_` (e.g., `to_PurchaseOrderItem`)
- Deep insert via nested `to_*` properties in POST body
- `$expand` required to fetch related entities in GET requests
- `$format=json` header/param for JSON responses
- CSRF token required for all mutating operations (fetched via `x-csrf-token: fetch` header on a GET)

---

## 4. Entity Coverage — Detailed API Reference

This is the core reference for understanding what we're integrating with. Each API section documents the complete entity hierarchy, navigation properties, CRUD support, and known gotchas.

---

### 4.1 Purchase Orders (PRIORITY: 1 — Reference Implementation)

**API Service**: `API_PURCHASEORDER_PROCESS_SRV`
**Base Path**: `/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV`
**Communication Scenario**: `SAP_COM_0053` (Purchase Order Integration)
**SAP API Hub**: https://api.sap.com/api/API_PURCHASEORDER_PROCESS_SRV/overview

#### Entity Hierarchy

```
A_PurchaseOrder (Header)
├── to_PurchaseOrderItem → A_PurchaseOrderItem[]
│   ├── to_ScheduleLine → A_PurchaseOrderScheduleLine[]
│   ├── to_AccountAssignment → A_PurOrdAccountAssignment[]
│   ├── to_PurchaseOrderSubcontractingComp → A_POSubcontractingComponent[]
│   └── to_PricingElement → A_PurOrdPricingElement[]
└── to_PurchaseOrderNote → A_PurchaseOrderNote[]
```

#### Entity Details

**`A_PurchaseOrder` (Header)**

- **Key**: `PurchaseOrder` (string, 10 chars)
- **Key fields for creation**: `CompanyCode`, `PurchaseOrderType`, `Supplier`, `PurchasingOrganization`, `PurchasingGroup`, `DocumentCurrency`
- **Common fields**: `PurchaseOrderDate`, `Language`, `PaymentTerms`, `CashDiscount1Days`, `CashDiscount1Percent`, `IncotermsClassification`, `IncotermsTransferLocation`, `ManualSupplierAddressID`, `AddressName`
- **Status fields** (read-only): `PurchasingDocumentDeletionCode`, `ReleaseIsNotCompleted`, `PurchasingCompletenessStatus`
- **Navigation**: `to_PurchaseOrderItem`, `to_PurchaseOrderNote`
- **CRUD**: Create ✅ | Read ✅ | Update ✅ | Delete ✅
- **Deep insert**: YES — can create header + items + schedule lines + account assignments in single POST

**`A_PurchaseOrderItem`**

- **Keys**: `PurchaseOrder` + `PurchaseOrderItem` (string, 5 chars)
- **Core fields**: `Material`, `PurchaseOrderItemText`, `OrderQuantity`, `PurchaseOrderQuantityUnit`, `NetPriceAmount`, `NetPriceQuantity`, `Plant`, `StorageLocation`, `MaterialGroup`, `GoodsReceiptIsExpected`, `InvoiceIsExpected`
- **Delivery fields**: `DeliveryAddressName`, `DeliveryAddressStreetName`, `DeliveryAddressCityName`, `DeliveryAddressCountry`, `DeliveryAddressPostalCode`
- **Tolerance fields**: `OverdelivTolrtdLmtRatioInPct`, `UnlimitedOverdeliveryIsAllowed`, `UnderdelivTolrtdLmtRatioInPct`
- **Account assignment**: `AccountAssignmentCategory` (K=cost center, P=project, etc.)
- **Navigation**: `to_ScheduleLine`, `to_AccountAssignment`, `to_PricingElement`, `to_PurchaseOrderSubcontractingComp`
- **CRUD**: Create ✅ | Read ✅ | Update ✅ | Delete ✅
- **Important**: Quantity and delivery info lives HERE, not on the header. When users think "edit a PO quantity," they mean editing an item.

**`A_PurchaseOrderScheduleLine`**

- **Keys**: `PurchasingDocument` + `PurchasingDocumentItem` + `ScheduleLine`
- **Core fields**: `ScheduleLineDeliveryDate`, `ScheduleLineOrderQuantity`, `PurchaseOrderQuantityUnit`, `DelivDateCategory`
- **Performance period**: `PerfPeriodStartDate`, `PerfPeriodEndDate`
- **Requisition link**: `PurchaseRequisition`, `PurchaseRequisitionItem`
- **CRUD**: Create ✅ | Read ✅ | Update ✅ | Delete ✅

**`A_PurOrdAccountAssignment`**

- **Keys**: `PurchaseOrder` + `PurchaseOrderItem` + `AccountAssignmentNumber`
- **Core fields**: `Quantity`, `CostCenter`, `GLAccount`, `WBSElement`, `ProjectNetwork`, `NetworkActivity`, `OrderID`, `ProfitCenter`, `MasterFixedAsset`
- **CRUD**: Create ✅ | Read ✅ | Update ✅ | Delete ✅

**`A_PurOrdPricingElement`**

- **Keys**: `PurchaseOrder` + `PurchaseOrderItem` + `PricingDocument` + `PricingDocumentItem` + `PricingProcedureStep` + `PricingProcedureCounter`
- **Core fields**: `ConditionType`, `ConditionRateValue`, `ConditionCurrency`, `ConditionQuantity`, `ConditionQuantityUnit`
- **CRUD**: Read ✅ | Update ✅ (limited — conditions are typically system-managed)

**`A_POSubcontractingComponent`**

- **Keys**: `PurchaseOrder` + `PurchaseOrderItem` + `ScheduleLine` + `ReservationItem` + `RecordType`
- **Used for**: Subcontracting scenarios where components are provided to supplier
- **CRUD**: Read ✅ | Update ✅

**`A_PurchaseOrderNote`**

- **Keys**: `PurchaseOrder` + `PurchaseOrderItemNumber` + `TextObjectType` + `Language`
- **Core fields**: `PlainLongText`
- **CRUD**: Create ✅ | Read ✅ | Update ✅ | Delete ✅

#### Deep Insert Example (Create PO with Items and Schedule Lines)

```json
POST /sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder

{
  "CompanyCode": "1710",
  "PurchaseOrderType": "NB",
  "Supplier": "17300001",
  "PurchasingOrganization": "1710",
  "PurchasingGroup": "001",
  "DocumentCurrency": "USD",
  "to_PurchaseOrderItem": [
    {
      "PurchaseOrderItem": "10",
      "Material": "TG11",
      "PurchaseOrderItemText": "Test Material",
      "OrderQuantity": "100",
      "PurchaseOrderQuantityUnit": "PC",
      "Plant": "1710",
      "NetPriceAmount": "10.00",
      "NetPriceQuantity": "1",
      "AccountAssignmentCategory": "",
      "to_ScheduleLine": [
        {
          "ScheduleLineDeliveryDate": "2026-03-15T00:00:00",
          "ScheduleLineOrderQuantity": "100"
        }
      ]
    }
  ]
}
```

#### Known Gotchas — Purchase Orders

- **Adding items to existing POs**: You can POST individual items to an existing PO, but adding multiple items in a single request to an existing PO may not work as expected. Test thoroughly.
- **Quantity is on Item, not Header**: New developers often look for quantity on `A_PurchaseOrder` — it's on `A_PurchaseOrderItem`.
- **Price is on Item too**: `NetPriceAmount` and related pricing lives on the item level.
- **Account assignment category drives required fields**: If `AccountAssignmentCategory` = `K` (cost center), you MUST provide `CostCenter` in `to_AccountAssignment`. If `P` (project), you need `WBSElement` or `ProjectNetwork`+`NetworkActivity`.
- **Schedule lines are required**: Every item needs at least one schedule line with a delivery date and quantity.
- **Deletion is a soft flag**: `DELETE` on a PO header sets a deletion indicator, it doesn't physically remove the document.

---

### 4.2 Business Partners (PRIORITY: 2)

**API Service**: `API_BUSINESS_PARTNER`
**Base Path**: `/sap/opu/odata/sap/API_BUSINESS_PARTNER`
**Communication Scenario**: `SAP_COM_0008` (Business Partner Integration)
**SAP API Hub**: https://api.sap.com/api/API_BUSINESS_PARTNER/overview

#### Entity Hierarchy

```
A_BusinessPartner (Root)
├── to_BusinessPartnerAddress → A_BusinessPartnerAddress[]
│   ├── to_AddressUsage → A_BuPaAddressUsage[]
│   ├── to_EmailAddress → A_AddressEmailAddress[]
│   ├── to_PhoneNumber → A_AddressPhoneNumber[]
│   ├── to_FaxNumber → A_AddressFaxNumber[]
│   └── to_URLAddress → A_AddressHomePageURL[]
├── to_BusinessPartnerBank → A_BusinessPartnerBank[]
├── to_BusinessPartnerRole → A_BusinessPartnerRole[]
├── to_BusinessPartnerTax → A_BusinessPartnerTaxNumber[]
├── to_BusPartIdpn → A_BusPartIdpn[] (Identification)
├── to_Customer → A_Customer (1:1)
│   ├── to_CustomerCompany → A_CustomerCompany[]
│   ├── to_CustomerSalesArea → A_CustomerSalesArea[]
│   │   └── to_PartnerFunction → A_CustSalesPartnerFunc[]
│   ├── to_CustomerDunning → A_CustomerDunning[]
│   └── to_CustomerWithHoldingTax → A_CustomerWithHoldingTax[]
└── to_Supplier → A_Supplier (1:1)
    ├── to_SupplierCompany → A_SupplierCompany[]
    ├── to_SupplierPurchasingOrg → A_SupplierPurchasingOrg[]
    │   └── to_PartnerFunction → A_SupplierPartnerFunc[]
    └── to_SupplierWithHoldingTax → A_SupplierWithHoldingTax[]
```

#### Entity Details

**`A_BusinessPartner` (Root)**

- **Key**: `BusinessPartner` (string, 10 chars)
- **Creation fields**: `BusinessPartnerCategory` (1=Person, 2=Organization, 3=Group), `FirstName`, `LastName` (for Person), `OrganizationBPName1` (for Org)
- **Common fields**: `BusinessPartnerFullName`, `BusinessPartnerGrouping`, `Language`, `SearchTerm1`, `SearchTerm2`, `AuthorizationGroup`
- **Deep insert**: YES — can create BP + addresses + roles + customer/supplier extensions in one request
- **CRUD**: Create ✅ | Read ✅ | Update ✅ | Delete ❌ (BPs cannot be deleted via API)
- **Important**: Business Partners are the unified master data object. A BP can be BOTH a customer AND a supplier simultaneously.

**`A_BusinessPartnerAddress`**

- **Keys**: `BusinessPartner` + `AddressID`
- **Core fields**: `StreetName`, `HouseNumber`, `PostalCode`, `CityName`, `Country`, `Region`
- **Navigation**: `to_EmailAddress`, `to_PhoneNumber`, `to_FaxNumber`, `to_URLAddress`
- **CRUD**: Create ✅ | Read ✅ | Update ✅ | Delete ✅

**`A_Customer` (Extension of BP)**

- **Key**: `Customer` (same as BusinessPartner number)
- **Core fields**: `CustomerAccountGroup`, `CustomerClassification`, `PaymentTerms`
- **Navigation**: `to_CustomerCompany`, `to_CustomerSalesArea`
- **Important**: Created via deep insert from `A_BusinessPartner` using `to_Customer` navigation

**`A_Supplier` (Extension of BP)**

- **Key**: `Supplier` (same as BusinessPartner number)
- **Core fields**: `AlternativePayeeAccountNumber`, `PaymentTerms`
- **Navigation**: `to_SupplierCompany`, `to_SupplierPurchasingOrg`
- **Important**: Created via deep insert from `A_BusinessPartner` using `to_Supplier` navigation

#### Deep Insert Example (Create BP as Supplier)

```json
POST /sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner

{
  "BusinessPartnerCategory": "2",
  "OrganizationBPName1": "Acme Corp",
  "BusinessPartnerGrouping": "BPGR",
  "Language": "EN",
  "to_BusinessPartnerAddress": [
    {
      "StreetName": "123 Main St",
      "CityName": "New York",
      "PostalCode": "10001",
      "Country": "US",
      "to_EmailAddress": [
        { "EmailAddress": "contact@acme.com", "IsDefaultEmailAddress": true }
      ]
    }
  ],
  "to_BusinessPartnerRole": [
    { "BusinessPartnerRole": "FLVN01" }
  ],
  "to_Supplier": {
    "to_SupplierPurchasingOrg": [
      {
        "PurchasingOrganization": "1710",
        "PaymentTerms": "0001",
        "PurchaseOrderCurrency": "USD"
      }
    ]
  }
}
```

#### Known Gotchas — Business Partners

- **Cannot delete**: `A_BusinessPartner` does not support DELETE operations. You can only archival-flag or block.
- **Customer vs Supplier is an extension**: A BP becomes a customer or supplier by creating the respective extension entity via `to_Customer` or `to_Supplier`.
- **Partner functions query**: Use `A_CustSalesPartnerFunc` or `A_SupplierPartnerFunc` entity sets directly with `$filter=BusinessPartner eq 'XXXX'` rather than navigating from the root.
- **Company code data is separate**: Sales area data and company code data for customers/suppliers are separate entities that must be created individually or via deep insert.

---

### 4.3 Sales Orders (PRIORITY: 3)

**API Service**: `API_SALES_ORDER_SRV`
**Base Path**: `/sap/opu/odata/sap/API_SALES_ORDER_SRV`
**Communication Scenario**: `SAP_COM_0109` (Sales Order Integration)
**SAP API Hub**: https://api.sap.com/api/API_SALES_ORDER_SRV/overview

#### Entity Hierarchy

```
A_SalesOrder (Header)
├── to_Item → A_SalesOrderItem[]
│   ├── to_Partner → A_SalesOrderItemPartner[]
│   │   └── to_Address → A_SalesOrderItemPartnerAddress[]
│   ├── to_PricingElement → A_SalesOrderItemPrElement[]
│   ├── to_ScheduleLine → A_SalesOrderScheduleLine[]
│   ├── to_BillingPlan → A_SalesOrderItemBillingPlan
│   │   └── to_BillingPlanItem → A_SlsOrdItemBillingPlanItem[]
│   ├── to_Text → A_SalesOrderItemText[]
│   └── to_RelatedObject → A_SalesOrderItemRelatedObject[]
├── to_Partner → A_SalesOrderHeaderPartner[]
│   └── to_Address → A_SalesOrderHeaderPartnerAddress[]
├── to_PricingElement → A_SalesOrderHeaderPrElement[]
├── to_BillingPlan → A_SalesOrderBillingPlan
│   └── to_BillingPlanItem → A_SalesOrderBillingPlanItem[]
├── to_PaymentPlanItemDetails → A_SlsOrdPaymentPlanItemDetails[]
├── to_Text → A_SalesOrderText[]
└── to_RelatedObject → A_SalesOrderRelatedObject[]
```

#### Entity Details

**`A_SalesOrder` (Header)**

- **Key**: `SalesOrder` (string, 10 chars)
- **Creation fields**: `SalesOrderType`, `SalesOrganization`, `DistributionChannel`, `OrganizationDivision`, `SoldToParty`
- **Common fields**: `PurchaseOrderByCustomer`, `SalesOrderDate`, `TransactionCurrency`, `RequestedDeliveryDate`, `ShippingCondition`, `IncotermsClassification`
- **Deep insert**: YES — header + items + partners + pricing elements + texts in one request
- **CRUD**: Create ✅ | Read ✅ | Update ✅ | Delete ✅
- **Important**: Schedule lines CANNOT be deep-inserted during creation. Create the SO first, then POST schedule lines separately.

**`A_SalesOrderItem`**

- **Keys**: `SalesOrder` + `SalesOrderItem`
- **Core fields**: `Material`, `RequestedQuantity`, `RequestedQuantityUnit`, `SalesOrderItemCategory`, `SalesOrderItemText`, `NetAmount`, `TransactionCurrency`
- **Navigation**: `to_Partner`, `to_PricingElement`, `to_ScheduleLine`, `to_Text`, `to_BillingPlan`, `to_RelatedObject`

**`A_SalesOrderScheduleLine`**

- **Keys**: `SalesOrder` + `SalesOrderItem` + `ScheduleLine`
- **Core fields**: `ScheduleLineOrderQuantity`, `OrderQuantityUnit`, `RequestedDeliveryDate`
- **CRITICAL**: Cannot be deep-inserted during SO creation. Must be created separately via POST to existing item.

#### Known Gotchas — Sales Orders

- **Schedule lines NOT deep-insertable on create**: Unlike Purchase Orders, Sales Order schedule lines must be created in a separate request after the SO and items exist.
- **Partner functions are automatic**: SAP auto-determines partners (ship-to, bill-to, payer) from customer master data. You can override via `to_Partner` but often don't need to.
- **Pricing is mostly system-driven**: Pricing elements are calculated by SAP's pricing engine. You can read them and update certain manual conditions, but you generally don't create them.

---

### 4.4 Products / Material Master (PRIORITY: 4)

**API Service**: `API_PRODUCT_SRV`
**Base Path**: `/sap/opu/odata/sap/API_PRODUCT_SRV`
**Communication Scenario**: `SAP_COM_0009` (Product Integration)
**SAP API Hub**: https://api.sap.com/api/API_PRODUCT_SRV/overview

#### Entity Hierarchy

```
A_Product (Root — "Material" in classic SAP terms)
├── to_Description → A_ProductDescription[]
├── to_Plant → A_ProductPlant[]
│   ├── to_PlantCosting → A_ProductPlantCosting
│   ├── to_PlantForecast → A_ProductPlantForecasting
│   ├── to_PlantInternationalTrade → A_ProductPlantIntlTrd
│   ├── to_PlantMRP → A_ProductPlantMRPArea[]
│   ├── to_PlantProcurement → A_ProductPlantProcurement
│   ├── to_PlantPurchaseTax → A_ProductPlantQualityMgmt
│   ├── to_PlantSales → A_ProductPlantSales
│   ├── to_PlantStorage → A_ProductPlantStorage
│   ├── to_PlantText → A_ProductPlantText[]
│   └── to_ProductSupplyPlanning → A_ProductSupplyPlanning
├── to_ProductUnitsOfMeasure → A_ProductUnitsOfMeasure[]
│   └── to_ProductUnitsOfMeasureEAN → A_ProductUnitsOfMeasureEAN[]
├── to_SalesDelivery → A_ProductSalesDelivery[]
│   ├── to_SalesTax → A_ProductSalesTax[]
│   └── to_SalesText → A_ProductSalesText[]
├── to_Valuation → A_ProductValuation[]
│   ├── to_ProductValuationAccount → A_ProductValuationAccount
│   └── to_ProductMLAccount → A_ProductMLAccount
└── to_ProductBasicText → A_ProductBasicText[]
```

#### Entity Details

**`A_Product` (Root)**

- **Key**: `Product` (string, 40 chars — this is the Material Number)
- **Creation fields**: `ProductType`, `IndustrySector`, `BaseUnit`
- **Common fields**: `ProductGroup`, `GrossWeight`, `NetWeight`, `WeightUnit`, `Division`, `ProductOldID`
- **Deep insert**: YES — can create product with descriptions, plant data, sales views, valuation in one request
- **CRUD**: Create ✅ | Read ✅ | Update ✅ | Delete ❌ (products cannot be deleted, only flagged)

**`A_ProductPlant`**

- **Keys**: `Product` + `Plant`
- **Core fields**: `PurchasingGroup`, `MRPType`, `MRPController`, `ReorderThresholdQuantity`, `PlanningTimeFence`, `LotSizingProcedure`
- **Important**: This is where procurement and planning parameters live per plant.

**`A_ProductSalesDelivery`**

- **Keys**: `Product` + `ProductSalesOrg` + `ProductDistributionChnl`
- **Core fields**: `SalesUnit`, `MinimumOrderQuantity`, `ItemCategoryGroup`, `DeliveryNoteProcMinDelivQty`

**`A_ProductValuation`**

- **Keys**: `Product` + `ValuationArea` (+ `ValuationType` if split valuation)
- **Core fields**: `StandardPrice`, `PriceUnitQty`, `MovingAveragePrice`, `ValuationClass`

#### Known Gotchas — Products

- **"Material" = "Product"**: SAP rebranded "Material" to "Product" in S/4HANA. The API uses `Product` terminology, but underlying tables are still `MARA`, `MARC`, etc.
- **Views are organizational**: Plant data, sales org data, and valuation data are per-organizational-unit. Creating a product with all views requires deep insert across multiple nav properties.
- **`GrossWeight`/`WeightUnit` on UoM entity**: If you set weight at the product level AND on the `to_ProductUnitsOfMeasure` entity, the UoM-level value takes precedence for that specific unit.
- **Classification not via this API**: Product classification (characteristics, classes) uses a separate API (`API_CLFN_PRODUCT_SRV`), not `API_PRODUCT_SRV`.

---

### 4.5 Material Stock (PRIORITY: 5 — Read Only)

**API Service**: `API_MATERIAL_STOCK_SRV`
**Base Path**: `/sap/opu/odata/sap/API_MATERIAL_STOCK_SRV`
**SAP API Hub**: https://api.sap.com/api/API_MATERIAL_STOCK_SRV/overview

#### Entity Hierarchy

```
A_MaterialStock (Root — aggregated stock by material)
└── to_MatlStkInAcctMod → A_MatlStkInAcctMod[]
    (Stock per accounting model / valuation type / batch / etc.)
```

#### Entity Details

**`A_MaterialStock`**

- **Key**: `Material` + `Plant` + `StorageLocation` + `Batch` + `Supplier` + `Customer` + `WBSElementInternalID` + `SDDocument` + `SDDocumentItem` + `InventorySpecialStockType` + `InventoryStockType`
- **Core fields**: `MatlWrhsStkQtyInMatlBaseUnit` (warehouse stock), `MaterialBaseUnit`
- **CRUD**: Read ✅ ONLY — stock is modified via Goods Movement APIs, not directly.

---

### 4.6 Future Candidates (Not Yet Scoped)

| API Service                        | Business Object       | Notes                        |
| ---------------------------------- | --------------------- | ---------------------------- |
| `API_PURCHASEREQ_PROCESS_SRV`      | Purchase Requisitions | Often precedes PO creation   |
| `API_INBOUND_DELIVERY_SRV;v=0002`  | Inbound Deliveries    | Goods receipt processing     |
| `API_BILLING_DOCUMENT_SRV`         | Billing Documents     | Invoice processing           |
| `API_MATERIAL_DOCUMENT_SRV`        | Material Documents    | Goods movements              |
| `API_COMPANYCODE_SRV`              | Company Codes         | Org structure reference data |
| `API_SUPPLIER_INVOICE_PROCESS_SRV` | Supplier Invoices     | AP invoice processing        |

---

## 5. Service Layer Patterns

### 5.1 Base Service Pattern

Every service class extends `BaseService` which provides:

```typescript
abstract class BaseService {
  protected destination: Destination;

  // Wraps all OData calls with standardized error handling
  protected async execute<T>(fn: () => Promise<T>): Promise<ServiceResult<T>>;

  // Extracts SAP business messages from error responses
  protected parseSapError(error: unknown): SapBusinessError;

  // Standard pagination wrapper for getAll queries
  protected async getAll<T>(builder: GetAllRequestBuilder<T>): Promise<T[]>;
}

interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: SapBusinessError;
}

interface SapBusinessError {
  httpStatus: number;
  code: string; // SAP message class + number
  message: string; // Human-readable message
  details: SapErrorDetail[]; // Additional error details from inner error
}
```

### 5.2 Service Method Naming Convention

```typescript
class PurchaseOrderService extends BaseService {
  // READ
  async getById(purchaseOrder: string): Promise<ServiceResult<PurchaseOrder>>;
  async getAll(
    filters?: PurchaseOrderFilters,
  ): Promise<ServiceResult<PurchaseOrder[]>>;
  async getItemsByPO(
    purchaseOrder: string,
  ): Promise<ServiceResult<PurchaseOrderItem[]>>;

  // CREATE
  async create(
    input: CreatePurchaseOrderInput,
  ): Promise<ServiceResult<PurchaseOrder>>;
  async addItem(
    purchaseOrder: string,
    item: CreatePOItemInput,
  ): Promise<ServiceResult<PurchaseOrderItem>>;

  // UPDATE
  async updateHeader(
    purchaseOrder: string,
    changes: UpdatePOHeaderInput,
  ): Promise<ServiceResult<PurchaseOrder>>;
  async updateItem(
    purchaseOrder: string,
    item: string,
    changes: UpdatePOItemInput,
  ): Promise<ServiceResult<PurchaseOrderItem>>;

  // DELETE
  async delete(purchaseOrder: string): Promise<ServiceResult<void>>;
  async deleteItem(
    purchaseOrder: string,
    item: string,
  ): Promise<ServiceResult<void>>;
}
```

### 5.3 Input Types Pattern

Separate input types from OData entity types. Input types are what consumers use; they're friendlier and don't require deep SAP knowledge:

```typescript
// Consumer-friendly input
interface CreatePurchaseOrderInput {
  companyCode: string;
  orderType: string;
  supplier: string;
  purchasingOrg: string;
  purchasingGroup: string;
  currency: string;
  items: CreatePOItemInput[];
}

interface CreatePOItemInput {
  material: string;
  description?: string;
  quantity: number;
  unit: string;
  plant: string;
  netPrice: number;
  deliveryDate: string; // ISO date string
  accountAssignment?: {
    category: 'K' | 'P' | 'F'; // cost center / project / fixed asset
    costCenter?: string;
    wbsElement?: string;
    glAccount?: string;
  };
}
```

The service layer maps these to proper OData entity shapes internally.

---

## 6. Client Generation

### 6.1 Generating Typed OData Clients

Download metadata from your S/4HANA instance and generate typed clients:

```bash
# 1. Download metadata
curl -u USER:PASS \
  "https://<SAP_HOST>/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/\$metadata" \
  -o service-specs/API_PURCHASEORDER_PROCESS_SRV.edmx

# 2. Generate typed client
npx generate-odata-client \
  --inputDir service-specs \
  --outputDir src/generated \
  --overwrite
```

### 6.2 Generated Client Usage

```typescript
import { purchaseOrderService } from './generated/purchase-order-service';

const { purchaseOrderApi } = purchaseOrderService();

// Type-safe query with expand
const po = await purchaseOrderApi
  .requestBuilder()
  .getByKey('4500000001')
  .select(
    purchaseOrderApi.schema.PURCHASE_ORDER,
    purchaseOrderApi.schema.COMPANY_CODE,
    purchaseOrderApi.schema.SUPPLIER,
    purchaseOrderApi.schema.TO_PURCHASE_ORDER_ITEM,
  )
  .execute(destination);
```

---

## 7. Connection Configuration

### 7.1 Environment Variables

```bash
# Required
SAP_BASE_URL=https://<sap-host>:<port>
SAP_CLIENT=100                      # SAP client number
SAP_USERNAME=<technical_user>
SAP_PASSWORD=<password>

# Optional
SAP_LANGUAGE=EN
SAP_TIMEOUT_MS=30000
SAP_MAX_RETRIES=3
```

### 7.2 Destination Object

```typescript
import { HttpDestination } from '@sap-cloud-sdk/connectivity';

const destination: HttpDestination = {
  url: process.env.SAP_BASE_URL!,
  username: process.env.SAP_USERNAME!,
  password: process.env.SAP_PASSWORD!,
  authentication: 'BasicAuthentication',
  sapClient: process.env.SAP_CLIENT!,
};
```

---

## 8. Error Handling Strategy

### 8.1 SAP Error Response Structure

SAP returns structured errors in OData error format:

```json
{
  "error": {
    "code": "MEPO/013",
    "message": {
      "lang": "en",
      "value": "Company code 1710 does not exist"
    },
    "innererror": {
      "errordetails": [
        {
          "code": "MEPO/013",
          "message": "Company code 1710 does not exist",
          "severity": "error"
        },
        {
          "code": "MM/355",
          "message": "Purchase order was not created",
          "severity": "error"
        }
      ]
    }
  }
}
```

### 8.2 Parsing Strategy

Always extract the full error details array, not just the top-level message. The root `message` is often generic ("Purchase order was not created") while the `errordetails` array contains the actual root cause.

---

## 9. Testing Strategy

### 9.1 Layers

1. **Unit tests**: Test service layer mapping logic (input → OData entity) without SAP connectivity
2. **Integration tests**: Hit the real S/4HANA instance with test data. Use dedicated PO type / sales org for test data isolation.
3. **Generated client tests**: Verify the generated client compiles and the entity shapes match expectations

### 9.2 Test Data Conventions

- Use PO type `NB` (Standard PO) for test purchase orders
- Use Supplier `17300001` (pre-configured in Fully Activated Appliance)
- Use Plant `1710`, Company Code `1710`, Purchasing Org `1710`
- Material `TG11` is available in the sample data

---

## 10. Implementation Phases

### Phase 1: Foundation — COMPLETE (2026-02-23)

- [x] Generate typed OData clients for PO + Sales Order APIs (32 + 73 files)
- [x] Implement `BaseService` with `execute()` wrapper and SAP error parsing
- [x] Implement connection/destination configuration (Zod-validated env, `HttpDestination` factory)
- [x] Set up project structure per Section 2.3
- [x] First Zod-OpenAPI route (`GET /sap/health`) with auto-generated OpenAPI 3.1 spec
- [x] Scalar API docs at `/docs`
- [x] Vitest test suite (13 tests: error-parser, environment, destination)

### Phase 1b: ESLint + Prettier — COMPLETE (2026-02-23)

- [x] ESLint 9 flat config (`eslint.config.mjs`) with `typescript-eslint` + `eslint-config-prettier`
- [x] Prettier config (single quotes, trailing commas, 80 char width)
- [x] Lint scripts in all packages, format scripts at root
- [x] Zero lint errors, all files formatted

### Phase 2: Purchase Orders — COMPLETE (2026-02-23)

- [x] `PurchaseOrderService` with full CRUD (header + items)
- [x] Deep insert for create (header + items + schedule lines + account assignments)
- [x] Update operations at header and item levels (read-before-update pattern for ETag)
- [x] Deletion (soft delete via deletion indicator)
- [x] 28 Zod-OpenAPI routes covering the full PO entity hierarchy
- [x] 63 unit tests across 8 test files (services + config)
- [ ] Integration tests against live S/4HANA instance
- [x] Patterns documented for other services to follow

#### Phase 2 Sub-Entity Services

5 dedicated service classes, each extending `BaseService`:

| Service | Entity | Routes | Operations |
|---------|--------|--------|------------|
| `PurchaseOrderService` | Header + Items | 11 | Full CRUD + deep insert + filters |
| `PurchaseOrderNoteService` | PO Notes + Item Notes | 10 | Full CRUD (header-level and item-level) |
| `PurchaseOrderScheduleLineService` | Schedule Lines + Subcontracting Components | 9 | Full CRUD for lines; read/update/delete for components |
| `PurchaseOrderAccountAssignmentService` | Account Assignments | 5 | Full CRUD |
| `PurchaseOrderPricingElementService` | Pricing Elements | 4 | Read/update/delete (no create — system-managed) |

#### Phase 2 Architecture Decisions

- **Separate service class per entity group** — keeps each class focused (~200-300 lines) instead of one 1000+ line monolith
- **Separate route file per entity group** — each exports an `OpenAPIHono` app mounted in `app.ts` under `/sap`
- **`sapErrorResponses` shared helper** — all routes spread `...sapErrorResponses` for consistent error status codes (400/401/403/404/409/500), solving Hono's strict route typing
- **`SapErrorStatus` narrow type** — `mapSapStatus()` returns `400 | 401 | 403 | 404 | 409 | 500` (literal numbers for exact type narrowing)
- **Zod schemas as single source of truth** — base schemas in `types.ts`, route files use `.extend()` for API-boundary validation (ISO date regex, time format)
- **Health endpoint enhanced** — `degraded` state for auth failures (401/403), `authenticated` boolean, env-driven TLS trust via `SAP_TRUST_ALL_CERTS`

### Phase 3: Business Partners (Next)

- [ ] Implement `BusinessPartnerService`
- [ ] Deep insert for BP + address + customer/supplier extensions
- [ ] Update operations across entity hierarchy
- [ ] Read with common filter patterns

### Phase 4: Sales Orders & Products

- [ ] Implement `SalesOrderService` (following PO patterns)
- [ ] Implement `ProductService` (read-heavy, creation is complex)
- [ ] Implement `MaterialStockService` (read-only)

### Phase 5: Cleanup & Hardening

- [ ] Remove all dev/test artifacts and hardcoded values
- [ ] Audit for any credentials or URLs in code
- [ ] Add retry logic and circuit breaker patterns
- [ ] Performance optimization (batch requests, selective $expand)
- [ ] Comprehensive documentation

---

## 11. Decision Log

| Date    | Decision                                    | Rationale                                                                                                                       |
| ------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 2026-02 | Use OData V2, not V4                        | V2 procurement APIs are more mature, better documented, broader community support. SDK abstractions will ease future migration. |
| 2026-02 | Use SAP Cloud SDK client generation         | Full type safety, automatic ETag/CSRF handling, fluent query builders reduce boilerplate.                                       |
| 2026-02 | Purchase Orders as reference implementation | Most complex hierarchy (5+ entity levels), covers deep insert patterns, representative of other APIs.                           |
| 2026-02 | Separate input types from OData types       | Consumer-facing types should be clean and not leak SAP-specific naming conventions.                                             |
| 2026-02 | Commit generated OData clients              | CI works without the generator. `src/generated/` is NOT gitignored.                                                             |
| 2026-02 | ESLint 9 flat config at monorepo root       | Single source of truth for all packages. `eslint-config-prettier` disables conflicting rules.                                   |
| 2026-02 | Hono `OpenAPIHono` + `@hono/zod-openapi`    | Auto-generated OpenAPI 3.1 spec from Zod route schemas. No hand-crafted spec object.                                            |
| 2026-02 | Separate service class per entity group      | One class per SAP entity group (~200-300 lines each) instead of a monolith. All extend `BaseService`.                            |
| 2026-02 | Separate route file per entity group         | Each exports an `OpenAPIHono` app mounted in `app.ts`. Keeps route files under 300 lines.                                       |
| 2026-02 | Shared `sapErrorResponses` helper            | All routes spread consistent error status codes, solving Hono's strict route typing. `mapSapStatus` returns narrow literal union. |
| 2026-02 | Zod schemas single source of truth           | Base schemas in `types.ts`; route files `.extend()` with API-boundary validation (ISO dates, time format).                       |
| 2026-02 | No notes in deep insert                      | Notes are typically added post-creation. Deep insert covers items + schedule lines + account assignments only.                    |
| 2026-02 | Pricing elements: no create                  | Pricing conditions are system-managed via SAP's pricing engine. API exposes read/update/delete only.                             |
| 2026-02 | Subcontracting components: no create         | Components are system-managed via BOM explosion. API exposes read/update/delete only.                                            |

---

## 12. References

- **SAP Business Accelerator Hub**: https://api.sap.com
- **SAP Cloud SDK for JS/TS**: https://sap.github.io/cloud-sdk/docs/js/overview
- **OData V2 Client Guide**: https://sap.github.io/cloud-sdk/docs/js/features/odata/v2-client
- **OData Client Generation**: https://sap.github.io/cloud-sdk/docs/js/features/odata/generate-client
- **SAP KBA: PO V2 vs V4 Differences**: https://userapps.support.sap.com/sap/support/knowledge/en/3360429
