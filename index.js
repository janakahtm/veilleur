require("dotenv").config();

const cleApi = process.env.NEWS_API_KEY;

async function chercherNews() {
    const url = `https://newsapi.org/v2/everything?q=intelligence artificielle&language=fr&sortBy=publishedAt&apiKey=${cleApi}`;
    
    const response = await fetch(url);
    const donnees  = await response.json();

    const articles = donnees.articles;
    const articlesRecents = articles.slice(0,10);

    console.log(`📰 ${articlesRecents.length} articles trouvés :\n`);
    articlesRecents.forEach((article, i) => {
    const source = article.source.name;
    const date = article.publishedAt.slice(0,10);

    console.log(`${i + 1}. ${article.title}`);
    console.log(` 📍 ${source}.  •  📅 ${date}`);
    console.log(`  🔗 ${article.url}\n`);
    });

}

chercherNews();
