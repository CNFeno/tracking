from flask import request, jsonify
from flask_restful import Resource
from services.historique_action_service import HistoriqueActionService

class HistoriqueActionControleur(Resource):
    def get(self, historique_id=None):
        if historique_id:
            h = HistoriqueActionService.get_by_id(historique_id)
            return jsonify(h) if h else ({"message": "Historique non trouvé"}, 404)
        return jsonify(HistoriqueActionService.get_all())

    def post(self):
        data = request.json
        h = HistoriqueActionService.create(data)
        return jsonify({"message": "Historique enregistré avec succès", "historique": h})

    def delete(self, historique_id):
        success = HistoriqueActionService.delete(historique_id)
        return jsonify({"message": "Historique supprimé avec succès"}) if success else ({"message": "Historique non trouvé"}, 404)

class HistoriqueByUtilisateurControleur(Resource):
    def get(self, utilisateur_id):
        return jsonify(HistoriqueActionService.get_by_utilisateur(utilisateur_id))

class HistoriqueByAccesControleur(Resource):
    def get(self, acces_id):
        return jsonify(HistoriqueActionService.get_by_acces(acces_id))