from modeles.plateforme import Plateforme
from config import db

class PlateformeService:
    @staticmethod
    def get_all():
        return [p.to_dict() for p in Plateforme.query.all()]

    @staticmethod
    def get_by_id(plateforme_id):
        p = Plateforme.query.get(plateforme_id)
        return p.to_dict() if p else None

    @staticmethod
    def create(data):
        p = Plateforme(nom=data['nom'], description=data['description'])
        db.session.add(p)
        db.session.commit()
        return p.to_dict()

    @staticmethod
    def delete(plateforme_id):
        p = Plateforme.query.get(plateforme_id)
        if not p:
            return None
        db.session.delete(p)
        db.session.commit()
        return True
    
    @staticmethod
    def update(plateforme_id, data):
        p = Plateforme.query.get(plateforme_id)
        if not p:
            return None
        
        p.nom=data.get('nom',p.nom)
        p.description=data.get('description',p.description)
        
        db.session.commit()
        return p.to_dict()
