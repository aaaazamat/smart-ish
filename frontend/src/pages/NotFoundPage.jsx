import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-7xl font-bold text-brand-500 mb-2">404</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">Sahifa topilmadi</h1>
        <p className="text-gray-500 mb-6">
          Qidirgan sahifangiz mavjud emas yoki o'chirilgan.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition"
        >
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
