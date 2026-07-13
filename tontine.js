// FORMULAIRE AFFICHER / CACHER
let btnNouvelle = document.getElementById("nouvelleTontine");
let formulaire = document.getElementById("formulaireTontine");

btnNouvelle.addEventListener("click", function () {
    if (formulaire.style.display === "none" || formulaire.style.display === "") {
        formulaire.style.display = "block";
    } else {
        formulaire.style.display = "none";
    }
});

// DONNÉES PRINCIPALES
let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
let tontines = JSON.parse(localStorage.getItem("tontines")) || [];
let utilisateur = JSON.parse(localStorage.getItem("utilisateur"));
// if (!utilisateur || !utilisateur.email) {
//     alert("Vous devez être connecté.");
//     window.location.href = "inscription.html";
// }

let bouton = document.getElementById("btn-creer");
let cartes = document.querySelector(".cartes");

// Pour la position de la tontine avant toute modification, c'est comme une valeur par défaut
let indexModification = -1;

// AFFICHAGE TONTINES

function afficherTontines() {
    let moisNumero = {
        "janvier": 0,
        "février": 1,
        "mars": 2,
        "avril": 3,
        "mai": 4,
        "juin": 5,
        "juillet": 6,
        "août": 7,
        "septembre": 8,
        "octobre": 9,
        "novembre": 10,
        "décembre": 11,
    }
    let utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];
    let changementsRecents = false;

    //CALCUL DU BENEFICIAIRE ET DU PROCHAIN VERSEMENT
    tontines.forEach(function (tontine) {
        if (!tontine.distributionsFaites) {
            tontine.distributionsFaites = [];
        }
        if (tontine.cagnotteActuelle === undefined) {
            tontine.cagnotteActuelle = 0;
        }
        let dateDebut = new Date(tontine.annee, moisNumero[tontine.mois], tontine.jour);
        let aujourdHui = new Date();

        // Clé unique pour marquer que ce mois précis a été payé
        let cleDistributionMois = `${tontine.mois}-${aujourdHui.getFullYear()}`;

        // CONDITIONS STRICTES DE DISTRIBUTION D'ARGENT: 
        let objectifMois = tontine.totalMensuel;
        let dateVersementAtteinte = aujourdHui.getDate() >= Number(tontine.jour);
        if (tontine.cagnotteActuelle >= objectifMois && dateVersementAtteinte && !tontine.distributionsFaites.includes(cleDistributionMois)) { // la troisième condition signifie qu'il faut vérifier si ce mois là a déjà été payé...si la clé est déjà dans le tableau alors, ça renvoie vrai et à cause de ! ça donne false, donc l'accès est bloqué...mais si ce n'est pas encore dans le tableau , alors ça donne false et à cause de ! , ça donne vrai .

            // Determinant du bénéficiaire légitime de ce tour ( C'est celui qui correspond au nombre de distributions déjà effectué et non à la date )
            let position = tontine.distributionsFaites.length % tontine.membres.length;
            let beneficiaire = tontine.membres[position];

            if (beneficiaire) {
                let userBeneficiaire = utilisateurs.find(u => u.nomu === beneficiaire.nom);
                if (userBeneficiaire) {
                    //On crédite son compte
                    if (tontine.devise === "USD") {
                        if (userBeneficiaire.soldeUSD === undefined) {
                            userBeneficiaire.soldeUSD = 0;
                        }
                        userBeneficiaire.soldeUSD += objectifMois;
                    }
                    else {
                        if (userBeneficiaire.soldeCDF === undefined) {
                            userBeneficiaire.soldeCDF = 0;
                        }
                        userBeneficiaire.soldeCDF += objectifMois;
                    }

                    tontine.distributionsFaites.push(cleDistributionMois);
                    //On remet la cagnotte à zéro pour les cotisations du mois suivant 
                    tontine.cagnotteActuelle = 0;
                    changementsRecents = true;

                    alert(`Jour de versement atteint ! La cagnotte mensuelle de ${objectifMois} ${tontine.devise} a été versée sur le compte de ${beneficiaire.nom}.`);

                    //On synchronise le solde qui se trouve dans utilisateurs avec celui qui se trouve dans utilisateur 
                    if (userBeneficiaire.nomu === utilisateur.nomu) {
                        utilisateur.soldeUSD = userBeneficiaire.soldeUSD;
                        utilisateur.soldeCDF = userBeneficiaire.soldeCDF;
                        localStorage.setItem("utilisateur", JSON.stringify(utilisateur));
                    }
                }
            }
        }
    });
    //Sauvergarde globale si un virement a eu lieu pendant le chargement
    if (changementsRecents) {
        localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
        localStorage.setItem("tontines", JSON.stringify(tontines));
    }

    let contenu = "";
    // on ne montre la tontine que si c'est le créateur lui-même ou que si l'utilisateur est membre et strictement en statut accepté
    let tontinesVisibles = tontines.filter(function (t) {
        // Si l'utilisateur actuel est le créateur, donc il la voit d'office
        if (t.createur === utilisateur.nomu) {
            return true;
        }
        // Sinon on vérifie si il est dans la liste des membres et qu'il a validé son statut à "Accepté"
        return t.membres.some(function (m) {
            return m.nom === utilisateur.nomu && m.statut === "Accepté";
        });
    });
    if (tontinesVisibles.length === 0) {
        contenu = `<h3>Vous n'avez pas encore de tontine, Créez-en une</h3>`;
    }
    else {
        tontinesVisibles.forEach(function (tontine, id) {
            if (!tontine.distributionsFaites) {
                tontine.distributionsFaites = [];
            }
            let dateDebut = new Date(tontine.annee, moisNumero[tontine.mois], tontine.jour);
            let aujourdHui = new Date();

            let moisEcoules =
                (aujourdHui.getFullYear() - dateDebut.getFullYear()) * 12 +
                (aujourdHui.getMonth() - dateDebut.getMonth()) + 1;

            let indexProchain = tontine.distributionsFaites.length % tontine.membres.length;
            let b = tontine.membres[indexProchain];
            let prochainBeneficiaire;
            if (b) {
                prochainBeneficiaire = b.nom;
            }
            else {
                prochainBeneficiaire = "Inconnu";
            }
            //Calcul de la date du prochain versement 
            //Si 0 distributions faites alors, la date est la date du début
            //Si 1 distribution faite alor, la date est de +1 mois 
            let nbDistributions = tontine.distributionsFaites.length;
            let dateProchainVersement = new Date(tontine.annee, moisNumero[tontine.mois], tontine.jour);
            dateProchainVersement.setMonth(dateProchainVersement.getMonth() + nbDistributions);

            let optionsDate = { day: 'numeric', month: 'long', year: 'numeric' };
            let dateProchaineAffichage = dateProchainVersement.toLocaleDateString('fr-FR', optionsDate);
            //Si la tontine est complètement finie (toutes les distributions de la durée ont été faites)
            if (tontine.distributionsFaites.length >= tontine.duree) {
                prochainBeneficiaire = "Aucun (Tontine terminée)";
                dateProchaineAffichage = "Tontine clôturée";
            }

            let message = "";

            if (moisEcoules >= tontine.duree) {
                if (tontine.duree == tontine.nombreMembres) {
                    message = "🎉 Tontine terminée ! Félicitations !";
                }
                else {
                    let tours = Math.floor(moisEcoules / tontine.nombreMembres);
                    if (Number.isInteger(tours)) {
                        message = `🎉 Le ${tours}ᵉ tour est terminé !`;
                    }
                }
            }
            let nomsDesMembres = tontine.membres.map(function (m) { return m.nom; }).join(",");

            // GESTION DE LA PROGRESSION VISUELLE
            if (tontine.cagnotteActuelle === undefined) {
                tontine.cagnotteActuelle = 0;
            }
            let objectifMois = tontine.totalMensuel;
            let pourcentage = Math.min((tontine.cagnotteActuelle / objectifMois) * 100, 100).toFixed(0);
            // GESTION DYNAMIQUE DU COMPORTEMENT DU BOUTON DE COTISATION  
            if (tontine.historiquePaiements === undefined) {
                tontine.historiquePaiements = [];
            }
            //On determine le mois de cotisation 
            // Si 0 distribution faite , alors, on cotise pour le mois de début 
            //Si 1 distribution faite , alors, le premier membre a reçu son argent , donc le bouton passe au mois suivant 
            let nbDistributionsFaites = tontine.distributionsFaites.length;
            let dateCotisationActuelle = new Date(tontine.annee, moisNumero[tontine.mois], tontine.jour);
            dateCotisationActuelle.setMonth(dateCotisationActuelle.getMonth() + nbDistributionsFaites);
            // On récupère le nom du mois pour lequel on doit cotiser maintenant
            let optionsMois = { month: 'long' };
            let nomMoisA_cotiser = dateCotisationActuelle.toLocaleDateString('fr-FR', optionsMois);
            //La clé de paiement devient unique pour ce mois spécifique de cotisation 
            let clePaiement = `${utilisateur.nomu}-${nomMoisA_cotiser}-${dateCotisationActuelle.getFullYear()}`;
            let aDejaCotise = tontine.historiquePaiements.includes(clePaiement);

            let boutonHTML = "";
            //Si la tontine est finie, on ne peut plus cotiser 
            if (tontine.distributionsFaites.length >= tontine.duree) {
                boutonHTML = `
                   <button class="btn-cotiser" disabled > Tontine terminée </button>`;
            }
            else if (aDejaCotise) {
                boutonHTML = `
                   <button class="btn-cotiser" disabled >Cotisation versée pour ${nomMoisA_cotiser}</button>`;

            }
            else {
                boutonHTML = `<button class="btn-cotiser" onclick="cotiserTontine(${tontine.id})" >Verser ma cotisation pour ${nomMoisA_cotiser}</button>`
            }

            contenu += `
                    <section class ="tontine1">
                            <h2>${tontine.nomtontine}</h2>
                                <h3>Depuis le ${aujourdHui.getDate()} / ${aujourdHui.getMonth() + 1} / ${aujourdHui.getFullYear()} </h3>

                                <div class="zone-progression" style="margin:15px 0;">
                                      <p> Progression de la cagnotte : <b>${tontine.cagnotteActuelle}/${objectifMois} ${tontine.devise} </b> (${pourcentage}%)</p>
                                      <progress value="${tontine.cagnotteActuelle}" max="${objectifMois}" style="width:100%; heigth:15px;"></progress>
                                </div>
                                ${boutonHTML}

                                <br><br>

                                    <details>
                                        <summary> Voir les détails </summary>
                                        <h3>Résumé de la tontine ${tontine.nomtontine}</h3>
                                        <ul>
                                            <li><img src="membre.png" alt="membre"> <b>Membres :</b> <b>${nomsDesMembres}</b> </li>
                                            <li><img src="piece.png" alt="Pièces"> <b>Mensualité :</b> <b>${tontine.montant} ${tontine.devise}/</b>mois</li>
                                            <li><img src="sablier.png" alt="horloge"> <b>Durée :</b> <b>${tontine.duree} mois</b></li>
                                            <li><img src="play.png" alt="play"> <b>Début :</b> <b>${tontine.jour} ${tontine.mois} </b>${tontine.annee}</li>
                                            <li><img src="calendrier3.png" alt="calendrier"> <b>Prochain versement :</b> <b>${dateProchaineAffichage}</b></li>
                                            <li>
                                                <details>
                                                    <summary><img src="liste.png" alt="mains"> <b>Ordre des bénéficiaires</b></summary>
                                                    <p>${tontine.membres.map(function (m) { return `${m.nom} (${m.statut})`; }).join(",<br>",)}</p>
                                                </details>
                                            </li>
                                            <li>${message} </li>
                                            <li>Prochain bénéficiaire : ${prochainBeneficiaire}</li>
                                        </ul>
                                    </details>
                                    <br>
                                    <button id="modifier" onclick="modifierTontine(${tontine.id})">Modifier</button>
                                    <button id="supprimer" onclick="supprimerTontine(${tontine.id})">Supprimer</button>
                                </section>
                               `;
        });
    }
    cartes.innerHTML = contenu;
}
afficherTontines();

// FONCTION COTISER (DÉBIT DU PORTE-MONNAIE)

function cotiserTontine(idTontine) {
    let tontine = tontines.find(t => t.id === idTontine);
    let utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];

    // On récupère le profil complet de l'utilisateur connecté pour modifier son solde réel
    let userActuel = utilisateurs.find(u => u.nomu === utilisateur.nomu);
    let moisNumero = {
        "janvier": 0,
        "février": 1,
        "mars": 2,
        "avril": 3,
        "mai": 4,
        "juin": 5,
        "juillet": 6,
        "août": 7,
        "septembre": 8,
        "octobre": 9,
        "novembre": 10,
        "décembre": 11,
    };

    if (!userActuel) {
        alert("Utilisateur non trouvé.");
        return;
    }

    // Vérification de l'activation du porte-monnaie
    if (userActuel.portemonnaieActive !== true) {
        alert("Veuillez d'abord activer votre porte-monnaie dans la section dédiée.");
        return;
    }
    let montantA_Debiter = Number(tontine.montant);

    // Débit selon la devise de la tontine
    if (tontine.devise === "USD") {
        if (userActuel.soldeUSD === undefined) {
            userActuel.soldeUSD = 0;
        }
        if (userActuel.soldeUSD < montantA_Debiter) {
            alert(`Solde USD insuffisant ! Il vous faut ${montantA_Debiter} USD dans votre porte-monnaie.`);
            return;
        }
        userActuel.soldeUSD -= montantA_Debiter; // Débit
    } else {
        if (userActuel.soldeCDF === undefined) {
            userActuel.soldeCDF = 0;
        }

        if (userActuel.soldeCDF < montantA_Debiter) {
            alert(`Solde CDF insuffisant ! Il vous faut ${montantA_Debiter} CDF dans votre porte-monnaie.`);
            return;
        }
        userActuel.soldeCDF -= montantA_Debiter; // Débit
    }

    // Augmentation de la cagnotte de la tontine
    if (tontine.cagnotteActuelle === undefined) {
        tontine.cagnotteActuelle = 0;
    }
    tontine.cagnotteActuelle += montantA_Debiter;

    //ENREGISTREMENT DU PAIEMENT POUR LE MOIS EN COURS DANS L'HISTORIQUE

    if (tontine.historiquePaiements === undefined) {
        tontine.historiquePaiements = [];
    }
    let nbDistributionsFaites = tontine.distributionsFaites.length;
    let dateCotisationActuelle = new Date(tontine.annee, moisNumero[tontine.mois], tontine.jour);
    dateCotisationActuelle.setMonth(dateCotisationActuelle.getMonth() + nbDistributionsFaites);

    // On récupère le nom du mois pour lequel on doit cotiser maintenant

    let optionsMois = { month: 'long' };
    let nomMoisA_cotiser = dateCotisationActuelle.toLocaleDateString('fr-FR', optionsMois);

    //La clé de paiement devient unique pour ce mois spécifique de cotisation 

    let clePaiement = `${utilisateur.nomu}-${nomMoisA_cotiser}-${dateCotisationActuelle.getFullYear()}`;
    tontine.historiquePaiements.push(clePaiement);

    // Sauvegarde générale
    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));

    // Synchronisation de la session actuelle pour le rafraîchissement
    utilisateur.soldeUSD = userActuel.soldeUSD;
    utilisateur.soldeCDF = userActuel.soldeCDF;
    localStorage.setItem("utilisateur", JSON.stringify(utilisateur));
    localStorage.setItem("tontines", JSON.stringify(tontines));

    alert(`Cotisation individuelle de ${montantA_Debiter} ${tontine.devise} versée avec succès !`);
    afficherTontines();
}
window.cotiserTontine = cotiserTontine;

// MEMBRES
let membres = [];
let ajouterMembre = document.getElementById("ajouterMembre");

ajouterMembre.addEventListener("click", function () {
    let nomMembre = document.getElementById("nomMembre").value;
    if (nomMembre !== "") {
        let statut = "En attente";
        // Si c'est le créateur
        if (nomMembre === utilisateur.nomu) {
            statut = "Accepté";
        }
        membres.push({
            nom: nomMembre,
            statut: statut
        });
        document.getElementById("nomMembre").value = "";
        afficherMembres();
    }
});

function afficherMembres() {
    let liste = document.getElementById("listeMembres");
    let contenu = "";
    membres.forEach(function (nomMembre, index) {
        contenu += `
            <p>
                - ${index + 1}. ${nomMembre.nom}
                (${nomMembre.statut})
                <button onclick="monter(${index})">⬆️</button>
                <button onclick="descendre(${index})">⬇️</button>
            </p>
        `;
    });

    liste.innerHTML = contenu;
}

function monter(index) {
    if (index > 0) {
        let temp = membres[index];
        membres[index] = membres[index - 1];
        membres[index - 1] = temp;
        afficherMembres();
    }
}
window.monter = monter;

function descendre(index) {
    if (index < membres.length - 1) {
        let temp = membres[index];
        membres[index] = membres[index + 1];
        membres[index + 1] = temp;
        afficherMembres();
    }
}
window.descendre = descendre;

// CRÉER / ENREGISTRER

bouton.addEventListener("click", function () {

    let nomtontine = document.getElementById("nomtontine").value;
    let jour = document.getElementById("jour").value;
    let mois = document.getElementById("mois").value;
    let annee = document.getElementById("annee").value;
    let duree = Number(document.getElementById("duree").value);
    let montant = Number(document.getElementById("montant").value);
    let devise = document.getElementById("devise").value;

    let nombreMembres = membres.length;
    let nombrePassages = duree / nombreMembres;
    let totalMensuel = nombreMembres * montant;

    if (nomtontine === "" || isNaN(montant) || montant <= 0 || devise === "" || nombreMembres === 0 || isNaN(duree)) {
        alert("Remplissez tous les champs et ajoutez au moins un membre.");
        return;
    }

    if (duree % nombreMembres !== 0) {
        alert(`La durée doit être un multiple de ${nombreMembres}`);
        return;
    }
    else {
        let monNomu = utilisateur.nomu;
        membres.forEach(function (m) {
            if (m.nom === monNomu) {
                m.statut = "Accepté";
            }
        });
        let nouvelleTontine = {
            id: Date.now(),
            nomtontine,
            jour,
            mois,
            annee,
            duree,
            montant,
            devise,
            membres,
            nombreMembres,
            nombrePassages,
            totalMensuel,
            nomMembre,
            cagnotteActuelle: 0,
            historiquePaiements: [],
            distributionsFaites: [],
            createur: utilisateur.nomu
        };
        // On récupère le créateur actuel
        let createur = JSON.parse(localStorage.getItem("utilisateur")).nomu;

        if (indexModification === -1) {
            tontines.push(nouvelleTontine);
            // On envoie l'invitation pendant que la liste des membres est pleine et valide
            envoyerInvitation(membres, nomtontine, createur);
            alert("Tontine créée avec succès !");
        }
        else {
            let confirmation = confirm("Voulez-vous enregistrer vos modifications ?");
            if (!confirmation) {
                return;
            }
            else {
                nouvelleTontine.cagnotteActuelle = tontines[indexModification].cagnotteActuelle || 0;
                nouvelleTontine.historiquePaiements = tontines[indexModification].historiquePaiements || [];
                nouvelleTontine.distributionsFaites = tontines[indexModification].distributionsFaites || [];

                tontines[indexModification] = nouvelleTontine;
                indexModification = -1;
                alert("Tontine modifiée avec succès !");
                bouton.textContent = "Créer la tontine";
            }
        }
        localStorage.setItem("tontines", JSON.stringify(tontines));
        afficherTontines();
        alert(`Chaque membre recevra ${totalMensuel} ${devise}, et cela dans un intervalle de ${nombrePassages} mois au cours de cette tontine`);

        membres = [];
        afficherMembres();
    }

    // INDICATION (OPTIONNEL)

    let indication = document.getElementById("indication");
    if (indication) {
        indication.textContent = "Une tontine fonctionne en rotation mensuelle.";
    }
    afficherTontines();
    setTimeout(function () {
        window.location.reload();
    }, 1000);
});

// MODIFIER TONTINE

function modifierTontine(idTontine) {
    let index = tontines.findIndex(t => t.id === idTontine);
    if (index === -1) {
        return;
    }
    let tontine = tontines[index];

    document.getElementById("nomtontine").value = tontine.nomtontine;
    document.getElementById("jour").value = tontine.jour;
    document.getElementById("mois").value = tontine.mois;
    document.getElementById("annee").value = tontine.annee;
    document.getElementById("duree").value = tontine.duree;
    document.getElementById("montant").value = tontine.montant;
    document.getElementById("devise").value = tontine.devise;

    membres = tontine.membres || [];
    afficherMembres();

    bouton.textContent = "Enregistrer les modifications";
    formulaire.style.display = "block";
    indexModification = index;
}
window.modifierTontine = modifierTontine;

// SUPPRIMER

function supprimerTontine(idTontine) {

    if (confirm("Voulez-vous vraiment supprimer cette tontine ?")) {
        let index = tontines.findIndex(t => t.id === idTontine);
        if (index !== -1) {
            tontines.splice(index, 1);
            localStorage.setItem("tontines", JSON.stringify(tontines));
            afficherTontines();
        }
    }
}
window.supprimerTontine = supprimerTontine;

// NOTIFICATIONS

let createurActuel = JSON.parse(localStorage.getItem("utilisateur")).nomu;

function envoyerInvitation(nomsMembres, nomTontine, createur) {
    let utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];

    utilisateurs.forEach(user => {
        // vu que nomsMembres a des objets , on vérifie si l'un d'eux a le nom de l'utilisateur
        let estMembre = nomsMembres.some(function (m) { return m.nom === user.nomu; });
        // On envoie pas l'invitation au créateur lui-même
        if (estMembre && user.nomu !== createur) {
            if (!user.notifications) {
                user.notifications = [];
            }
            user.notifications.push({
                tontine: nomTontine,
                createur: createur,
                statut: "en_attente",
            });
        }
    });
    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
}
