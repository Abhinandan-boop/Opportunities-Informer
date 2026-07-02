const googleButtons = [
  document.getElementById("google-btn"),
  document.getElementById("nav-google-btn")
].filter(Boolean);

const authNote = document.getElementById("auth-note");

function setLoading(isLoading) {
  googleButtons.forEach(button => {
    button.disabled = isLoading;
  });

  if (authNote && isLoading) {
    authNote.textContent = "Opening Google sign-in...";
  }
}

// Landing page guard: authenticated users should not see the marketing entrypoint.
async function redirectIfAuthenticated() {
  try {
    const res = await fetch("/auth/status", { credentials: "include" });
    const data = await res.json();

    if (data.authenticated) {
      window.location.replace("/dashboard.html");
    }
  } catch (err) {
    console.error("Unable to check auth status", err);
  }
}

// Reuse the existing backend OAuth route and ask it to return to the dashboard.
async function startGoogleOAuth() {
  setLoading(true);

  try {
    const redirectTo = `${window.location.origin}/dashboard.html`;
    const res = await fetch(`/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`, {
      credentials: "include"
    });
    const data = await res.json();

    if (!data.authUrl) {
      throw new Error("OAuth URL was not returned");
    }

    window.location.href = data.authUrl;
  } catch (err) {
    console.error("Unable to start Google OAuth", err);
    setLoading(false);

    if (authNote) {
      authNote.textContent = "Could not start Google sign-in. Please try again.";
    }
  }
}

googleButtons.forEach(button => {
  button.addEventListener("click", startGoogleOAuth);
});

document.addEventListener("DOMContentLoaded", redirectIfAuthenticated);
