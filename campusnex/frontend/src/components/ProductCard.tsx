import React from 'react';
import { Plus, Check, Weight, Layers } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, items } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const isHeavy = product.weight_kg > 4.0;

  return (
    <div className="group relative bg-campus-card border border-campus-border rounded-3xl overflow-hidden hover:border-campus-accent/60 transition-all duration-300 flex flex-col justify-between hover:shadow-glow-accent/20">
      
      {/* Product Image using SafeImage with loading skeleton & fallback */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-campus-elevated">
        <SafeImage
          src={product.image_url}
          alt={product.name}
          containerClassName="w-full h-full"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-campus-card via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Category & Weight Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20">
          {product.category && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-campus-bg/85 backdrop-blur-md text-campus-accent border border-campus-border shadow-sm">
              {product.category.name}
            </span>
          )}
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center space-x-1 backdrop-blur-md border shadow-sm ${
              isHeavy
                ? 'bg-amber-950/85 text-amber-300 border-amber-800'
                : 'bg-campus-bg/85 text-campus-muted border-campus-border'
            }`}
            title={isHeavy ? 'Exceeds drone weight limit (4kg). Delivered by Ground Robot.' : 'Eligible for Robot or High-Speed Drone delivery.'}
          >
            <Weight className="w-2.5 h-2.5" />
            <span>{product.weight_kg} kg</span>
          </span>
        </div>

        {/* Stock status pill */}
        <div className="absolute top-3 right-3 z-20">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-950/85 text-emerald-400 border border-emerald-800 backdrop-blur-md shadow-sm">
            {product.stock} in stock
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-campus-text group-hover:text-campus-accent transition line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-campus-muted mt-1 line-clamp-2 leading-relaxed">
            {product.description || 'Verified authentic campus supply item.'}
          </p>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-campus-border/60 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-campus-muted uppercase font-mono font-medium">Campus Price</div>
            <div className="font-extrabold text-base text-campus-text font-mono">
              ₹{product.price.toFixed(2)}
            </div>
          </div>

          <button
            onClick={() => addItem(product, 1)}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
              quantityInCart > 0
                ? 'bg-campus-elevated border border-campus-accent text-campus-accent hover:bg-campus-accent hover:text-campus-bg'
                : 'bg-campus-accent text-campus-bg hover:bg-campus-accent-subtle shadow-glow-accent'
            }`}
          >
            {quantityInCart > 0 ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{quantityInCart} in Cart</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
