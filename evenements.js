// FORMULAIRE : AFFICHER / CACHER CREATION

let btnNouvelEvenement = document.getElementById("nouvelEvenement");
let formulaireEvenement = document.getElementById("formulaireEvenement");

if (btnNouvelEvenement && formulaireEvenement) {
    btnNouvelEvenement.addEventListener("click", function () {
        if (formulaireEvenement.style.display === "none" || formulaireEvenement.style.display === "") {
            formulaireEvenement.style.display = "block";
        } else {
            formulaireEvenement.style.display = "none";
        }
    });
}

// INITIALISATION DES DONNÉES DE LOCALSTORAGE

let evenements = JSON.parse(localStorage.getItem("evenements")) || [];
let utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];
let utilisateurConnecte = JSON.parse(localStorage.getItem("utilisateur"));

let conteneurEvenements = document.querySelector(".cartes-evenements");

// AFFICHAGE DES ÉVÉNEMENTS & CAISSES PRIVÉES

function afficherEvenements() {
    if (!conteneurEvenements) return;

    let contenu = "";

    if (!utilisateurConnecte) {
        conteneurEvenements.innerHTML = "<h3>Veuillez vous connecter.</h3>";
        return;
    }

    // On affiche si le créateur correspond, ou si l'utilisateur est invité
    let cagnottesVisibles = evenements.filter(function (evenement) {
        if (evenement.createur === utilisateurConnecte.nomu) {
            return true;
        }
        if (!evenement.invites) evenement.invites = [];
        return evenement.invites.includes(utilisateurConnecte.nomu);
    });

    if (cagnottesVisibles.length === 0) {
        contenu = `<h3>Aucun projet ou cagnotte disponible.</h3>`;
    } else {
        cagnottesVisibles.forEach(function (evenement) {
            let objectif = Number(evenement.montantCible);
            let actuel = Number(evenement.cagnotteActuelle);
            let pourcentage = Math.min((actuel / objectif) * 100, 100).toFixed(0);

            let zoneFormulaireActionHTML = "";
            let zoneBoutonsControleHTML = "";

            // RENDU CAS A : CAISSE INDIVIDUELLE PRIVÉE

            if (evenement.isPrivat === true) {
                // Section d'épargne (Alimenter sa tirelire)
                zoneFormulaireActionHTML = `
                            <div class="zone-don">
                                <input type="number" id="montantDon-${evenement.id}" placeholder="Montant à ajouter">
                                <button id="epargner" onclick="alimenterCaissePrivée(${evenement.id})">🔒 Épargner</button>
                            </div>`;

                // Boutons de contrôle pour récupérer et supprimer
                let boutonCasserHTML = "";
                if (actuel > 0) {
                    boutonCasserHTML = `
                                <button id="casser" onclick="casserCaissePrivée(${evenement.id})">💰 Casser la tirelire (${actuel} ${evenement.devise}) </button>`;
                }
                zoneBoutonsControleHTML = `
                            <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                                ${boutonCasserHTML}
                                <button class="supprimercaisse" onclick="supprimerCagnotte(${evenement.id})">🗑️ Supprimer</button>
                            </div>`;
            }

            // RENDU CAS B : CAGNOTTE COMMUNE CLASSIQUE

            else {
                if (actuel >= objectif) {
                    zoneFormulaireActionHTML = `
                                <div class="zone-don" style="color: #27ae60; font-weight: bold; margin-top: 10px;">
                                    🎉 Objectif atteint ! Cagnotte clôturée.
                                </div>`;
                } else {
                    zoneFormulaireActionHTML = `
                                <div class="zone-don">
                                    <input type="number" id="montantDon-${evenement.id}" placeholder="Montant">
                                    <button class="btn-donner" onclick="faireUnDon(${evenement.id})">Faire un don</button>
                                </div>`;
                }
                let boutonsCreateurHTML = "";
                //seulement pour le créateur 
                if (evenement.createur === utilisateurConnecte.nomu) {
                    let boutonRetirerHTML = "";
                    if (actuel > 0) {
                        boutonRetirerHTML = `
                                    <button id="retirer" onclick="retirerFondsCagnotte(${evenement.id})">
                                        💰 Retirer (${actuel} ${evenement.devise})
                                    </button>`;
                    }
                    boutonsCreateurHTML = `
                                ${boutonRetirerHTML}
                                <button class="supprimer" onclick="supprimerCagnotte(${evenement.id})" >🗑️ Supprimer</button>`;
                }

                let boutonInviterHTML = `
                            <button id="inviter" onclick="inviterQuelquUn(${evenement.id})">➕ Inviter</button>`;

                zoneBoutonsControleHTML = `
                            <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                                ${boutonInviterHTML}
                                ${boutonsCreateurHTML}
                            </div>`;
            }

            //La carte (comment elle se compose)
            let bordure;

            if (evenement.isPrivat) {
                bordure = "1px solid  #ffd166";
                fond = "#ffd166";
                ecriture = "#0a1f44";
            } else {
                bordure = "1px solid #0a1f44";
                fond = "#0a1f44";
                ecriture = "#FFFFFF";
            }
            contenu += `
                        <section class="carte-event" style=" border: ${bordure};background-color:${fond}; color:${ecriture}; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                            <h2>${evenement.isPrivat ? '🔒 (Ma Caisse) ' : '🎉 '} ${evenement.titre}</h2>
                            <p><b>Type :</b> ${evenement.isPrivat ? 'Épargne Privée Personnelle' : evenement.type}</p>
                            <p><b>Organisé par :</b> ${evenement.createur} ${evenement.isPrivat ? '(Moi-même)' : ''}</p>
                            <p><b>Description :</b> ${evenement.description}</p>
                            <p><b>Date cible :</b> ${evenement.jour} ${evenement.mois} ${evenement.annee}</p>
                            
                            <div class="zone-progression-don" style="margin: 15px 0;">
                                <p>Progression : <b>${actuel} / ${objectif} ${evenement.devise}</b> (${pourcentage}%)</p>
                                <progress value="${actuel}" max="${objectif}"></progress>
                            </div>

                            ${zoneFormulaireActionHTML}
                            ${zoneBoutonsControleHTML}
                        </section>
                    `;
        });
    }
    conteneurEvenements.innerHTML = contenu;
}

document.addEventListener("DOMContentLoaded", function () {
    afficherEvenements();
});

// FONCTION : ALIMENTER SA CAISSE PRIVÉE

function alimenterCaissePrivée(idEvenement) {
    let evenement = evenements.find(e => e.id === idEvenement);
    let userDonateur = utilisateurs.find(u => u.nomu === utilisateurConnecte.nomu);
    let inputDon = document.getElementById(`montantDon-${idEvenement}`);

    if (!inputDon || !evenement || !userDonateur) return;
    let montantEpargne = Number(inputDon.value);

    if (isNaN(montantEpargne) || montantEpargne <= 0) {
        alert("Veuillez entrer un montant valide à épargner.");
        return;
    }

    // Débit de son propre porte-monnaie
    if (evenement.devise === "USD") {
        if ((userDonateur.soldeUSD || 0) < montantEpargne) {
            alert(`Solde USD insuffisant dans votre porte-monnaie !`);
            return;
        }
        userDonateur.soldeUSD -= montantEpargne;
    } else {
        if ((userDonateur.soldeCDF || 0) < montantEpargne) {
            alert(`Solde CDF insuffisant dans votre porte-monnaie !`);
            return;
        }
        userDonateur.soldeCDF -= montantEpargne;
    }

    // Dépôt dans le coffre de la caisse personnelle
    evenement.cagnotteActuelle = Number(evenement.cagnotteActuelle) + montantEpargne;

    // historique permanent
    let aujourdHui = new Date();
    let dateFormatee = aujourdHui.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!userDonateur.notifications) userDonateur.notifications = [];
    userDonateur.notifications.push({
        texte: `Le ${dateFormatee}, vous avez placé ${montantEpargne} ${evenement.devise} de côté dans votre caisse privée "${evenement.titre}".`,
        type: "historique_permanent"
    });

    utilisateurConnecte.soldeUSD = userDonateur.soldeUSD;
    utilisateurConnecte.soldeCDF = userDonateur.soldeCDF;
    utilisateurConnecte.notifications = userDonateur.notifications;

    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
    localStorage.setItem("utilisateur", JSON.stringify(utilisateurConnecte));
    localStorage.setItem("evenements", JSON.stringify(evenements));

    alert(`Félicitations, ${montantEpargne} ${evenement.devise} mis de côté !`);
    inputDon.value = "";
    afficherEvenements();
}
window.alimenterCaissePrivée = alimenterCaissePrivée;

// FONCTION : CASSER / RÉCUPÉRER L'ARGENT DE LA CAISSE

function casserCaissePrivée(idEvenement) {
    let evenement = evenements.find(e => e.id === idEvenement);
    let userActuel = utilisateurs.find(u => u.nomu === utilisateurConnecte.nomu);

    if (!evenement || !userActuel || evenement.createur !== utilisateurConnecte.nomu) return;

    let montantRecupere = Number(evenement.cagnotteActuelle);
    if (montantRecupere <= 0) return;

    // Restitution totale sur le porte-monnaie
    if (evenement.devise === "USD") {
        userActuel.soldeUSD = (userActuel.soldeUSD || 0) + montantRecupere;
    } else {
        userActuel.soldeCDF = (userActuel.soldeCDF || 0) + montantRecupere;
    }

    evenement.cagnotteActuelle = 0; // Remise à zéro de la tirelire

    let aujourdHui = new Date();
    let dateFormatee = aujourdHui.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!userActuel.notifications) userActuel.notifications = [];
    userActuel.notifications.push({
        texte: `Le ${dateFormatee}, vous avez récupéré la somme de ${montantRecupere} ${evenement.devise} de votre caisse privée "${evenement.titre}".`,
        type: "historique_permanent"
    });

    utilisateurConnecte.soldeUSD = userActuel.soldeUSD;
    utilisateurConnecte.soldeCDF = userActuel.soldeCDF;
    utilisateurConnecte.notifications = userActuel.notifications;

    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
    localStorage.setItem("utilisateur", JSON.stringify(utilisateurConnecte));
    localStorage.setItem("evenements", JSON.stringify(evenements));

    alert(`Somme de ${montantRecupere} ${evenement.devise} reversée avec succès sur votre porte-monnaie !`);
    afficherEvenements();
}
window.casserCaissePrivée = casserCaissePrivée;

// ACTION : ENREGISTRER UN NOUVEL ÉVÉNEMENT OU UNE CAISSE PRIVÉE

let btnCreerEvenementNouveau = document.getElementById("btn-creer-event");

if (btnCreerEvenementNouveau) {
    btnCreerEvenementNouveau.addEventListener("click", function () {
        let titre = document.getElementById("titreEvenement").value;
        let type = document.getElementById("typeEvent").value;
        let montantCible = Number(document.getElementById("montantCible").value);
        let devise = document.getElementById("deviseEvent").value;
        let description = document.getElementById("descriptionEvent").value;
        let dateLimiteInput = document.getElementById("dateLimite").value;

        if (titre === "" || type === "" || isNaN(montantCible) || montantCible <= 0 || devise === "" || dateLimiteInput === "") {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        let jour = "", mois = "", annee = "";
        if (dateLimiteInput) {
            let partiesDate = dateLimiteInput.split("-");
            annee = partiesDate[0];
            let nomsMois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
            mois = nomsMois[parseInt(partiesDate[1], 10) - 1];
            jour = partiesDate[2];
        }

        // Déterminer s'il s'agit d'une caisse privée ou d'une cagnotte de groupe
        let evaluationPrivat = (type === "Caisse_Privat");

        let nouvelEvenement = {
            id: Date.now(),
            titre: titre,
            type: type,
            jour: jour,
            mois: mois,
            annee: annee,
            montantCible: montantCible,
            cagnotteActuelle: 0,
            devise: devise,
            description: description,
            createur: utilisateurConnecte.nomu,
            isPrivat: evaluationPrivat,
            invites: [],
            invitationsEnAttente: []
        };

        evenements.push(nouvelEvenement);
        localStorage.setItem("evenements", JSON.stringify(evenements));

        alert(evaluationPrivat ? `Votre caisse privée "${titre}" est configurée !` : `La cagnotte "${titre}" a été lancée !`);

        // on remet les valeurs à l'état initial
        document.getElementById("titreEvenement").value = "";
        document.getElementById("montantCible").value = "";
        document.getElementById("descriptionEvent").value = "";
        document.getElementById("dateLimite").value = "";
        if (formulaireEvenement) formulaireEvenement.style.display = "none";

        afficherEvenements();
    });
}


// FONCTION : SUPPRIMER LA CAGNOTTE

function supprimerCagnotte(idEvenement) {
    let index = evenements.findIndex(e => e.id === idEvenement);
    if (index !== -1) {
        if (evenements[index].createur !== utilisateurConnecte.nomu) return;
        if (confirm("Supprimer définitivement ce projet ?")) {
            evenements.splice(index, 1);
            localStorage.setItem("evenements", JSON.stringify(evenements));
            afficherEvenements();
        }
    }
}
window.supprimerCagnotte = supprimerCagnotte;

// FONCTION : FAIRE UN DON (PUBLIC)

function faireUnDon(idEvenement) {
    let evenement = evenements.find(e => e.id === idEvenement);
    let userDonateur = utilisateurs.find(u => u.nomu === staticConnecteName());

    function staticConnecteName() { return utilisateurConnecte.nomu; }
    let inputDon = document.getElementById(`montantDon-${idEvenement}`);

    if (!inputDon || !evenement || evenement.isPrivat) return;
    let montantDon = Number(inputDon.value);

    if (isNaN(montantDon) || montantDon <= 0) {
        alert("Veuillez entrer un montant de don valide.");
        return;
    }

    if (!userDonateur) {
        alert("Utilisateur non trouvé.");
        return;
    }

    if (evenement.devise === "USD") {
        if ((userDonateur.soldeUSD || 0) < montantDon) {
            alert(`Solde USD insuffisant !`);
            return;
        }
        userDonateur.soldeUSD -= montantDon;
    } else {
        if ((userDonateur.soldeCDF || 0) < montantDon) {
            alert(`Solde CDF insuffisant !`);
            return;
        }
        userDonateur.soldeCDF -= montantDon;
    }

    evenement.cagnotteActuelle = Number(evenement.cagnotteActuelle) + montantDon;

    let aujourdHui = new Date();
    let dateFormatee = aujourdHui.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!userDonateur.notifications) userDonateur.notifications = [];
    userDonateur.notifications.push({
        texte: `Le ${dateFormatee}, vous avez fait un don de ${montantDon} ${evenement.devise} en faveur de l'événement "${evenement.titre}".`,
        type: "historique_permanent"
    });

    utilisateurConnecte.soldeUSD = userDonateur.soldeUSD;
    utilisateurConnecte.soldeCDF = userDonateur.soldeCDF;
    utilisateurConnecte.notifications = userDonateur.notifications;

    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
    localStorage.setItem("utilisateur", JSON.stringify(utilisateurConnecte));
    localStorage.setItem("evenements", JSON.stringify(evenements));

    alert(`Merci pour votre don de ${montantDon} ${evenement.devise} !`);
    inputDon.value = "";
    afficherEvenements();
}
window.faireUnDon = faireUnDon;

// FONCTION : INVITER UN MEMBRE 

function inviterQuelquUn(idEvenement) {
    let evenement = evenements.find(e => e.id === idEvenement);
    if (!evenement || evenement.isPrivat) return; // sécurité : pas d'invitation sur les caisses privées

    let nomAmi = prompt("Nom d'utilisateur à inviter :");
    if (!nomAmi) return;
    nomAmi = nomAmi.trim();

    let amiExiste = utilisateurs.find(u => u.nomu === nomAmi || u.nom === nomAmi || u.username === nomAmi);
    if (!amiExiste) {
        alert("Utilisateur introuvable.");
        return;
    }

    let monNom = utilisateurConnecte.nomu || utilisateurConnecte.nom || utilisateurConnecte.username || "Un utilisateur";

    if (evenement.createur === amiExiste.nomu || (evenement.invites && evenement.invites.includes(amiExiste.nomu))) {
        alert("Cet utilisateur participe déjà ou est le créateur.");
        return;
    }

    if (!evenement.invitationsEnAttente) evenement.invitationsEnAttente = [];
    if (evenement.invitationsEnAttente.includes(amiExiste.nomu)) {
        alert("Invitation déjà en cours.");
        return;
    }

    evenement.invitationsEnAttente.push(amiExiste.nomu);
    //ça lui envoie une notification
    if (!amiExiste.notifications) amiExiste.notifications = [];
    amiExiste.notifications.push({
        idInvitation: Date.now(),
        idCagnotte: evenement.id,
        texte: `${monNom} vous invite à rejoindre sa cagnotte : "${evenement.titre}".`,
        type: "invitation_cagnotte",
        statut: "en_attente",
        expediteur: monNom
    });

    localStorage.setItem("evenements", JSON.stringify(evenements));
    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));

    alert(`Invitation envoyée avec succès à ${amiExiste.nomu} !`);
}
window.inviterQuelquUn = inviterQuelquUn;


// FONCTION : RETRAIT DES FONDS PAR LE CRÉATEUR (PUBLIC)

function retirerFondsCagnotte(idEvenement) {
    let evenement = evenements.find(e => e.id === idEvenement);
    let createurUser = utilisateurs.find(u => u.nomu === utilisateurConnecte.nomu);

    if (!evenement || !createurUser || evenement.createur !== utilisateurConnecte.nomu || evenement.isPrivat) return;

    let montantARetirer = Number(evenement.cagnotteActuelle);
    if (montantARetirer <= 0) return;

    if (evenement.devise === "USD") {
        createurUser.soldeUSD = (createurUser.soldeUSD || 0) + montantARetirer;
    } else {
        createurUser.soldeCDF = (createurUser.soldeCDF || 0) + montantARetirer;
    }

    evenement.cagnotteActuelle = 0;

    let aujourdHui = new Date();
    let dateFormatee = aujourdHui.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!createurUser.notifications) createurUser.notifications = [];
    createurUser.notifications.push({
        texte: `Le ${dateFormatee}, vous avez retiré ${montantARetirer} ${evenement.devise} de votre cagnotte "${evenement.titre}".`,
        type: "historique_permanent"
    });

    utilisateurConnecte.soldeUSD = createurUser.soldeUSD;
    utilisateurConnecte.soldeCDF = createurUser.soldeCDF;
    utilisateurConnecte.notifications = createurUser.notifications;

    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
    localStorage.setItem("utilisateur", JSON.stringify(utilisateurConnecte));
    localStorage.setItem("evenements", JSON.stringify(evenements));

    alert(`Fonds récupérés dans votre porte-monnaie !`);
    afficherEvenements();
}
window.retirerFondsCagnotte = retirerFondsCagnotte;