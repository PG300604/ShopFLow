import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Eye, PackageOpen } from 'lucide-react';
import { HeroBanner } from '../components/HeroBanner';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import './CatalogPage.css';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-line--short" />
        <div className="skeleton-line skeleton-line--medium" />
        <div className="skeleton-line skeleton-line--short" />
        <div className="skeleton-line skeleton-line--btn" />
      </div>
    </div>
  );
}

export const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get<any>('/products');
        if (res && Array.isArray(res)) {
          setProducts(res);
        } else if (res && res.content && Array.isArray(res.content)) {
          setProducts(res.content);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ['All', ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const handleAddToCart = (product: Product) => {
    addItem(product.id, 1);
  };

  return (
    <div className="catalog-page">
      {/* Hero Banner Slider */}
      <HeroBanner />

      {/* Search & Filter Toolbar */}
      <motion.div
        className="catalog-toolbar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="catalog-toolbar__search">
          <Search
            size={16}
            strokeWidth={1.5}
            className="catalog-toolbar__search-icon"
          />
          <input
            type="text"
            className="catalog-toolbar__input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="catalog-toolbar__categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`catalog-toolbar__chip ${
                activeCategory === cat ? 'catalog-toolbar__chip--active' : ''
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Section Header */}
      <motion.div
        className="catalog-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <span className="catalog-header__label">Curated Selection</span>
        <h2 className="catalog-header__title">
          {activeCategory === 'All' ? 'All Products' : activeCategory}
        </h2>
        {!loading && (
          <p className="catalog-header__count">
            {filteredProducts.length} item
            {filteredProducts.length !== 1 ? 's' : ''}
          </p>
        )}
      </motion.div>

      {/* Product Grid */}
      {loading ? (
        <div className="catalog-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="catalog-grid">
          <div className="catalog-empty">
            <PackageOpen
              size={48}
              strokeWidth={1}
              className="catalog-empty__icon"
            />
            <h3 className="catalog-empty__title">No products found</h3>
            <p className="catalog-empty__text">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          className="catalog-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              className="product-card"
              variants={cardVariants}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={`/product/${product.id}`}
                className="product-card__image-wrap"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="product-card__image"
                  loading="lazy"
                />
                <span className="product-card__category">
                  {product.category}
                </span>
              </Link>
              <div className="product-card__body">
                <h3 className="product-card__name">{product.name}</h3>
                <span className="product-card__price">
                  ${product.price.toFixed(2)}
                </span>
                <div className="product-card__actions">
                  <button
                    className="product-card__add-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart size={14} strokeWidth={1.5} />
                    Add
                  </button>
                  <Link
                    to={`/product/${product.id}`}
                    className="product-card__view-btn"
                  >
                    <Eye size={14} strokeWidth={1.5} />
                    View
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
