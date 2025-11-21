from config import db
from datetime import datetime

class HistoriqueAction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type_action = db.Column(db.String(100), nullable=False)
    date_action = db.Column(db.DateTime, default=datetime.now)
    description = db.Column(db.Text, nullable=True)

    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), nullable=False)
    utilisateur = db.relationship('Utilisateur', back_populates='historique')

    def to_dict(self):
        return {
            "id": self.id,
            "type_action": self.type_action,
            "date_action": self.date_action.strftime('%Y-%m-%d %H:%M:%S'),
            "description": self.description,
            "utilisateur_id": self.utilisateur_id,
            "utilisateur_userId": self.utilisateur.userId if self.utilisateur else None
        }
