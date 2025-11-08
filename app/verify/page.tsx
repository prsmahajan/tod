export default function VerifyPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams?.status;
  return (
    <main className="max-w-md mx-auto p-6 text-center">
      {status === "success" ? (
        <>
          <h1 className="text-2xl font-semibold">Email verified 🎉</h1>
          <p className="mt-2">You’re all set.</p>
          <a href="/" className="mt-6 inline-block underline text-blue-600">Go to home</a>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold">Invalid or expired link</h1>
          <p className="mt-2">Request a new verification from your account settings.</p>
          <a href="/" className="mt-6 inline-block underline text-blue-600">Go to home</a>
        </>
      )}
    </main>
  );
}
