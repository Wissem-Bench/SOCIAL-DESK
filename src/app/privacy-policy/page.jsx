export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Politique de Confidentialité pour Social-Desk
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Dernière mise à jour : 6 août 2025
          </p>

          <div className="prose prose-lg max-w-none">
            <p>
              Bienvenue sur Social-Desk ("nous", "notre"). Nous nous engageons à
              protéger la vie privée de nos utilisateurs ("vous", "votre").
              Cette politique de confidentialité explique comment nous
              collectons, utilisons, divulguons et protégeons vos informations
              lorsque vous utilisez notre application web (le "Service").
            </p>
            <p>
              En utilisant notre Service, vous acceptez la collecte et
              l'utilisation d'informations conformément à cette politique.
            </p>

            <h2 className="mt-8">1. Informations que nous collectons</h2>
            <p>
              Pour fournir et améliorer notre Service, nous collectons plusieurs
              types d'informations.
            </p>
            <h3>A. Informations que vous nous fournissez directement</h3>
            <ul>
              <li>
                <strong>Informations de compte :</strong> Lorsque vous créez un
                compte, nous collectons votre nom et votre adresse e-mail.
              </li>
            </ul>

            <h3>
              B. Informations collectées via l'API Meta (Facebook & Instagram)
            </h3>
            <p>
              Lorsque vous connectez vos comptes de réseaux sociaux à
              Social-Desk, nous demandons votre autorisation pour accéder à
              certaines données via les API de Meta. Cela inclut :
            </p>
            <ul>
              <li>
                <strong>Messages et Conversations :</strong> Le contenu de vos
                messages, commentaires, et les informations des conversations
                sur les plateformes connectées (Messenger, Instagram Direct)
                afin de les afficher dans notre interface de messagerie unifiée.
              </li>
              <li>
                <strong>Informations de profil public :</strong> Votre nom
                public et l'identifiant de votre profil/page pour identifier les
                comptes que vous souhaitez gérer.
              </li>
              <li>
                <strong>Tokens d'accès :</strong> Nous stockons de manière
                sécurisée les jetons d'accès fournis par Meta, qui nous
                permettent d'agir en votre nom pour récupérer les messages et
                répondre, conformément aux autorisations que vous avez
                accordées.
              </li>
            </ul>

            <h3>C. Informations que vous générez en utilisant le Service</h3>
            <ul>
              <li>
                <strong>Données des clients finaux :</strong> Les informations
                concernant vos propres clients que vous enregistrez via notre
                Service, telles que leur nom, numéro de téléphone, et adresse de
                livraison.
              </li>
              <li>
                <strong>Données de commande et de produit :</strong> Les détails
                des commandes que vous créez et les informations sur les
                produits que vous gérez (nom, prix, stock).
              </li>
            </ul>

            <h2 className="mt-8">2. Comment nous utilisons vos informations</h2>
            <p>
              Nous utilisons les informations collectées aux fins suivantes :
            </p>
            <ul>
              <li>
                <strong>Pour fournir et maintenir notre Service :</strong>{" "}
                Centraliser vos conversations, vous permettre de créer et gérer
                des commandes, et suivre votre stock.
              </li>
              <li>
                <strong>Pour améliorer le Service :</strong> Comprendre comment
                nos utilisateurs interagissent avec l'application pour
                l'améliorer et développer de nouvelles fonctionnalités.
              </li>
              <li>
                <strong>Pour communiquer avec vous :</strong> Vous envoyer des
                e-mails importants concernant votre compte, des mises à jour du
                service, ou pour répondre à vos demandes de support.
              </li>
            </ul>

            <h2 className="mt-8">3. Partage de vos informations</h2>
            <p>
              Votre confiance est primordiale. Nous ne vendons ni ne louons vos
              informations personnelles à des tiers. Nous ne partageons vos
              informations que dans les cas suivants :
            </p>
            <ul>
              <li>
                <strong>Fournisseurs de services :</strong> Nous pouvons
                partager des informations avec des entreprises tierces qui nous
                aident à exploiter notre service, comme nos fournisseurs
                d'hébergement (Vercel) et de base de données (Supabase), qui
                sont contractuellement obligés de protéger vos données.
              </li>
              <li>
                <strong>Obligations légales :</strong> Nous pouvons divulguer
                vos informations si la loi l'exige ou en réponse à des demandes
                valides des autorités publiques.
              </li>
            </ul>

            <h2 className="mt-8">4. Sécurité des données</h2>
            <p>
              La sécurité de vos données est une priorité absolue. Nous
              utilisons des mesures de sécurité administratives, techniques et
              physiques pour protéger vos informations personnelles. Cela inclut
              l'utilisation du cryptage (HTTPS) pour toutes les communications
              et des pratiques de stockage sécurisées pour les données sensibles
              comme les tokens d'accès.
            </p>

            <h2 className="mt-8">5. Vos droits et choix</h2>
            <p>
              Vous avez le droit d'accéder, de corriger ou de supprimer vos
              informations personnelles. Vous pouvez gérer la plupart des
              informations de votre compte directement depuis les paramètres de
              votre tableau de bord. Pour toute demande de suppression de compte
              ou de données, veuillez nous contacter.
            </p>

            <h2 className="mt-8">6. Conservation des données</h2>
            <p>
              Nous conserverons vos informations aussi longtemps que votre
              compte sera actif ou aussi longtemps que nécessaire pour vous
              fournir le Service, et pour nous conformer à nos obligations
              légales.
            </p>

            <h2 className="mt-8">7. Modifications de cette politique</h2>
            <p>
              Nous pouvons mettre à jour notre politique de confidentialité de
              temps à autre. Nous vous informerons de tout changement en
              publiant la nouvelle politique sur cette page et en mettant à jour
              la date de "Dernière mise à jour".
            </p>

            <h2 className="mt-8">8. Nous contacter</h2>
            <p>
              Si vous avez des questions concernant cette politique de
              confidentialité, veuillez nous contacter à l'adresse suivante :
            </p>
            <p>
              <a
                href="mailto:contact@social-desk.com"
                className="text-blue-600 hover:underline"
              >
                contact@social-desk.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
