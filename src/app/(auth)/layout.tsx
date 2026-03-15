export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side — form */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right side — dark branding panel */}
      <div className="hidden bg-gradient-to-br from-[#0A1628] to-[#111D33] lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Testikko</h1>
          <p className="mt-3 text-lg text-gray-400">
            Competency Assessment &amp; Development Platform
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <div className="h-2 w-2 rounded-full bg-blue-400" />
            <div className="h-2 w-2 rounded-full bg-blue-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
