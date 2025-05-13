# Mini ERP Frontend

The React frontend implementation of our Mini ERP system, designed to mimic NetSuite's user interface and workflow. This interface demonstrates my understanding of NetSuite's UI patterns and manufacturing business processes.

## NetSuite UI Similarities

| NetSuite UI Element | Our Implementation |
|---------------------|-------------------|
| Dashboard | KPI cards and recent activity lists |
| List Views | Sortable and filterable data tables |
| Record Detail Views | Form-based layouts with sections |
| Subsidiary Selector | Location filtering |
| Status Indicators | Color-coded status pills |
| NetSuite Navigation | Left sidebar with hierarchical structure |

## Key Features

- **Dashboard**: Overview of manufacturing operations with KPIs
- **Product Management**: Create and maintain products (similar to NetSuite Items)
- **Recipe Management**: Define manufacturing recipes with ingredients (similar to NetSuite BOMs)
- **Batch Production**: Plan and track batches (similar to NetSuite Work Orders)
- **Inventory Tracking**: Monitor inventory levels with alerts (similar to NetSuite Inventory Items)

## Component Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Layout components (sidebar, header)
│   │   └── ui/          # UI components (buttons, cards, tables)
│   │   
│   ├── pages/           # Main page components
│   │   ├── Dashboard.jsx # Overview page
│   │   ├── ProductList.jsx # Product management
│   │   ├── RecipeList.jsx # Recipe management
│   │   ├── BatchList.jsx # Batch processing
│   │   └── InventoryList.jsx # Inventory management
│   │   
│   ├── utils/           # Helper functions
│   │   
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Application entry point
└── public/              # Static assets
```

## NetSuite-Inspired UI Elements

### Dashboard

The dashboard provides an overview of manufacturing operations with KPIs similar to NetSuite's dashboard:

- Statistical cards for key metrics
- Recent batch activities
- Inventory alerts for items below reorder points
- Quick links to common operations

### List Views

Product, recipe, batch and inventory list views follow NetSuite's pattern:

- Column headers with sorting capability
- Filters for narrowing results
- Status indicators with color coding
- Action buttons for each record
- Pagination for large datasets

### Form Layout

The data entry forms mimic NetSuite's form layout:

- Field grouping in logical sections
- Required field indicators
- Field validation with error messages
- Cancel/Save buttons

### Navigation

The sidebar navigation implements a NetSuite-like structure:

- Hierarchical organization of features
- Visual indication of current section
- Compact design to maximize working area

## Technology Stack

- **React**: UI library
- **React Router**: Client-side routing
- **TailwindCSS**: Styling framework
- **Axios**: API communication

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The development server runs on http://localhost:5173 by default, and should connect to the backend API running on http://localhost:3000.

## Building for Production

```bash
# Create an optimized production build
npm run build

# Preview the production build
npm run preview
```
