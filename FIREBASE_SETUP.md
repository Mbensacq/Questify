# 🔥 Configuration Firebase pour Questify

## Étape 1 : Créer un projet Firebase (gratuit)

1. Va sur [Firebase Console](https://console.firebase.google.com)
2. Clique sur "Ajouter un projet"
3. Nomme-le (ex: `questify-app`)
4. Désactive Google Analytics (pas nécessaire)
5. Clique "Créer le projet"

## Étape 2 : Ajouter une application Web

1. Dans ton projet, clique sur l'icône Web `</>`
2. Nomme l'app (ex: `questify-web`)
3. **Ne coche PAS** Firebase Hosting
4. Copie les valeurs de `firebaseConfig`

## Étape 3 : Activer l'authentification Google

1. Va dans **Authentication** (menu de gauche)
2. Clique sur **Premiers pas**
3. Onglet **Sign-in method**
4. Active **Google**
5. Sélectionne ton email comme email d'assistance
6. Clique **Enregistrer**

## Étape 4 : Créer la base de données Firestore

1. Va dans **Firestore Database**
2. Clique **Créer une base de données**
3. Choisis **Mode production**
4. Sélectionne une région proche (ex: `europe-west1`)

## Étape 5 : Configurer les règles de sécurité

Dans Firestore > Règles, remplace par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs : lecture/écriture uniquement pour son propre document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Stats de jeu
    match /gameStats/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tâches
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    // Catégories
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    // Quêtes
    match /quests/{questId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Étape 6 : Configurer les variables d'environnement

Crée un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Puis remplis avec tes valeurs Firebase :

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=questify-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=questify-app
VITE_FIREBASE_STORAGE_BUCKET=questify-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Étape 7 : Autoriser ton domaine GitHub Pages

1. Va dans **Authentication** > **Settings** > **Authorized domains**
2. Ajoute ton domaine GitHub Pages : `ton-username.github.io`

## 🚀 Déploiement sur GitHub Pages

```bash
# Build l'application
npm run build

# Les fichiers sont dans le dossier dist/
```

Tu peux utiliser GitHub Actions pour automatiser le déploiement (voir le fichier `.github/workflows/deploy.yml`).

---

## Mode Démo

Si Firebase n'est pas configuré ou si la connexion échoue, les utilisateurs peuvent toujours utiliser le **Mode Démo** qui stocke les données localement dans le navigateur.

## Limites du tier gratuit Firebase (Spark)

- ✅ 50 000 lectures/jour
- ✅ 20 000 écritures/jour  
- ✅ 1 Go de stockage
- ✅ Authentification illimitée

Largement suffisant pour un groupe d'amis ! 🎮
