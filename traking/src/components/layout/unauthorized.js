export default function Unauthorized() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-red-600">Accès refusé</h1>
      <p className="text-gray-700 mt-4">Vous n’avez pas la permission d’accéder à cette page.</p>
    </div>
  );
}
