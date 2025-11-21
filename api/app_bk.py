from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'  # Utilisation d'une base SQLite pour le test
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
api = Api(app)

# Modèle Utilisateur
class Utilisateur(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False)
    date_creation = db.Column(db.DateTime, default=db.func.current_timestamp())
    actif = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "nom": self.nom,
            "email": self.email,
            "role": self.role,
            "date_creation": self.date_creation.strftime('%Y-%m-%d %H:%M:%S'),
            "actif": self.actif
        }

# Ressource pour la gestion des utilisateurs
class UtilisateurResource(Resource):
    def get(self, user_id=None):
        if user_id:
            utilisateur = Utilisateur.query.get(user_id)
            if not utilisateur:
                return {'message': 'Utilisateur non trouvé'}, 404
            return jsonify(utilisateur.to_dict())
        
        utilisateurs = Utilisateur.query.all()
        return jsonify([user.to_dict() for user in utilisateurs])
    
    def post(self):
        data = request.json
        nouvel_utilisateur = Utilisateur(
            nom=data['nom'],
            email=data['email'],
            role=data['role']
        )
        db.session.add(nouvel_utilisateur)
        db.session.commit()
        return {'message': 'Utilisateur créé avec succès'}, 201
    
    def put(self, user_id):
        utilisateur = Utilisateur.query.get(user_id)
        if not utilisateur:
            return {'message': 'Utilisateur non trouvé'}, 404
        
        data = request.json
        utilisateur.nom = data.get('nom', utilisateur.nom)
        utilisateur.email = data.get('email', utilisateur.email)
        utilisateur.role = data.get('role', utilisateur.role)
        utilisateur.actif = data.get('actif', utilisateur.actif)
        db.session.commit()
        return {'message': 'Utilisateur mis à jour avec succès'}
    
    def delete(self, user_id):
        utilisateur = Utilisateur.query.get(user_id)
        if not utilisateur:
            return {'message': 'Utilisateur non trouvé'}, 404
        
        db.session.delete(utilisateur)
        db.session.commit()
        return {'message': 'Utilisateur supprimé avec succès'}

# Ajout des routes API
api.add_resource(UtilisateurResource, '/utilisateurs', '/utilisateurs/<int:user_id>')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crée la base de données et les tables
    app.run(debug=True)
