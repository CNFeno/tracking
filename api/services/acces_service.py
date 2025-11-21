from flask import abort
from flask_jwt_extended import get_jwt_identity
from services.historique_action_service import HistoriqueActionService
from modeles.acces import Acces
from config import db

class AccesService:
    @staticmethod
    def get_all():
        return [a.to_dict() for a in Acces.query.all()]

    @staticmethod
    def get_by_id(acces_id):
        a = Acces.query.get(acces_id)
        return a.to_dict() if a else None

    @staticmethod
    def create(data):
        utilisateur_id = get_jwt_identity()  # ✅ récupérer depuis le token

        # Vérifier s'il existe déjà un accès avec ce login et cette plateforme
        doublon = Acces.query.filter_by(
            login=data['login'],
            plateforme_id=data['plateforme_id']
        ).first()

        if doublon:
            abort(409, description="Un accès avec ce login et cette plateforme existe déjà.")

        a = Acces(
            login=data['login'],
            name=data['name'],
            mail=data['mail'],
            action=data['action'],
            num_ticket=data.get('num_ticket'),
            plateforme_id=data['plateforme_id'],
            utilisateur_id=utilisateur_id  # ✅ forcer l’ID de l’utilisateur connecté
        )
        db.session.add(a)
        db.session.commit()

        # Historiser la création
        HistoriqueActionService.enregistrer_action(
            utilisateur_id=utilisateur_id,
            type_action="Création",
            description=f"Création d'un accès {a.id} pour {a.name} ({a.mail})"
        )

        return a.to_dict()

    @staticmethod
    def update(acces_id, data):
        a = Acces.query.get(acces_id)
        if not a:
            return None

        utilisateur_id = get_jwt_identity()  # ✅ récupéré du token

        old_values = a.to_dict()

        a.login = data.get('login', a.login)
        a.name = data.get('name', a.name)
        a.mail = data.get('mail', a.mail)
        a.action = data.get('action', a.action)
        a.num_ticket = data.get('num_ticket', a.num_ticket)
        db.session.commit()

        # Historiser la modification
        description = f"Modification de l'accès {a.id} :\n"
        for key, new_value in data.items():
            if key == 'utilisateur_id':
                continue  # Ignore la modification du champ utilisateur_id
            old_value = old_values.get(key, None)
            if old_value != new_value:
                description += f" - {key}: {old_value} → {new_value}\n"


        HistoriqueActionService.enregistrer_action(
            utilisateur_id=utilisateur_id,
            type_action="Modification",
            description=description
        )

        return a.to_dict()

    @staticmethod
    def delete(acces_id):
        a = Acces.query.get(acces_id)
        if not a:
            return None

        utilisateur_id = get_jwt_identity()  # ✅ idem pour la suppression

        HistoriqueActionService.enregistrer_action(
            utilisateur_id=utilisateur_id,
            type_action="Suppression",
            description=f"Suppression de l'accès {a.id} ({a.name}, {a.mail})"
        )

        db.session.delete(a)
        db.session.commit()
        return True
