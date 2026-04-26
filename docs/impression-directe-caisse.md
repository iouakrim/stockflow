# Guide d'Impression Directe (Sans Popup) pour la Caisse StockFlow

## Le Problème
Les navigateurs web empêchent par défaut les sites de lancer une impression silencieusement sans confirmation de la part de l'utilisateur. C'est une mesure de sécurité.
Toutefois, dans le contexte d'une caisse (POS), cliquer sur "Imprimer" et devoir valider la popup du navigateur à chaque reçu est une grande perte de temps.

## La Solution : Kiosk Printing
La méthode la plus robuste et sans installation de pilote tiers (comme Java/QZ Tray) consiste à utiliser le paramètre natif de Google Chrome `--kiosk-printing`. 
Ce paramètre force Chrome à toujours accepter l'impression en silencieux de façon instantanée.

### Prérequis côté Client
1. Le client doit avoir installé **Google Chrome** sur la machine caisse.
2. L'imprimante thermique (ex: Epson TM-T88VI) **doit être configurée comme l'imprimante par défaut sous Windows**.
3. *Optionnel mais conseillé* : Lors de la toute première impression sur leur caisse, le client devra configurer les marges à "Aucune" et décocher les en-têtes et pieds de page. Chrome garde cela en mémoire pour les fois d'après.

## Le Script d'Installation de Raccourci
Pour éviter aux utilisateurs, souvent mal à l'aise avec la technique, de modifier manuellement les propriétés de leur raccourci Chrome (clic droit > propriétés > cible...), nous avons un script automatisé situé ici :
`scripts/printer/Install-Caisse-StockFlow.bat`.

### Comment la procédure fonctionne pour les clients ?
1. Vous envoyez ou faites télécharger ce fichier `.bat` (idéalement zippé) à votre client.
2. Le client fait simplement un **double-clic** dessus.
3. Le script lit le registre Windows en arrière-plan pour détecter le chemin exact de Google Chrome sur leur PC.
4. Il crée instantanément une belle icône de raccourci **"Caisse StockFlow"** sur leur Bureau.
5. De façon invisible, la "cible" de ce raccourci contient le fameux paramètre : `chrome.exe --kiosk-printing http://votre-url-de-caisse`.
6. En ouvrant la caisse via cette nouvelle icône sur leur bureau, le client verra que les impressions sont devenues immédiates et magiques !

### Configuration Développeur
📌 **Très Important :** N'oubliez pas d'éditer le fichier `scripts/printer/Install-Caisse-StockFlow.bat` pour modifier la variable `URL` (actuellement à `http://localhost:3000/dashboard`) avant de distribuer ce fichier. Elle doit pointer vers l'URL en production de la caisse ou de l'application. 
```bat
:: Ligne 11 du script
SET URL="https://app.stockflow-pro.com/sales/new"
```
