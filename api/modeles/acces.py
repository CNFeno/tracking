#acces.py
from config import db
from modeles.enums import ActionEnum
from datetime import datetime

class Acces(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    mail = db.Column(db.String(100), unique=False, nullable=False)
    action = db.Column(db.Enum(ActionEnum), nullable=False)
    num_ticket = db.Column(db.String(50), nullable=True)
    date_enregistrement = db.Column(db.DateTime, default=datetime.now)
    date_modification = db.Column(db.DateTime)
    actif = db.Column(db.Boolean, default=True)

    plateforme_id = db.Column(db.Integer, db.ForeignKey('plateforme.id'), nullable=False)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), nullable=False)

    plateforme = db.relationship('Plateforme', back_populates='acces')
    utilisateur = db.relationship('Utilisateur', backref='acces')

    def to_dict(self):
        return {
            "id": self.id,
            "login": self.login,
            "name": self.name,
            "mail": self.mail,
            "action": self.action.value,
            "num_ticket": self.num_ticket,
            "date_enregistrement": self.date_enregistrement.strftime('%Y-%m-%d %H:%M:%S'),
            "date_modification": self.date_modification.strftime('%Y-%m-%d %H:%M:%S') if self.date_modification else None,
            "actif": self.actif,
            "plateforme_id": self.plateforme_id,
            "utilisateur_id": self.utilisateur_id
        }
