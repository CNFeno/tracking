#services/utilisateur_service.py

from modeles.utilisateur import Utilisateur
from config import db

class UtilisateurService:
    @staticmethod
    def get_all():
        return [user.to_dict() for user in Utilisateur.query.all()]

    @staticmethod
    def get_by_id(user_id):
        user = Utilisateur.query.get(user_id)
        return user.to_dict() if user else None

    @staticmethod
    def create(data):
        user = Utilisateur(nom=data['nom'],userId=data['userId'], email=data['email'], role=data['role'], auth_type=data.get('auth_type', 'LOCAL'))

        if data.get('auth_type') == 'LOCAL':
            if 'password' not in data or not data['password']:
                raise ValueError("Le mot de passe est obligatoire pour les utilisateurs locaux")
            user.set_password(data['password'])
        else:
            user.password_hash = ''  # On n’a pas besoin de mot de passe stocké

        #user.set_password(data['password'])  # 🔹 Hacher le mot de passe
        
        db.session.add(user)
        db.session.commit()
        return user.to_dict()

    @staticmethod
    def update(user_id, data):
        user = Utilisateur.query.get(user_id)
        if not user:
            return None

        user.nom = data.get('nom', user.nom)
        user.userId = data.get('userId', user.userId)
        user.email = data.get('email', user.email)
        user.role = data.get('role', user.role)
        user.actif = data.get('actif', user.actif)
        user.auth_type = data.get('auth_type', user.auth_type)

        # 🔐 Gestion du mot de passe selon le mode d'authentification
        if user.auth_type == 'LOCAL':
            if 'password' in data and data['password']:
                user.set_password(data['password'])  # MAJ du hash
        elif user.auth_type == 'LDAP':
            user.password_hash = ''  # Pas de mot de passe stocké

        db.session.commit()
        return user.to_dict()


    @staticmethod
    def delete(user_id):
        user = Utilisateur.query.get(user_id)
        if not user:
            return None

        db.session.delete(user)
        db.session.commit()
        return True
