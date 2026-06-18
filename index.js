require("dotenv").config();
const fs = require("fs");
const nodemailer = require("nodemailer");

const cleApi = process.env.NEWS_API_KEY;
const cleGemini = process.env.GEMINI_API_KEY;

async function envoyerEmail(texte){

    console.log("➡️  Entrée dans envoyerEmail");
    console.log("MAIL_USER présent ?", process.env.MAIL_USER ? "oui" : "NON ❌");
    console.log("MAIL_PASS présent ?", process.env.MAIL_PASS ? "oui" : "NON ❌");
    console.log("MAIL_TO présent ?", process.env.MAIL_TO ? "oui" : "NON ❌");
    
    const transporteur = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    await transporteur.sendMail({
        from: process.env.MAIL_USER,
        to: process.env.MAIL_TO,
        subject: "Briefing IA du jour",
        text: texte,

    });

    console.log("📧Briefing envoyé par e-mail !");
}

async function chercherNews() {
    const url = `https://newsapi.org/v2/everything?q=intelligence artificielle&language=fr&sortBy=publishedAt&apiKey=${cleApi}`;
    
    const response = await fetch(url);
    const donnees  = await response.json();

    const tousLesArticles = donnees.articles;

    // dédoublonnage par titre
    const titres = tousLesArticles.map((article) => article.title);
    const articlesUniques = tousLesArticles.filter((article,i) =>{
        return titres.indexOf(article.title) === i;
    });

    // les 10 plus récents et uniques
    const articles = articlesUniques.slice(0,10);
    const listeTitres = articles.map((article) => article.title).join("\n");

      // === appeler l'IA pour analyser ===

    console.log("\n🤖 Analyse de l'IA en cours...\n");
    const resume = await resumerAvecIA(listeTitres);


    // construire le briefing texte
    const date = new Date().toISOString().slice(0,10);
    let texte = `BRIEFING IA - ${date}\n\n`;
    texte += `═══ ANALYSE DU JOUR ═══\n\n`;
    texte += `${resume}\n\n`;
    texte += `═══ ARTICLES ═══\n\n`;

    articles.forEach((article, i) => {
    const source = article.source.name;
    const dateArticle = article.publishedAt.slice(0,10);

    texte += `${i + 1}. ${article.title}\n`;
    texte += `  ${source}.  •  ${dateArticle}\n`;
    texte += `  ${article.url}\n\n`; 

    });

    // sauvegarder le briefing
    fs.writeFileSync(`briefing-${date}.txt`,texte);
    console.log(`\n Briefing sauvegarde dans briefing-${date}.txt`);

    // envoyer par email
    await envoyerEmail(texte);

   
    console.log("═══════════════════════════════");
    console.log(resume);
    console.log("═══════════════════════════════");
}

async function resumerAvecIA(listeTitres) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${cleGemini}`;
  const consigne = `Voici des titres d'articles d'actualité. Identifie les 5 sujets les plus importants liés à l'intelligence artificielle, ignore le hors-sujet, et résume le paysage du jour en quelques phrases claires en français.\n\nTitres :\n${listeTitres}`;

  const maxTentatives = 4;

  for (let tentative = 1; tentative <= maxTentatives; tentative++) {
    const reponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: consigne }] }],
      }),
    });

    const donnees = await reponse.json();

    // l'API a bien renvoyé un résumé ?
    if (donnees.candidates) {
      return donnees.candidates[0].content.parts[0].text;
    }

    // sinon : on log et on réessaie (sauf si c'était la dernière tentative)
    console.log(`⚠️  Tentative ${tentative}/${maxTentatives} échouée (API occupée). Nouvel essai...`);

    if (tentative < maxTentatives) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  throw new Error("L'IA n'a pas répondu après plusieurs tentatives.");
}
chercherNews();
