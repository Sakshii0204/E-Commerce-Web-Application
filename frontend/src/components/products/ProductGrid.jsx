import React from 'react';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../common/EmptyState';

export const ProductGrid = ({ products = [], onResetFilters }) => {
  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="No matching products found"
        description="We couldn't find any products matching your selected search or filters. Try adjusting or clearing them."
        actionLabel={onResetFilters ? "Reset All Filters" : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
