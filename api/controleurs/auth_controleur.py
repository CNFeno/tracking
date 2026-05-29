from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import create_access_token
from services.utilisateur_service import UtilisateurService
from services.auth_service import ldap_authenticate
from modeles.utilisateur import Utilisateur
from config import db

class AuthControleur(Resource):
    def post(self):
        data = request.get_json()
        userId = data.get("userId")
        password = data.get("password")

        user = Utilisateur.query.filter_by(userId=userId).first()
        if not user or not user.actif:
            return {"message": "Utilisateur introuvable ou inactif"}, 404

        ldap_result = {}
        if user.auth_type.name == "LOCAL":
            if not user.check_password(password):
                return {"message": "Mot de passe incorrect"}, 401
        elif user.auth_type.name == "LDAP":
            ldap_result = ldap_authenticate(userId, password)
            if not ldap_result.get("authenticated"):
                return {"message": "Authentification LDAP échouée"}, 401
            
        additional_claims = {
            'userId': user.userId,
            'email': user.email,
            'role': user.role.value
        }

        token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
        user_data = user.to_dict()
        user_data["profile_photo"] = ldap_result.get("profile_photo")

        return jsonify({
            "access_token": token,
            "user": user_data
        })
