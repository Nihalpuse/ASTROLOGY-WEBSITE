"use client";

import { useMemo, useState, useRef, useEffect } from 'react';
import { ReusableProductCard, Product as ReusableProduct } from './ReusableProductCard';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * Legacy/lightweight product shape supported for convenience.
 * We'll normalize it to the richer ReusableProduct interface expected by ReusableProductCard.
 */
interface LegacyProductItem {
	id?: string;          // optional; if missing we'll derive from slug or title
	slug: string;
	title: string;
	description: string;
	image?: string;
	price: string;        // can be a formatted string e.g. "₹999"; card already handles string price
	originalPrice?: string;
	category?: string;
	rating?: number;
	reviewCount?: number;
	isNew?: boolean;
	isFeatured?: boolean;
	inStock?: boolean;
}

interface ProductShowcaseProps {
	products: (LegacyProductItem | ReusableProduct)[];
	title: string;
	subtitle?: string;
	cardsPerView?: number;         // number of cards visible at once (default 5)
	scrollStep?: number;           // number of cards to scroll at once (default 1)
	viewMode?: 'grid' | 'list';    // list mode will stack cards vertically
}

export default function ProductShowcase({
	products,
	title,
	subtitle,
	cardsPerView = 5,
	scrollStep = 1,
	viewMode = 'grid',
}: ProductShowcaseProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [responsiveCardsPerView, setResponsiveCardsPerView] = useState(cardsPerView);
	const desktopContainerRef = useRef<HTMLDivElement | null>(null);

	// Responsive mobile scroll logic
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [canScrollLeftMobile, setCanScrollLeftMobile] = useState(false);
	const [canScrollRightMobile, setCanScrollRightMobile] = useState(true);

	useEffect(() => {
		const updateCardsPerView = () => {
			const width = window.innerWidth;
			if (width < 768) {
				setResponsiveCardsPerView(2); // Mobile: 2 cards
			} else if (width < 1024) {
				setResponsiveCardsPerView(2); // Tablet: 2 cards
			} else if (width < 1280) {
				setResponsiveCardsPerView(3); // Small desktop: 3 cards
			} else if (width < 1536) {
				setResponsiveCardsPerView(4); // Medium desktop: 4 cards
			} else {
				setResponsiveCardsPerView(5); // Large desktop: 5 cards
			}
		};

		updateCardsPerView();
		window.addEventListener('resize', updateCardsPerView);
		return () => window.removeEventListener('resize', updateCardsPerView);
	}, []);

	// Mobile scroll button logic
	const checkScrollButtonsMobile = () => {
		if (scrollContainerRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
			setCanScrollLeftMobile(scrollLeft > 0);
			setCanScrollRightMobile(scrollLeft < scrollWidth - clientWidth - 1);
		}
	};

	const scrollLeftMobile = () => {
		if (scrollContainerRef.current) {
			const cardWidth = scrollContainerRef.current.clientWidth / 2;
			scrollContainerRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
		}
	};

	const scrollRightMobile = () => {
		if (scrollContainerRef.current) {
			const cardWidth = scrollContainerRef.current.clientWidth / 2;
			scrollContainerRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
		}
	};

	useEffect(() => {
		checkScrollButtonsMobile();
	}, []);

	// Normalize products
	const normalized: ReusableProduct[] = useMemo(() => {
		if (!products || products.length === 0) return [];
		return products.map(p => {
			const candidate = p as ReusableProduct;
			// Heuristic: if it already has id, price (string) and title assume full shape
			if (candidate.id && candidate.title && candidate.price) {
				return candidate;
			}
			const legacy = p as LegacyProductItem;
			const id = legacy.id || legacy.slug || legacy.title.replace(/\s+/g, '-').toLowerCase();
			return {
				id,
				slug: legacy.slug,
				title: legacy.title,
				description: legacy.description,
				price: legacy.price,
				originalPrice: legacy.originalPrice,
				image: legacy.image,
				category: legacy.category,
				rating: legacy.rating,
				reviewCount: legacy.reviewCount,
				isNew: legacy.isNew,
				isFeatured: legacy.isFeatured,
				inStock: legacy.inStock !== false, // default true
			} as ReusableProduct;
		});
	}, [products]);

	// Strip "new" and "featured" markers so cards don't render those tags.
	const sanitized: ReusableProduct[] = useMemo(() => {
		return normalized.map(p => ({ ...p, isNew: false, isFeatured: false }));
	}, [normalized]);

	const totalCards = sanitized.length;
	const maxIndex = Math.max(0, totalCards - responsiveCardsPerView);
	// Desktop scroll logic
	const canScrollLeftDesktop = currentIndex > 0;
	const canScrollRightDesktop = currentIndex < maxIndex;

	const handleScroll = (direction: 'left' | 'right') => {
		if (direction === 'left' && canScrollLeftDesktop) {
			setCurrentIndex(Math.max(0, currentIndex - scrollStep));
		} else if (direction === 'right' && canScrollRightDesktop) {
			setCurrentIndex(Math.min(maxIndex, currentIndex + scrollStep));
		}
	};

	// Guard: nothing to show - moved after hooks to comply with rules of hooks
	if (!products || products.length === 0) return null;

	return (
		<div className="mt-8 mb-12" ref={desktopContainerRef}>
			{/* Heading with navigation arrows (desktop/tablet only) */}
			<div className="mb-6 flex flex-col gap-3">
				<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
					<div className="max-w-3xl">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
							{title}
						</h2>
						{subtitle && (
							<p className="text-lg md:text-xl text-gray-600" style={{ fontFamily: 'Playfair Display, serif' }}>
								{subtitle}
							</p>
						)}
						<div className="mt-2 text-sm text-gray-500 font-medium">
							{totalCards} products available
						</div>
					</div>
					{/* Desktop/tablet arrows */}
					<div className="hidden md:flex justify-end">
						{totalCards > responsiveCardsPerView && viewMode === 'grid' && (
							<div className="flex items-center gap-2">
								<button
									onClick={() => handleScroll('left')}
									disabled={!canScrollLeftDesktop}
									className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white text-gray-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 hover:text-black shadow-sm transition-all duration-200"
									aria-label="Scroll left"
								>
									<ArrowLeft className="w-4 h-4" />
								</button>
								<button
									onClick={() => handleScroll('right')}
									disabled={!canScrollRightDesktop}
									className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white text-gray-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 hover:text-black shadow-sm transition-all duration-200"
									aria-label="Scroll right"
								>
									<ArrowRight className="w-4 h-4" />
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Products Display */}
			{viewMode === 'grid' ? (
				<>
				{/* Desktop/Tablet Carousel */}
				<div className="hidden md:block">
					<div
						className="relative overflow-hidden cursor-grab active:cursor-grabbing"
						style={{
							width: `${responsiveCardsPerView * (288 + 24) - 24}px`,
							maxWidth: '100%',
						}}
						onWheel={(e) => {
							if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
								e.preventDefault();
								const scrollDirection = (e.deltaX || e.deltaY) > 0 ? 'right' : 'left';
								handleScroll(scrollDirection);
							}
						}}
					>
						<motion.div
							className="flex gap-6"
							animate={{
								x: `-${currentIndex * (288 + 24)}px`,
							}}
							transition={{
								type: 'spring',
								damping: 20,
								stiffness: 300,
							}}
							style={{
								width: `${sanitized.length * (288 + 24)}px`,
							}}
							drag="x"
							dragConstraints={{
								left: -maxIndex * (288 + 24),
								right: 0,
							}}
							dragElastic={0.1}
							onDragEnd={(_, info) => {
								const dragOffset = info.offset.x;
								const dragThreshold = 100;
								if (Math.abs(dragOffset) > dragThreshold) {
									if (dragOffset > 0 && canScrollLeftDesktop) {
										handleScroll('left');
									} else if (dragOffset < 0 && canScrollRightDesktop) {
										handleScroll('right');
									}
								}
							}}
						>
							{sanitized.map((product) => (
								<div key={product.id} className="w-72 flex-shrink-0">
									<ReusableProductCard product={product} viewMode={viewMode} />
								</div>
							))}
						</motion.div>
					</div>
				</div>
				{/* Mobile: scrollable flexbox, snap, responsive card width, overlay arrows */}
				<div className="md:hidden">
					<div className="relative">
						{/* Navigation Arrows (mobile only) */}
						<button
							onClick={scrollLeftMobile}
							disabled={!canScrollLeftMobile}
							className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-opacity border border-gray-300 ${
								canScrollLeftMobile ? 'opacity-100 hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
							}`}
							style={{ marginLeft: '-20px' }}
							aria-label="Scroll left"
						>
							<ArrowLeft className="w-4 h-4 text-gray-700" />
						</button>
						<button
							onClick={scrollRightMobile}
							disabled={!canScrollRightMobile}
							className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-opacity border border-gray-300 ${
								canScrollRightMobile ? 'opacity-100 hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
							}`}
							style={{ marginRight: '-20px' }}
							aria-label="Scroll right"
						>
							<ArrowRight className="w-4 h-4 text-gray-700" />
						</button>
						{/* Scrollable Container */}
						<div
							ref={scrollContainerRef}
							onScroll={checkScrollButtonsMobile}
							className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-2"
							style={{
								scrollSnapType: 'x mandatory',
								scrollbarWidth: 'none',
								msOverflowStyle: 'none',
								WebkitOverflowScrolling: 'touch',
							}}
						>
							{sanitized.map((product) => (
								<div
									key={product.id}
									className="flex-none w-[calc(52%-6px)] min-w-[170px] snap-start"
								>
									<ReusableProductCard product={product} viewMode={viewMode} />
								</div>
							))}
						</div>
					</div>
				</div>
				</>
			) : (
				/* List mode - vertical stack, no carousel */
				<div className="flex flex-col gap-6">
					{sanitized.map((product) => (
						<div key={product.id}>
							<ReusableProductCard product={product} viewMode={viewMode} />
						</div>
					))}
				</div>
			)}
		</div>
	);
}
