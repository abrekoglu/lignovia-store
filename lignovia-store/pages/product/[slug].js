import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import useCartStore from "@/store/cartStore";
import CartToast from "@/components/CartToast";

export default function ProductDetail({ product: initialProduct, error }) {
  const router = useRouter();
  const { slug } = router.query;
  const { addToCart } = useCartStore();
  const cart = useCartStore((state) => state.items);

  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);

  // Fetch product if not provided via SSR
  useEffect(() => {
    if (!initialProduct && slug) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/product/${slug}`);
          const result = await response.json();

          if (result.success) {
            setProduct(result.data);
          } else {
            router.push("/404");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          router.push("/404");
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [slug, initialProduct, router]);

  // Get current cart quantity
  const productId = product?._id || product?.id;
  const cartItem = productId
    ? cart.find((item) => (item._id || item.id) === productId)
    : null;
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const stock = product?.stock !== undefined ? product.stock : 0;
  const remainingStock = Math.max(0, stock - cartQuantity);
  const isOutOfStock = stock === 0;
  const isMaxAdded = stock > 0 && cartQuantity >= stock;
  const canAddMore = !isOutOfStock && remainingStock > 0;

  const handleAddToCart = () => {
    if (isOutOfStock || isMaxAdded || !canAddMore) {
      return;
    }

    if (!productId) {
      console.error("Product missing ID:", product);
      return;
    }

    const maxToAdd = Math.min(quantity, remainingStock);
    if (maxToAdd <= 0) {
      return;
    }

    const productData = {
      _id: productId,
      id: productId,
      name: product?.name,
      price: product?.price,
      image: product?.mainImage || product?.image || product?.imageGallery?.[0],
      slug: product?.slug,
      description: product?.shortDescription || product?.description,
      stock: stock,
    };

    // Add multiple quantities
    for (let i = 0; i < maxToAdd; i++) {
      addToCart(productData);
    }

    setShowToast(true);
    setQuantity(1);
  };

  // Build image gallery from available sources
  const buildImageGallery = () => {
    if (product?.imageGallery && product.imageGallery.length > 0) {
      return product.imageGallery;
    }
    const gallery = [];
    if (product?.mainImage) gallery.push(product.mainImage);
    if (product?.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (img && !gallery.includes(img)) gallery.push(img);
      });
    }
    if (product?.image && !gallery.includes(product.image)) {
      gallery.push(product.image);
    }
    return gallery;
  };

  const imageGallery = buildImageGallery();
  const currentImage = imageGallery[selectedImageIndex] || product?.mainImage || product?.image;

  if (loading) {
    return (
      <Layout>
        <Head>
          <title>Loading... - LIGNOVIA</title>
        </Head>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <Head>
          <title>Product Not Found - LIGNOVIA</title>
        </Head>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">
              Product Not Found
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
              The product you're looking for doesn't exist.
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 rounded-[12px] bg-accent text-white hover:bg-accent/90 transition-all duration-200"
            >
              Back to Shop
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <Layout containerClassName="py-6 md:py-8 lg:py-12">
      <Head>
        <title>{product.seoTitle || product.name} - LIGNOVIA</title>
        <meta
          name="description"
          content={product.seoDescription || product.shortDescription || product.description?.substring(0, 160)}
        />
        {product.seoKeywords && product.seoKeywords.length > 0 && (
          <meta name="keywords" content={product.seoKeywords.join(", ")} />
        )}
        <meta property="og:title" content={product.name} />
        <meta
          property="og:description"
          content={product.shortDescription || product.description?.substring(0, 160)}
        />
        {currentImage && <meta property="og:image" content={currentImage} />}
      </Head>

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-text-secondary-light dark:text-text-secondary-dark">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-accent transition-colors duration-200">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/shop" className="hover:text-accent transition-colors duration-200">
              Shop
            </Link>
          </li>
          {product.categoryInfo && (
            <>
              <li>/</li>
              <li>
                <Link
                  href={`/shop?category=${product.categoryInfo._id}`}
                  className="hover:text-accent transition-colors duration-200"
                >
                  {product.categoryInfo.name}
                </Link>
              </li>
            </>
          )}
          <li>/</li>
          <li className="text-text-primary-light dark:text-text-primary-dark">{product.name}</li>
        </ol>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div
            className="relative aspect-square rounded-[12px] overflow-hidden bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark group cursor-zoom-in"
            onMouseEnter={() => setImageZoomed(true)}
            onMouseLeave={() => setImageZoomed(false)}
          >
            {currentImage ? (
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className={`object-cover transition-transform duration-300 ${
                  imageZoomed ? "scale-110" : "scale-100"
                }`}
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-text-secondary-light dark:text-text-secondary-dark">
                No Image
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-[8px] bg-accent text-white text-sm font-semibold shadow-soft">
                -{discountPercent}%
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {imageGallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {imageGallery.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square rounded-[10px] overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === index
                      ? "border-accent ring-2 ring-accent/30"
                      : "border-border-light dark:border-border-dark hover:border-accent/50"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - View ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-3 text-text-primary-light dark:text-text-primary-dark tracking-tight">
              {product.name}
            </h1>
            {product.categoryInfo && (
              <Link
                href={`/shop?category=${product.categoryInfo._id}`}
                className="inline-block text-sm text-accent hover:text-accent/80 transition-colors duration-200"
              >
                {product.categoryInfo.name}
              </Link>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-semibold text-accent">
              {product.currency || "TRY"} {product.price?.toFixed(2) || "0.00"}
            </span>
            {hasDiscount && (
              <span className="text-xl text-text-secondary-light dark:text-text-secondary-dark line-through">
                {product.currency || "TRY"} {product.compareAtPrice?.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-3">
            {isOutOfStock ? (
              <span className="px-4 py-2 rounded-[10px] bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark border border-error-light/30 dark:border-error-dark/30 text-sm font-medium">
                Out of Stock
              </span>
            ) : remainingStock <= 5 && remainingStock > 0 ? (
              <span className="px-4 py-2 rounded-[10px] bg-accent/20 dark:bg-accent/30 text-accent border border-accent/30 text-sm font-medium">
                Only {remainingStock} left in stock
              </span>
            ) : (
              <span className="px-4 py-2 rounded-[10px] bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark border border-success-light/30 dark:border-success-dark/30 text-sm font-medium">
                In Stock ({stock} available)
              </span>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-base text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4 pt-4 border-t border-border-light dark:border-border-dark">
            {canAddMore && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  Quantity:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-[10px] border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-hover-light dark:hover:bg-hover-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={remainingStock}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.max(1, Math.min(val, remainingStock)));
                    }}
                    className="w-16 text-center px-3 py-2 rounded-[10px] border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(remainingStock, quantity + 1))}
                    disabled={quantity >= remainingStock}
                    className="w-10 h-10 rounded-[10px] border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-hover-light dark:hover:bg-hover-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isMaxAdded || !canAddMore}
              className={`w-full py-4 px-6 rounded-[12px] text-base font-semibold transition-all duration-200 ${
                isOutOfStock || isMaxAdded || !canAddMore
                  ? "bg-border-light dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark cursor-not-allowed"
                  : "bg-accent text-white hover:bg-accent/90 shadow-soft hover:shadow-soft-lg"
              }`}
            >
              {isOutOfStock
                ? "Sold Out"
                : isMaxAdded
                ? "Max Added to Cart"
                : `Add to Cart${quantity > 1 ? ` (${quantity})` : ""}`}
            </button>

            {cartQuantity > 0 && (
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center">
                {cartQuantity} {cartQuantity === 1 ? "item" : "items"} in cart
              </p>
            )}
          </div>

          {/* Quick Info */}
          <div className="space-y-3 pt-4 border-t border-border-light dark:border-border-dark">
            {product.material && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark w-24">
                  Material:
                </span>
                <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {product.material}
                </span>
              </div>
            )}
            {product.finish && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark w-24">
                  Finish:
                </span>
                <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {product.finish}
                </span>
              </div>
            )}
            {product.sku && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark w-24">
                  SKU:
                </span>
                <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {product.sku}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description Section */}
      {product.description && (
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary-light dark:text-text-primary-dark">
            Description
          </h2>
          <div
            className="prose prose-lg max-w-none text-text-secondary-light dark:text-text-secondary-dark leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: product.description.replace(/\n/g, "<br />"),
            }}
          />
        </div>
      )}

      {/* Technical Specifications */}
      {product.technicalSpecs && Object.keys(product.technicalSpecs).length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary-light dark:text-text-primary-dark">
            Technical Specifications
          </h2>
          <div className="bg-surface-light dark:bg-surface-dark rounded-[12px] border border-border-light dark:border-border-dark overflow-hidden">
            <table className="w-full">
              <tbody>
                {Object.entries(product.technicalSpecs).map(([key, value], index) => (
                  <tr
                    key={key}
                    className={`border-b border-border-light dark:border-border-dark ${
                      index % 2 === 0
                        ? "bg-hover-light/30 dark:bg-hover-dark/30"
                        : "bg-transparent"
                    }`}
                  >
                    <td className="py-4 px-6 font-medium text-text-primary-light dark:text-text-primary-dark w-1/3">
                      {key}
                    </td>
                    <td className="py-4 px-6 text-text-secondary-light dark:text-text-secondary-dark">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <Link
                key={index}
                href={`/shop?search=${encodeURIComponent(tag)}`}
                className="px-4 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark text-text-primary-light dark:text-text-primary-dark hover:bg-accent/10 hover:text-accent border border-border-light dark:border-border-dark transition-all duration-200 text-sm"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-8 text-text-primary-light dark:text-text-primary-dark">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct._id || relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}

      {/* Cart Toast */}
      <CartToast
        message="Product added to your cart"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;

  try {
    const protocol = context.req.headers["x-forwarded-proto"] || "http";
    const host = context.req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    const response = await fetch(`${baseUrl}/api/product/${slug}`);
    const data = await response.json();

    if (!data.success) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        product: data.data,
        error: null,
      },
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      notFound: true,
    };
  }
}
