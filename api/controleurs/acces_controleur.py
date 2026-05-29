""" #acces_controleur.py
from flask import request, jsonify
from flask_restful import Resource
from services.acces_service import AccesService

class AccesControleur(Resource):
    def get(self, acces_id=None):
        if acces_id:
            a = AccesService.get_by_id(acces_id)
            return jsonify(a) if a else ({"message": "Accès non trouvé"}, 404)
        return jsonify(AccesService.get_all())

    def post(self):
        data = request.json
        a = AccesService.create(data)
        return jsonify({"message": "Accès créé avec succès", "acces": a})

    def put(self, acces_id):
        data = request.json
        a = AccesService.update(acces_id, data)
        return jsonify({"message": "Accès mis à jour avec succès", "acces": a}) if a else ({"message": "Accès non trouvé"}, 404)

    def delete(self, acces_id):
        success = AccesService.delete(acces_id)
        return jsonify({"message": "Accès supprimé avec succès"}) if success else ({"message": "Accès non trouvé"}, 404)
 """

from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required
from services.acces_service import AccesService

class AccesControleur(Resource):
    @jwt_required()
    def get(self, acces_id=None):
        if acces_id:
            a = AccesService.get_by_id(acces_id)
            return jsonify(a) if a else ({"message": "Accès non trouvé"}, 404)
        return jsonify(AccesService.get_all())

    @jwt_required()
    def post(self):
        data = request.json
        a = AccesService.create(data)
        return jsonify({"message": "Accès créé avec succès", "acces": a})

    @jwt_required()
    def put(self, acces_id):
        data = request.json
        a = AccesService.update(acces_id, data)
        return jsonify({"message": "Accès mis à jour avec succès", "acces": a}) if a else ({"message": "Accès non trouvé"}, 404)

    @jwt_required()
    def delete(self, acces_id):
        success = AccesService.delete(acces_id)
        return jsonify({"message": "Accès supprimé avec succès"}) if success else ({"message": "Accès non trouvé"}, 404)


class AccesImportControleur(Resource):
    @jwt_required()
    def post(self):
        data = request.json or {}
        records = data.get('records', data if isinstance(data, list) else [])

        if not isinstance(records, list):
            return {"message": "Le payload d'import doit contenir une liste records."}, 400

        result = AccesService.import_batch(records)
        return jsonify(result)
