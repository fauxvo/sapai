import type { IntentDefinition } from '@sapai/shared';

export const intentRegistry: IntentDefinition[] = [
  {
    id: 'GET_PURCHASE_ORDER',
    name: 'View Purchase Order',
    description: 'Retrieve a purchase order by its number, including all items',
    category: 'read',
    confirmation: 'never',
    requiredFields: [
      {
        name: 'poNumber',
        type: 'string',
        description:
          'Purchase Order number (10-digit string, e.g., 4500000001)',
      },
    ],
    optionalFields: [],
    apiEndpoint: {
      method: 'GET',
      path: '/sap/purchase-orders/{poNumber}',
      pathParams: ['poNumber'],
    },
    examples: [
      'Show me PO 4500000001',
      'Get purchase order 4500000001',
      'Look up PO 4500000001',
      'What does PO 4500000001 look like?',
    ],
  },
  {
    id: 'LIST_PURCHASE_ORDERS',
    name: 'List Purchase Orders',
    description: 'List purchase orders with optional filters',
    category: 'read',
    confirmation: 'never',
    requiredFields: [],
    optionalFields: [
      {
        name: 'supplier',
        type: 'string',
        description: 'Filter by supplier number',
      },
      {
        name: 'companyCode',
        type: 'string',
        description: 'Filter by company code',
      },
      {
        name: 'purchasingOrganization',
        type: 'string',
        description: 'Filter by purchasing organization',
      },
      {
        name: 'purchasingGroup',
        type: 'string',
        description: 'Filter by purchasing group',
      },
      {
        name: 'orderType',
        type: 'string',
        description: 'Filter by order type (e.g., NB for standard)',
      },
      {
        name: 'top',
        type: 'number',
        description: 'Maximum number of results to return',
      },
    ],
    apiEndpoint: {
      method: 'GET',
      path: '/sap/purchase-orders',
      pathParams: [],
    },
    examples: [
      'List all purchase orders',
      'Show me POs for supplier 17300001',
      'Get the last 5 purchase orders',
      'Show purchase orders for company code 1710',
    ],
  },
  {
    id: 'CREATE_PURCHASE_ORDER',
    name: 'Create Purchase Order',
    description: 'Create a new purchase order with line items',
    category: 'create',
    confirmation: 'always',
    requiredFields: [
      {
        name: 'companyCode',
        type: 'string',
        description: 'Company code (e.g., 1710)',
      },
      {
        name: 'orderType',
        type: 'string',
        description: 'Order type (e.g., NB for standard)',
      },
      {
        name: 'supplier',
        type: 'string',
        description: 'Supplier number',
      },
      {
        name: 'purchasingOrg',
        type: 'string',
        description: 'Purchasing organization',
      },
      {
        name: 'purchasingGroup',
        type: 'string',
        description: 'Purchasing group',
      },
      {
        name: 'currency',
        type: 'string',
        description: 'Document currency (e.g., USD)',
      },
      {
        name: 'items',
        type: 'array',
        description:
          'Line items array with material, quantity, unit, plant, netPrice, deliveryDate',
      },
    ],
    optionalFields: [],
    apiEndpoint: {
      method: 'POST',
      path: '/sap/purchase-orders',
      pathParams: [],
      bodySchema: 'CreatePurchaseOrderInputSchema',
    },
    examples: [
      'Create a PO for 100 forks from supplier 17300001',
      'Make a new purchase order for company 1710',
    ],
  },
  {
    id: 'UPDATE_PO_HEADER',
    name: 'Update PO Header',
    description: 'Update header-level fields on a purchase order',
    category: 'update',
    confirmation: 'write_only',
    requiredFields: [
      {
        name: 'poNumber',
        type: 'string',
        description: 'Purchase Order number (10-digit string)',
      },
    ],
    optionalFields: [
      {
        name: 'supplier',
        type: 'string',
        description: 'New supplier number',
      },
      {
        name: 'paymentTerms',
        type: 'string',
        description: 'Payment terms key',
      },
      {
        name: 'purchasingGroup',
        type: 'string',
        description: 'Purchasing group',
      },
      {
        name: 'documentCurrency',
        type: 'string',
        description: 'Document currency',
      },
      {
        name: 'incotermsClassification',
        type: 'string',
        description: 'Incoterms classification',
      },
      {
        name: 'incotermsLocation1',
        type: 'string',
        description: 'Incoterms location',
      },
    ],
    apiEndpoint: {
      method: 'PATCH',
      path: '/sap/purchase-orders/{poNumber}',
      pathParams: ['poNumber'],
      bodySchema: 'UpdatePOHeaderInputSchema',
    },
    examples: [
      'Change the payment terms on PO 4500000001 to NET30',
      'Update the supplier on PO 4500000001',
    ],
  },
  {
    id: 'UPDATE_PO_ITEM',
    name: 'Update Line Item',
    description: 'Update fields on a specific line item of a purchase order',
    category: 'update',
    confirmation: 'write_only',
    requiredFields: [
      {
        name: 'poNumber',
        type: 'string',
        description: 'Purchase Order number (10-digit string)',
      },
      {
        name: 'itemIdentifier',
        type: 'string',
        description:
          'Item number (e.g., 00010) or natural language description (e.g., "forks")',
        resolutionStrategy: 'fuzzy_lookup',
      },
    ],
    optionalFields: [
      {
        name: 'quantity',
        type: 'number',
        description: 'New order quantity',
      },
      { name: 'plant', type: 'string', description: 'Plant code' },
      {
        name: 'description',
        type: 'string',
        description: 'Item text/description',
      },
      {
        name: 'deliveryDate',
        type: 'date',
        description: 'New requested delivery date (YYYY-MM-DD)',
      },
    ],
    apiEndpoint: {
      method: 'PATCH',
      path: '/sap/purchase-orders/{poNumber}/items/{itemId}',
      pathParams: ['poNumber', 'itemId'],
      bodySchema: 'UpdatePOItemInputSchema',
    },
    examples: [
      'Change the quantity of forks on PO 4500000001 to 44',
      'On PO 4500000001, set the plant for line 00020 to 1710',
      'Move the delivery date on line 10 of PO 4500000001 to April 30th',
      'Regarding PO 4500000001: Line 1 (Copper Piping): Increase from 35 to 75. Line 3 (Filters): Decrease from 35 to 20.',
    ],
  },
  {
    id: 'ADD_PO_ITEM',
    name: 'Add Line Item',
    description: 'Add a new line item to an existing purchase order',
    category: 'create',
    confirmation: 'always',
    requiredFields: [
      {
        name: 'poNumber',
        type: 'string',
        description: 'Purchase Order number (10-digit string)',
      },
      {
        name: 'itemNumber',
        type: 'string',
        description: 'Item number for the new line (e.g., 00030)',
      },
      { name: 'material', type: 'string', description: 'Material number' },
      {
        name: 'quantity',
        type: 'number',
        description: 'Order quantity',
      },
      {
        name: 'unit',
        type: 'string',
        description: 'Unit of measure (e.g., EA, PC)',
      },
      { name: 'plant', type: 'string', description: 'Plant code' },
      {
        name: 'netPrice',
        type: 'number',
        description: 'Net price per unit',
      },
      {
        name: 'deliveryDate',
        type: 'date',
        description: 'Requested delivery date (YYYY-MM-DD)',
      },
    ],
    optionalFields: [
      {
        name: 'description',
        type: 'string',
        description: 'Item text/description',
      },
    ],
    apiEndpoint: {
      method: 'POST',
      path: '/sap/purchase-orders/{poNumber}/items',
      pathParams: ['poNumber'],
      bodySchema: 'AddPOItemInputSchema',
    },
    examples: [
      'Add 50 spoons to PO 4500000001',
      'Add a new item to purchase order 4500000001',
    ],
  },
  {
    id: 'DELETE_PURCHASE_ORDER',
    name: 'Delete Purchase Order',
    description: 'Soft-delete an entire purchase order',
    category: 'delete',
    confirmation: 'always',
    requiredFields: [
      {
        name: 'poNumber',
        type: 'string',
        description: 'Purchase Order number (10-digit string)',
      },
    ],
    optionalFields: [],
    apiEndpoint: {
      method: 'DELETE',
      path: '/sap/purchase-orders/{poNumber}',
      pathParams: ['poNumber'],
    },
    examples: [
      'Delete PO 4500000001',
      'Remove purchase order 4500000001',
      'Cancel PO 4500000001',
    ],
  },
  {
    id: 'DELETE_PO_ITEM',
    name: 'Delete Line Item',
    description: 'Delete a specific line item from a purchase order',
    category: 'delete',
    confirmation: 'always',
    requiredFields: [
      {
        name: 'poNumber',
        type: 'string',
        description: 'Purchase Order number (10-digit string)',
      },
      {
        name: 'itemIdentifier',
        type: 'string',
        description:
          'Item number (e.g., 00010) or natural language description',
        resolutionStrategy: 'fuzzy_lookup',
      },
    ],
    optionalFields: [],
    apiEndpoint: {
      method: 'DELETE',
      path: '/sap/purchase-orders/{poNumber}/items/{itemId}',
      pathParams: ['poNumber', 'itemId'],
    },
    examples: [
      'Delete the forks item from PO 4500000001',
      'Remove item 00010 from PO 4500000001',
    ],
  },
  {
    id: 'GET_PO_ITEMS',
    name: 'View All Line Items',
    description: 'List all line items for a specific purchase order',
    category: 'read',
    confirmation: 'never',
    requiredFields: [
      {
        name: 'poNumber',
        type: 'string',
        description: 'Purchase Order number (10-digit string)',
      },
    ],
    optionalFields: [],
    apiEndpoint: {
      method: 'GET',
      path: '/sap/purchase-orders/{poNumber}/items',
      pathParams: ['poNumber'],
    },
    examples: [
      'Show items on PO 4500000001',
      'What items are on purchase order 4500000001?',
      'List the line items for PO 4500000001',
    ],
  },
  {
    id: 'GET_PO_ITEM',
    name: 'View Line Item',
    description: 'Get a specific line item on a purchase order',
    category: 'read',
    confirmation: 'never',
    requiredFields: [
      {
        name: 'poNumber',
        type: 'string',
        description: 'Purchase Order number (10-digit string)',
      },
      {
        name: 'itemIdentifier',
        type: 'string',
        description:
          'Item number (e.g., 00010) or natural language description',
        resolutionStrategy: 'fuzzy_lookup',
      },
    ],
    optionalFields: [],
    apiEndpoint: {
      method: 'GET',
      path: '/sap/purchase-orders/{poNumber}/items/{itemId}',
      pathParams: ['poNumber', 'itemId'],
    },
    examples: [
      'Show me the forks item on PO 4500000001',
      'Get item 00010 from PO 4500000001',
    ],
  },
];

export const intentMap = new Map(intentRegistry.map((i) => [i.id, i]));
