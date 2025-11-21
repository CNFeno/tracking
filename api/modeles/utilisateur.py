#modeles/utisisateur.py

from config import db
from modeles.enums import RoleEnum, AuthTypeEnum
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class Utilisateur(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    userId = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    role = db.Column(db.Enum(RoleEnum), nullable=False)
    auth_type = db.Column(db.Enum(AuthTypeEnum), nullable=False, default=AuthTypeEnum.LOCAL)
    password_hash = db.Column(db.String(255))  # Mot de passe sécurisé
    date_Creation = db.Column(db.DateTime, default=datetime.now)
    actif = db.Column(db.Boolean, default=True)

    historique = db.relationship('HistoriqueAction', back_populates='utilisateur', lazy=True)

    def set_password(self, password):
        """Hash du mot de passe"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Vérifie le mot de passe"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "nom": self.nom,
            "userId": self.userId,
            "email": self.email,
            "role": self.role.value,
            "auth_type": self.auth_type.value,
            "date_Creation": self.date_Creation.strftime('%Y-%m-%d %H:%M:%S'),
            "actif": self.actif
        }
    
from modeles.historique_action import HistoriqueAction

