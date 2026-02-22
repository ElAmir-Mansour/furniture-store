import Link from 'next/link';

export default function CheckoutFailedPage({
    searchParams,
}: {
    searchParams: { orderId?: string; reason?: string };
}) {
    const orderId = searchParams.orderId;
    const reason = searchParams.reason || 'Payment was declined or cancelled.';

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                <h1 className="font-display text-3xl font-bold mb-2">Payment Failed</h1>

                <p className="text-gray-600 mb-8">
                    {reason}
                    {orderId && (
                        <span className="block mt-2 text-sm text-gray-500 font-mono">
                            Reference: {orderId}
                        </span>
                    )}
                </p>

                <div className="space-y-3">
                    <Link
                        href="/checkout"
                        className="block w-full py-3 px-4 bg-[#1a1a2e] text-white font-medium rounded-lg hover:bg-[#2a2a4e] transition-colors"
                    >
                        Try Again
                    </Link>
                    <Link
                        href="/cart"
                        className="block w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Return to Cart
                    </Link>
                </div>
            </div>
        </div>
    );
}
