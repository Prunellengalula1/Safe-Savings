// INITIALISATION ET SÉCURITÉ DE SESSION

let utilisateurConnecte = JSON.parse(localStorage.getItem("utilisateur"));
let utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];

// Sécurité : redirection si aucun utilisateur n'est connecté
if (!utilisateurConnecte) {
    window.location.href = "connexion.html";
}

// Trouver la fiche de l'utilisateur connecté dans la grande liste
let userActuel = utilisateurs.find(u => u.nomu === utilisateurConnecte.nomu);

let btnChangePassword = document.getElementById("btnChangePassword");
let btnDeleteAccount = document.getElementById("btnDeleteAccount");

// 2. MODIFICATION DU MOT DE PASSE

if (btnChangePassword) {
    btnChangePassword.addEventListener("click", () => {
        let ancienMdp = prompt("Entrez votre mot de passe actuel :");
        if (!ancienMdp) return;


        let mdpCorrect = userActuel.mdp;

        if (ancienMdp !== mdpCorrect) {
            alert("Mot de passe actuel incorrect !");
            return;
        }

        let nouveauMdp = prompt("Entrez votre NOUVEAU mot de passe :");
        if (!nouveauMdp || nouveauMdp.trim() === "") {
            alert("Le mot de passe ne peut pas être vide.");
            return;
        }

        let confirmation = prompt("Confirmez votre nouveau mot de passe :");
        if (nouveauMdp !== confirmation) {
            alert("Les mots de passe ne correspondent pas. Modification annulée.");
            return;
        }

        // 1. Mise à jour dans le tableau global 
        if (userActuel.mdp !== undefined) userActuel.mdp = nouveauMdp;
        localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));

        // 2. Mise à jour de la session active
        if (utilisateurConnecte.mdp !== undefined) utilisateurConnecte.mdp = nouveauMdp;
        localStorage.setItem("utilisateur", JSON.stringify(utilisateurConnecte));

        alert("Votre mot de passe a été modifié avec succès ! 🎉");
    });
}

// 3. SUPPRESSION DU COMPTE

if (btnDeleteAccount) {
    btnDeleteAccount.addEventListener("click", () => {
        let confirmationPremiere = confirm("⚠️ ATTENTION : Voulez-vous vraiment supprimer définitivement votre compte Safe Savings ? Toutes vos données et vos soldes seront perdus.");

        if (confirmationPremiere) {
            let confirmationNom = prompt(`Pour confirmer, saisissez votre nom d'utilisateur exact (${utilisateurConnecte.nomu}) :`);

            if (confirmationNom === utilisateurConnecte.nomu) {
                // Supprimer l'utilisateur de la liste globale
                utilisateurs = utilisateurs.filter(u => u.nomu !== utilisateurConnecte.nomu);
                localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));

                // Détruire la session et déconnecter
                localStorage.removeItem("utilisateur");

                alert("Votre compte a bien été supprimé.");
                window.location.href = "connexion.html";
            } else {
                alert("Nom d'utilisateur incorrect. Action annulée.");
            }
        }
    });
}