'use client';
export default function PageContainer({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="streamlens-card max-w-2xl w-full space-y-8 p-8">
        {title && <h2 className="streamlens-heading text-center mb-2">{title}</h2>}
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}