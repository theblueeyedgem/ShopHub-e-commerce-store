import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">ShopHub</h3>
            <p className="text-sm text-gray-400">
              Premium e-commerce platform with amazing products at unbeatable prices.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white">All Products</Link></li>
              <li><Link href="/products?category=Electronics" className="hover:text-white">Electronics</Link></li>
              <li><Link href="/products?category=Fashion" className="hover:text-white">Fashion</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-white">Deals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white">Login</Link></li>
              <li><Link href="/register" className="hover:text-white">Register</Link></li>
              <li><Link href="/cart" className="hover:text-white">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-400">support@shophub.com</span></li>
              <li><span className="text-gray-400">Mon–Fri, 9am–5pm</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ShopHub. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
