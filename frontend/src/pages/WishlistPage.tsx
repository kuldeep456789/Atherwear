import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { formatINR } from '../lib/currency';
import type { RootState } from '../store/store';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';

const WishlistPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.wishlistItems);

  const removeFromWishlist = (item: any) => {
    dispatch(toggleWishlist(item));
  };

  const moveToCart = (item: any) => {
    dispatch(
      addToCart({
        _id: item._id,
        name: item.name,
        price: item.discountPrice || item.price,
        image: item.image,
        qty: 1,
        variant: { color: 'Black', size: 'M' },
      })
    );
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-4xl font-black uppercase tracking-widest mb-8 text-zinc-900 dark:text-white">
          My Wishlist
          {wishlistItems.length > 0 && (
            <span className="text-sm font-semibold text-zinc-400 normal-case tracking-normal ml-2">
              ({wishlistItems.length} items)
            </span>
          )}
        </h1>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg max-w-2xl mx-auto my-8">
            <Heart className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700 mb-6" strokeWidth={1} />
            <h2 className="text-2xl font-extrabold uppercase tracking-wide mb-3 text-zinc-900 dark:text-white">
              Your wishlist is empty
            </h2>
            <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto">Save items you love by tapping the heart icon. They'll stay here for when you're ready to buy.</p>
            <button
              onClick={() => navigate('/', { state: { scrollTo: 'men' } })}
              className="inline-block bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3.5 text-xs font-extrabold tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
            >
              START SHOPPING
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistItems.map((item: any) => (
              <div
                key={item._id}
                className="flex gap-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <Link to={`/product/${item._id}`} className="w-28 h-36 sm:w-32 sm:h-40 flex-shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded">
                  <img src={item.image || undefined} alt={item.name} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                </Link>
                <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                  <div>
                    <Link to={`/product/${item._id}`}>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-2 hover:underline">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-sm font-black mt-1 text-zinc-900 dark:text-white">
                      {formatINR(item.discountPrice || item.price)}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => moveToCart(item)}
                      className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-2 cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <ShoppingBag size={12} /> Add to Bag
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
