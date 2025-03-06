import { gamesData } from "./AllGamesData.js";

function getAllGamesData(random) {
    const allGamesData = gamesData.map(it => {
        return {
            id: it.id,
            name: it.name,
            description: it.description,
            mainImage: { url: it.mainImage },
            multimedia: it.multimedia.map(image => ({ url: image })),
            tags: getListOfTags(it.tags),
            price: randomPrice(random),
            requirements: it.requirements,
            relatedGames: [],
            developer: getDeveloper(it.developer),
            released: getDate(it.released),
            reviews: [],
            esrb: getESRB(it.esrb),
            website: it.website
        };
    });

    return allGamesData.map(game => {
        const relatedGames = getRandomList(random, allGamesData, 10).filter(
            relatedGame => relatedGame !== game
        );
        
        game.relatedGames = relatedGames;
        return game;
    });
}

export default getAllGamesData;