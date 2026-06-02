require("dotenv").config();

const cleApi = process.env.NEWS_API_KEY;

console.log("Cle charge : ", cleApi);

async function chercherNews() {
    const url = `https://newsapi.org/v2/everything?q=intelligence artificielle&language=fr&sortBy=publishedAt&apiKey=${cleApi}`;
    
    const response = await fetch(url);
    const donnees  = await response.json();

    const articles = donnees.articles;

    console.log(`📰 ${articles.length} articles trouvés :\n`);
    articles.forEach((article, i) => {
    console.log(`${i + 1}. ${article.title}`);
    });

}

chercherNews();