import ConnectMetaButton from "@/app/meta/ConnectMetaButton";
import LogoutButton from "@/app/dashboard/LogoutButton";

export default function ConnectMetaCard() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Connexion à Meta Requise
        </h1>
        <p className="text-gray-600 mb-6">
          Pour utiliser toutes les fonctionnalités de l'application, veuillez
          connecter votre compte Meta (Facebook/Instagram). Cela nous permettra
          de synchroniser vos messages et vos pages.
        </p>
        <ConnectMetaButton />
        <p className="text-xs text-gray-400 mt-4">
          Votre session est gérée par notre système, mais l'accès à vos données
          professionnelles Meta nécessite cette autorisation.
        </p>
        <div className="mt-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
