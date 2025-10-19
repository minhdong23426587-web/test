import { requestLoginMagicLink } from "./actions";

export default function LoginPage() {
  return (
    <main>
      <h1>Sign in securely</h1>
      <form action={requestLoginMagicLink}>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <button type="submit">Send magic link</button>
        <p className="alert">
          We never expose authentication endpoints publicly. Requests are validated server-side with rate limiting and
          device fingerprinting.
        </p>
      </form>
    </main>
  );
}
