import { SteamSystem } from '../model/SteamSystem.js';
import { CardInfo, DraftPurchase, DraftReview } from '../model/Drafts.js';
import { getAllGamesData, allDevelopers, allTags, allUsers, allReviewText } from './data.js';
import { getRandomList, getRandomBoolean } from './helpers.js';


function initSteamSystem() {
    const random = {
        random: function() {
            return Math.random();
        }
    };

    const games = getAllGamesData(random).sort((a, b) => {
        return b.releaseDate.getTime() - a.releaseDate.getTime();
    });

    const steam = new SteamSystem(
        games,
        allDevelopers,
        allTags,
        []
    );

    allUsers.forEach(user => steam.addNewUser(user));
    
    steam.users.forEach(user => {
        getRandomList(random, steam.games, 40).forEach(game => {
            steam.purchaseGame(
                user.id, 
                new DraftPurchase(
                    game.id, 
                    new CardInfo("a", 1234, new Date(), 123)
                )
            );
        });
        
        getRandomList(random, steam.users, 5).forEach(friend => {
            if (user.id !== friend.id) {
                steam.addOrRemoveFriend(user.id, friend.id);
            }
        });
        
        getRandomList(random, user.games, 30).forEach(game => {
            steam.addReview(
                user.id, 
                new DraftReview(
                    game.id, 
                    getRandomBoolean(random), 
                    getRandomList(random, allReviewText, 1)[0]
                )
            );
        });
    });

    return steam;
}

export { initSteamSystem };