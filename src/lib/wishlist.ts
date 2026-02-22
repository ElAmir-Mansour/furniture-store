// Wishlist utility using localStorage

const WISHLIST_KEY = 'furniture_wishlist';

export interface WishlistItem {
    id: string;
    slug: string;
    name: string;
    price: number;
    image: string;
    addedAt: number;
}

export function getWishlist(): WishlistItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(WISHLIST_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function addToWishlist(item: Omit<WishlistItem, 'addedAt'>): boolean {
    const wishlist = getWishlist();
    if (wishlist.some(w => w.id === item.id)) {
        return false; // Already in wishlist
    }
    wishlist.push({ ...item, addedAt: Date.now() });
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    return true;
}

export function removeFromWishlist(productId: string): boolean {
    const wishlist = getWishlist();
    const filtered = wishlist.filter(w => w.id !== productId);
    if (filtered.length === wishlist.length) {
        return false; // Not found
    }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    return true;
}

export function isInWishlist(productId: string): boolean {
    const wishlist = getWishlist();
    return wishlist.some(w => w.id === productId);
}

export function toggleWishlist(item: Omit<WishlistItem, 'addedAt'>): boolean {
    if (isInWishlist(item.id)) {
        removeFromWishlist(item.id);
        return false; // Removed
    } else {
        addToWishlist(item);
        return true; // Added
    }
}

export function getWishlistCount(): number {
    return getWishlist().length;
}

export function clearWishlist(): void {
    localStorage.removeItem(WISHLIST_KEY);
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
}
