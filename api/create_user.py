from config import create_app, db
from modeles.utilisateur import Utilisateur

app, _ = create_app()

with app.app_context():
    db.create_all()

    user = Utilisateur(nom="Admin", email="admin@yas.mg", role="ADMIN")
    user.set_password("password123")  # Définit un mot de passe sécurisé
    db.session.add(user)
    db.session.commit()

print("Utilisateur créé avec succès !")
