require("dotenv").config();
const fs = require("fs");

const cleApi = process.env.NEWS_API_KEY;

async function chercherNews() {
    const url = `https://newsapi.org/v2/everything?q=intelligence artificielle&language=fr&sortBy=publishedAt&apiKey=${cleApi}`;
    
    const response = await fetch(url);
    const donnees  = await response.json();

    const tousLesArticles = donnees.articles;

    const titres = tousLesArticles.map((article) => article.title);

    const articlesUniques = tousLesArticles.filter((article,i) =>{
        return titres.indexOf(article.title) === i;
    });

    const articles = articlesUniques.slice(0,10);


    const articlesRecents = articles.slice(0,10);

    // console.log(`📰 ${articlesRecents.length} articles trouvés :\n`);

    const date = new Date().toISOString().slice(0,10);
    let texte = `BRIEFING IA - ${date}\n\n`;

    articlesRecents.forEach((article, i) => {
    const source = article.source.name;
    const dateArticle = article.publishedAt.slice(0,10);


    texte += `${i + 1}. ${article.title}\n`;
    texte += `  ${source}.  •  ${dateArticle}\n`;
    texte += `  ${article.url}\n\n`;
    });
    
    fs.writeFileSync(`briefing-${date}.txt`,texte);
    console.log(`\n Briefing sauvegarde dans briefing-${date}.txt`);
}

chercherNews();
