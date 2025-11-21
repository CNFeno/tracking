from flask import request, jsonify
from flask_restful import Resource
from services.utilisateur_service import UtilisateurService

class UtilisateurControleur(Resource):
    def get(self, user_id=None):
        if user_id:
            user = UtilisateurService.get_by_id(user_id)
            return jsonify(user) if user else ({"message": "Utilisateur non trouvé"}, 404)
        
        return jsonify(UtilisateurService.get_all())

    def post(self):
        data = request.json
        user = UtilisateurService.create(data)
        return jsonify({"message": "Utilisateur créé avec succès", "user": user})

    def put(self, user_id):
        data = request.json
        user = UtilisateurService.update(user_id, data)
        return jsonify({"message": "Utilisateur mis à jour avec succès", "user": user}) if user else ({"message": "Utilisateur non trouvé"}, 404)

    def delete(self, user_id):
        success = UtilisateurService.delete(user_id)
        return jsonify({"message": "Utilisateur supprimé avec succès"}) if success else ({"message": "Utilisateur non trouvé"}, 404)
