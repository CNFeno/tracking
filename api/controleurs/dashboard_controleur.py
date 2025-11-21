from flask_restful import Resource
from flask_jwt_extended import jwt_required
from flask import jsonify, request
from modeles.acces import Acces
from modeles.plateforme import Plateforme
from config import db
from sqlalchemy import func
from datetime import datetime, timedelta

class DashboardStats(Resource):
    @jwt_required()
    def get(self):
        updated = db.session.query(Acces).filter(Acces.action == 'update').count()
        created = db.session.query(Acces).filter(Acces.date_enregistrement).count()
        suspended = db.session.query(Acces).filter(Acces.action == 'suspension').count()
        deleted = db.session.query(Acces).filter(Acces.action == 'deletion').count()

        return jsonify({
            "updated": updated,
            "created": created,
            "suspended": suspended,
            "deleted": deleted
        })

class DashboardTodayUpdates(Resource):
    @jwt_required()
    def get(self):
        today = datetime.utcnow().date()
        results = db.session.query(
            Plateforme.nom,
            func.count(Acces.id)
        ).join(Acces, Acces.plateforme_id == Plateforme.id)\
         .group_by(Plateforme.nom)\
         .all()

        return jsonify([
            {"platform": r[0], "count": r[1]} for r in results
        ])

class DashboardChart(Resource):
    @jwt_required()
    def get(self):
        period = request.args.get('period', 'week')
        today = datetime.utcnow().date()

        if period == 'week':
            start_date = today - timedelta(days=today.weekday())  # lundi
            label_expr = ((func.dayofweek(Acces.date_enregistrement) + 5) % 7).label("weekday")
            label = label_expr
            label_map = {
                0: 'Mon', 1: 'Tue', 2: 'Wed', 3: 'Thu',
                4: 'Fri', 5: 'Sat', 6: 'Sun'
            }
            expected_keys = list(range(0, 7))  # 0 to 6
        elif period == 'month':
            start_date = today.replace(day=1)
            label = func.date_format(Acces.date_enregistrement, '%d').label("day")
            label_map = None
            # Génère '01' à '31' selon le mois
            from calendar import monthrange
            days_in_month = monthrange(today.year, today.month)[1]
            expected_keys = [str(i).zfill(2) for i in range(1, days_in_month + 1)]
        elif period == 'year':
            start_date = today.replace(month=1, day=1)
            label = func.date_format(Acces.date_enregistrement, '%m').label("month")
            label_map = {
                '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
                '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
                '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
            }
            expected_keys = [str(i).zfill(2) for i in range(1, 13)]
        else:
            return jsonify([])

        # Récupération des données brutes
        results = db.session.query(
            label,
            func.count(Acces.id)
        ).filter(Acces.date_enregistrement >= start_date)\
         .group_by(label)\
         .order_by(label)\
         .all()

        # Dictionnaire temporaire : {clé brute -> count}
        count_map = {raw_label: count for raw_label, count in results}

        chart = []
        for key in expected_keys:
            if period == 'week':
                # Ici, la clé est un int 0-6
                raw_label = key
                count = count_map.get(raw_label, 0)
                display = label_map.get(raw_label, str(raw_label))
            elif isinstance(label_map, dict):
                raw_label = key
                count = count_map.get(key, 0)
                display = label_map.get(key, str(key))
            else:
                raw_label = key
                count = count_map.get(key, 0)
                display = key  # pas de map, on affiche directement

            chart.append({"day": display, "count": count})

        return jsonify(chart)





