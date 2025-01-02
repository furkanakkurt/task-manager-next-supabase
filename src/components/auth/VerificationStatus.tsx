export default function VerificationStatus({
  email,
  isSignUp = false,
}: {
  email: string
  isSignUp?: boolean
}) {
  return (
    <div className="text-center p-6 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-medium text-blue-900 mb-2">
        {isSignUp ? 'Check your email' : 'Email verification required'}
      </h3>
      <p className="text-blue-700 mb-4">
        {isSignUp
          ? `We've sent a verification link to ${email}. Please check your email and click the link to verify your account.`
          : `Please verify your email address (${email}) before signing in.`}
      </p>
      <p className="text-sm text-blue-600">
        You can close this window after verification
      </p>
    </div>
  )
} 