import { handleAdminLogin } from "./actions";

export default function AdminLoginPage() {
  return (
    <main>
      <h1>Admin access</h1>
      <form action={handleAdminLogin}>
        <label htmlFor="email">Admin email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={12} />

        <label htmlFor="totp">TOTP code</label>
        <input id="totp" name="totp" inputMode="numeric" pattern="[0-9]{6}" required />

        <button type="submit">Sign in</button>
        <p className="alert">
          Admin login enforces MFA, hardware keys (via WebAuthn bootstrap), per-IP allow listing, and aggressive lockout
          policies. Use dedicated admin workstations.
        </p>
      </form>
    </main>
  );
}
