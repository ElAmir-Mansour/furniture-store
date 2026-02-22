import Link from 'next/link';

export default function CheckoutSuccessPage({
    searchParams,
}: {
    searchParams: { orderId?: string };
}) {
    const orderId = searchParams.orderId;

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="font-display text-3xl font-bold mb-2">Order Successful</h1>

                <p className="text-gray-600 mb-8">
                    Thank you for your purchase. We've received your order and will begin processing it right away.
                    {orderId && (
                        <span className="block mt-2 text-sm font-medium text-gray-800 font-mono">
                            Order ID: {orderId}
                        </span>
                    )}
                </p>

                <div className="space-y-3">
                    <Link
                        href="/account"
                        className="block w-full py-3 px-4 bg-[#1a1a2e] text-white font-medium rounded-lg hover:bg-[#2a2a4e] transition-colors"
                    >
                        View Order Details
                    </Link>
                    <Link
                        href="/"
                        className="block w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
