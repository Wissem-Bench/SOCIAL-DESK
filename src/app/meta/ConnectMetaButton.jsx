"use client";

export default function ConnectMetaButton() {
  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_META_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI;

    // Concatenate permissions into a single string
    const scopes = [
      "public_profile",
      "pages_show_list",
      "pages_messaging",
      "instagram_basic",
      "instagram_manage_messages",
    ].join(",");

    // Meta's Authorization URL
    // state to change in production (a unique string that I generate to prevent CSRF attacks)
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code&state=UNIQUE_STATE_STRING`;

    // Redirects the user to the Facebook login page
    window.location.href = authUrl;
  };

  return (
    <button
      onClick={handleConnect}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Connecter avec Meta (Facebook/Instagram)
    </button>
  );
}
