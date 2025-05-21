import React, { useState } from 'react';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // Registration logic will be added later
    setSuccess('Form submitted successfully!');
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Signup</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className="block mb-1" htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            className="w-full px-3 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1" htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Signup
        </button>
      </form>
      {error && <p className="mt-2 text-red-600">{error}</p>}
      {success && <p className="mt-2 text-green-600">{success}</p>}
    </section>
  );
}

export default Signup;
