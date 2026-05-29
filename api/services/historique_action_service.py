from datetime import datetime
from modeles.acces import Acces
from modeles.historique_action import HistoriqueAction
from config import db

class HistoriqueActionService:
    @staticmethod
    def get_all():
        return [h.to_dict() for h in HistoriqueAction.query.all()]

    @staticmethod
    def get_by_id(historique_id):
        h = HistoriqueAction.query.get(historique_id)
        return h.to_dict() if h else None

    @staticmethod
    def create(data):
        h = HistoriqueAction(
            type_action=data['type_action'],
            description=data.get('description'),
            utilisateur_id=data['utilisateur_id']
        )
        db.session.add(h)
        db.session.commit()
        return h.to_dict()

    @staticmethod
    def delete(historique_id):
        h = HistoriqueAction.query.get(historique_id)
        if not h:
            return None
        db.session.delete(h)
        db.session.commit()
        return True
    
    @staticmethod
    def enregistrer_action(utilisateur_id, type_action, description, date_action=None, commit=True):
        action = HistoriqueAction(
            utilisateur_id=utilisateur_id,
            type_action=type_action,
            description=description,
            date_action=date_action or datetime.now()
        )
        db.session.add(action)
        if commit:
            db.session.commit()
        return action.to_dict()
    
    @staticmethod
    def get_by_utilisateur(utilisateur_id):
        return [h.to_dict() for h in HistoriqueAction.query.filter_by(utilisateur_id=utilisateur_id).order_by(HistoriqueAction.date_action.desc()).all()]

    @staticmethod
    def get_by_acces(acces_id):
        acces = Acces.query.get(acces_id)
        if not acces:
            return []
        
        return [h.to_dict() for h in HistoriqueAction.query.filter(HistoriqueAction.description.ilike(f"%Accès {acces_id}%")).order_by(HistoriqueAction.date_action.desc()).all()]
