from flask import abort
from flask_jwt_extended import get_jwt_identity
from services.historique_action_service import HistoriqueActionService
from modeles.acces import Acces
from modeles.enums import ActionEnum
from config import db
from datetime import datetime

DATE_FORMATS = (
    '%Y-%m-%d %H:%M:%S',
    '%Y-%m-%dT%H:%M:%S',
    '%Y-%m-%d',
    '%d/%m/%Y %H:%M:%S',
    '%d/%m/%Y',
)


def parse_import_date(value):
    if not value:
        raise ValueError("La date de modification est obligatoire.")

    value = str(value).strip()
    for date_format in DATE_FORMATS:
        try:
            return datetime.strptime(value, date_format)
        except ValueError:
            pass

    raise ValueError("Format de date invalide. Formats acceptés: YYYY-MM-DD, YYYY-MM-DD HH:MM:SS, DD/MM/YYYY.")


def normalize_action(value):
    action = str(value or '').strip().lower()
    allowed_actions = [item.value for item in ActionEnum]
    if action not in allowed_actions:
        raise ValueError(f"Action invalide '{value}'. Valeurs acceptées: {', '.join(allowed_actions)}.")
    return action


def latest_access_date(acces):
    return acces.date_modification or acces.date_enregistrement

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

    @staticmethod
    def import_batch(records):
        utilisateur_id = get_jwt_identity()
        summary = {
            "created": 0,
            "updated": 0,
            "history_only": 0,
            "errors": []
        }

        for index, data in enumerate(records, start=2):
            try:
                required_fields = ['login', 'name', 'mail', 'action', 'num_ticket', 'plateforme_id']
                missing_fields = [field for field in required_fields if not data.get(field)]
                if missing_fields:
                    raise ValueError(f"Champ(s) manquant(s): {', '.join(missing_fields)}.")

                import_date = parse_import_date(data.get('date_modification') or data.get('date_enregistrement'))
                plateforme_id = int(data['plateforme_id'])
                action = normalize_action(data['action'])
                action_enum = ActionEnum(action)

                acces = Acces.query.filter_by(
                    login=data['login'],
                    plateforme_id=plateforme_id
                ).first()

                if not acces:
                    acces = Acces(
                        login=data['login'],
                        name=data['name'],
                        mail=data['mail'],
                        action=action_enum,
                        num_ticket=data.get('num_ticket'),
                        plateforme_id=plateforme_id,
                        utilisateur_id=utilisateur_id,
                        date_enregistrement=import_date
                    )
                    db.session.add(acces)
                    db.session.flush()

                    HistoriqueActionService.enregistrer_action(
                        utilisateur_id=utilisateur_id,
                        type_action="Import",
                        description=f"Import d'un nouvel accès {acces.id} pour {acces.name} ({acces.mail}) à la date {import_date.strftime('%Y-%m-%d %H:%M:%S')}",
                        date_action=import_date,
                        commit=False
                    )
                    db.session.commit()
                    summary["created"] += 1
                    continue

                current_date = latest_access_date(acces)
                old_values = acces.to_dict()

                if current_date and import_date < current_date:
                    HistoriqueActionService.enregistrer_action(
                        utilisateur_id=utilisateur_id,
                        type_action="Import ignoré",
                        description=(
                            f"Import plus ancien ignoré pour l'accès {acces.id} ({acces.login}). "
                            f"Date importée: {import_date.strftime('%Y-%m-%d %H:%M:%S')}, "
                            f"date existante: {current_date.strftime('%Y-%m-%d %H:%M:%S')}."
                        ),
                        date_action=import_date,
                        commit=False
                    )
                    db.session.commit()
                    summary["history_only"] += 1
                    continue

                acces.name = data['name']
                acces.mail = data['mail']
                acces.action = action_enum
                acces.num_ticket = data.get('num_ticket')
                acces.date_modification = import_date

                changes = []
                new_values = {
                    "name": acces.name,
                    "mail": acces.mail,
                    "action": action,
                    "num_ticket": acces.num_ticket,
                    "date_modification": import_date.strftime('%Y-%m-%d %H:%M:%S')
                }

                for key, new_value in new_values.items():
                    old_value = old_values.get(key)
                    if str(old_value) != str(new_value):
                        changes.append(f"{key}: {old_value} -> {new_value}")

                description = f"Modification importée de l'accès {acces.id} ({acces.login})"
                if changes:
                    description += " : " + "; ".join(changes)

                HistoriqueActionService.enregistrer_action(
                    utilisateur_id=utilisateur_id,
                    type_action="Import modification",
                    description=description,
                    date_action=import_date,
                    commit=False
                )
                db.session.commit()
                summary["updated"] += 1
            except Exception as error:
                db.session.rollback()
                summary["errors"].append({
                    "row": index,
                    "message": str(error)
                })

        summary["total"] = len(records)
        return summary
