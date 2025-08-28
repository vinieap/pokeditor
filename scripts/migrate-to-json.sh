#!/bin/bash

# This script updates all routes to use JSON data instead of text parsing

echo "🚀 Starting migration to JSON data..."

# Create backup of routes
echo "📦 Creating backup of routes..."
cp -r app/routes app/routes.backup

echo "✅ Backup created at app/routes.backup"

echo ""
echo "📝 Summary of changes needed:"
echo "  - Replace text file fetching with JSON loader functions"
echo "  - Update type imports to use types-v2"
echo "  - Replace parsers with data-loader-v2 functions"
echo "  - Update data access patterns to use new structure"

echo ""
echo "Routes to migrate:"
echo "  ✅ pokemon._index.tsx - DONE"
echo "  ✅ pokemon.\$id.tsx - DONE" 
echo "  ⏳ moves._index.tsx"
echo "  ⏳ moves.\$id.tsx"
echo "  ⏳ items._index.tsx"
echo "  ⏳ items.\$id.tsx"
echo "  ⏳ trainers._index.tsx"
echo "  ⏳ trainers.\$id.tsx"
echo "  ⏳ encounters._index.tsx"
echo "  ⏳ tournaments._index.tsx"
echo "  ⏳ compare.tsx"
echo "  ⏳ home.tsx"

echo ""
echo "Migration plan:"
echo "1. Update imports in each route file"
echo "2. Replace loader functions to use JSON data"
echo "3. Update component props to match new types"
echo "4. Test each route after migration"

echo ""
echo "To rollback if needed:"
echo "  rm -rf app/routes && mv app/routes.backup app/routes"

echo ""
echo "✨ Migration preparation complete!"
echo "Continue with manual migration of each route file..."