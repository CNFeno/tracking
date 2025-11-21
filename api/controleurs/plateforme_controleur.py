from flask import request, jsonify
from flask_restful import Resource
#from flask_jwt_extended import jwt_required, get_jwt_identity
from services.plateforme_service import PlateformeService

class PlateformeControleur(Resource):
    #@jwt_required
    def get(self, plateforme_id=None):
        if plateforme_id:
            p = PlateformeService.get_by_id(plateforme_id)
            return jsonify(p) if p else ({"message": "Plateforme non trouvée"}, 404)
        return jsonify(PlateformeService.get_all())

    # @jwt_required
    def post(self):
        data = request.json
        #user_id = get_jwt_identity()  # 🔹 Récupère l'ID de l'utilisateur connecté
        p = PlateformeService.create(data)
        return jsonify({"message": "Plateforme créée avec succès", "plateforme": p})
    
    # @jwt_required()
    def put(self, plateforme_id):
        data = request.json
        p = PlateformeService.update(plateforme_id, data)
        return jsonify({"message": "Plateforme mise à jour avec succès", "plateforme": p}) if p else ({"message": "Plateforme non trouvée"}, 404)

    # @jwt_required
    def delete(self, plateforme_id):
        success = PlateformeService.delete(plateforme_id)
        return jsonify({"message": "Plateforme supprimée avec succès"}) if success else ({"message": "Plateforme non trouvée"}, 404)
