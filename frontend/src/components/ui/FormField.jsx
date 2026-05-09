function FormField({ label, error, children, hint }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
      {!error && hint && (
        <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  )
}

export default FormField
