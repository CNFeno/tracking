from config import db
from datetime import datetime

class Plateforme(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    date_creation = db.Column(db.DateTime, default=datetime.now)
    actif = db.Column(db.Boolean, default=True)

    acces = db.relationship('Acces', back_populates='plateforme', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "nom": self.nom,
            "description": self.description,
            "date_creation": self.date_creation.strftime('%Y-%m-%d %H:%M:%S') if self.date_creation else None,
            "actif": self.actif
        }
    
from modeles.acces import Acces
