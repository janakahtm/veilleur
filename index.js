require("dotenv").config();
const fs = require("fs");

const cleApi = process.env.NEWS_API_KEY;
const cleGemini = process.env.GEMINI_API_KEY;

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

    // construire le briefing texte
    const date = new Date().toISOString().slice(0,10);
    let texte = `BRIEFING IA - ${date}\n\n`;

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

     // === appeler l'IA pour analyser ===
    const listeTitres = articles.map((article) => article.title).join("\n");
    console.log("\n🤖 Analyse de l'IA en cours...\n");

    const resume = await resumerAvecIA(listeTitres);

    console.log("═══════════════════════════════");
    console.log(resume);
    console.log("═══════════════════════════════");
}

async function resumerAvecIA(listeTitres){
    const url =`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${cleGemini}`;
    const consigne = `Voici des titres d'articles d'actualité. Identifie les 5 sujets les plus importants liés à l'intelligence artificielle, ignore le hors-sujet, et résume le paysage du jour en quelques phrases claires en français.\n\nTitres :\n${listeTitres}`;

    const reponse = await fetch(url, {
        method : "POST",
        headers: { "Content-Type" :"application/json"},
        body: JSON.stringify({
            contents:[{ parts :[{ text : consigne }] }]
        }),
        
    });

    const donnees = await reponse.json();
  
    const resume = donnees.candidates[0].content.parts[0].text;

    return resume;

}
chercherNews();
