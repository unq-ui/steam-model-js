import getAllGamesData from "./src/data/AllGames.js";
import allDevelopers from "./src/data/AllDevelopers.js";
import allTags from "./src/data/AllTags.js";
import allUsers from "./src/data/AllUsers.js";
import allReviewText from "./src/data/AllReviewTexts.js";

import { getRandomList, getRandomBoolean } from "./src/data/helpers.js";

import IdGenerator from "./src/model/IdGenerator.js";
import User from "./src/model/User.js";
import Review from "./src/model/Review.js";
import PageInfo from "./src/model/PageInfo.js";
import { DraftUser, DraftPurchase, CardInfo, DraftReview } from "./src/model/Drafts.js";

/**
 * Get a paginated list of elements.
 *
 * @param {Array} list The list of elements.
 * @param {number} page The page number.
 * @return {PageInfo} A pagination object for the elements.
 * @throws {PageException} If the page number is less than 1.
 */
function getPage(list, page) {
  if (page < 1) throw new PageException("Page must be 1 or more");

  // Chunk the list into groups of 10
  const chunkedList = [];
  for (let i = 0; i < list.length; i += 10) {
    chunkedList.push(list.slice(i, i + 10));
  }

  return new PageInfo(
    page,
    chunkedList[page - 1] || [],
    list.length,
    chunkedList.length
  );
}

class SteamSystem {
  /**
   * @param {Array<Game>} games
   * @param {Array<Developer>} developers
   * @param {Array<Tag>} tags
   * @param {Array<User>} users
   */
  constructor(games, developers, tags, users) {
    this.games = games;
    this.developers = developers;
    this.tags = tags;
    this.users = users;
    this.idGenerator = new IdGenerator();
  }

  /**
   * Add a new user to the system.
   *
   * @param {DraftUser} user The user to add.
   * @return {User} The newly created user.
   * @throws {UserException} If the email address is already in use.
   */
  addNewUser(user) {
    for (const existingUser of this.users) {
      if (existingUser.email === user.email)
        throw new UserException("Email is taken");
    }

    const newUser = new User(
      this.idGenerator.nextUserId(),
      user.email,
      user.password,
      user.name,
      user.image,
      user.backgroundImage,
      [],
      []
    );

    this.users.push(newUser);
    return newUser;
  }

  /**
   * Get a tag by its ID.
   *
   * @param {string} id The ID of the tag.
   * @return {Tag} The tag with the given ID.
   * @throws {NotFoundTag} If the tag with the given ID does not exist.
   */
  getTag(id) {
    const tag = this.tags.find((t) => t.id === id);
    if (!tag) throw new NotFoundTag();
    return tag;
  }

  /**
   * Get a user by its ID.
   *
   * @param {string} id The ID of the user.
   * @return {User} The user with the given ID.
   * @throws {NotFoundUser} If the user with the given ID does not exist.
   */
  getUser(id) {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundUser();
    return user;
  }

  /**
   * Get a game by its ID.
   *
   * @param {string} id The ID of the game.
   * @return {Game} The game with the given ID.
   * @throws {NotFoundGame} If the game with the given ID does not exist.
   */
  getGame(id) {
    const game = this.games.find((g) => g.id === id);
    if (!game) throw new NotFoundGame();
    return game;
  }

  /**
   * Get a developer by its ID.
   *
   * @param {string} id The ID of the developer.
   * @return {Developer} The developer with the given ID.
   * @throws {NotFoundDeveloper} If the developer with the given ID does not exist.
   */
  getDeveloper(id) {
    const developer = this.developers.find((d) => d.id === id);
    if (!developer) throw new NotFoundDeveloper();
    return developer;
  }

  /**
   * Get the reviews written by the user with the given ID.
   *
   * @param {string} userId The ID of the user.
   * @return {Array<Review>} The list of reviews written by the user.
   * @throws {NotFoundUser} If the user with the given ID does not exist.
   */
  getUserReviews(userId) {
    const user = this.getUser(userId);
    return this.games
      .flatMap((game) => game.reviews)
      .filter((review) => review.user === user);
  }

  /**
   * Get a list of recommended games.
   *
   * The recommended games are the games that have the most reviews that are marked as recommended.
   *
   * @return {Array<Game>} A list of recommended games.
   */
  getRecommendedGames() {
    return [...this.games]
      .sort((a, b) => {
        const aRecommended = a.reviews.filter(
          (review) => review.isRecommended
        ).length;
        const bRecommended = b.reviews.filter(
          (review) => review.isRecommended
        ).length;
        return bRecommended - aRecommended;
      })
      .slice(0, 10);
  }

  /**
   * Get a list of games.
   *
   * @param {number} page The page number.
   * @return {PageInfo<Game>} A list of games.
   * @throws {PageException} If the page number is less than 1.
   */
  getGames(page = 1) {
    return getPage(this.games, page);
  }

  /**
   * Get a list of games by tag.
   *
   * @param {string} tagId The ID of the tag.
   * @param {number} page The page number.
   * @return {PageInfo<Game>} A list of games.
   * @throws {NotFoundTag} If the tag with the given ID does not exist.
   * @throws {PageException} If the page number is less than 1.
   */
  getGamesByTag(tagId, page = 1) {
    const tag = this.getTag(tagId);
    const filteredGames = this.games.filter((game) => game.tags.includes(tag));
    return getPage(filteredGames, page);
  }

  /**
   * Get a list of games by developer.
   *
   * @param {string} developerId The ID of the developer.
   * @param {number} page The page number.
   * @return {PageInfo<Game>} A list of games.
   * @throws {NotFoundDeveloper} If the developer with the given ID does not exist.
   * @throws {PageException} If the page number is less than 1.
   */
  getGamesByDeveloper(developerId, page = 1) {
    const developer = this.getDeveloper(developerId);
    const filteredGames = this.games.filter(
      (game) => game.developer === developer
    );
    return getPage(filteredGames, page);
  }

  /**
   * Search for games by name.
   *
   * @param {string} name The name of the game.
   * @param {number} page The page number.
   * @return {PageInfo<Game>} A list of games.
   * @throws {PageException} If the page number is less than 1.
   */
  searchGame(name, page = 1) {
    const filteredGames = this.games.filter((game) =>
      game.name.toLowerCase().includes(name.toLowerCase())
    );
    return getPage(filteredGames, page);
  }

  /**
   * Search for users by name.
   *
   * @param {string} name The name of the user.
   * @param {number} page The page number.
   * @return {PageInfo<User>} A list of users.
   * @throws {PageException} If the page number is less than 1.
   */
  searchUser(name, page = 1) {
    const filteredUsers = this.users.filter((user) =>
      user.name.toLowerCase().includes(name.toLowerCase())
    );
    return getPage(filteredUsers, page);
  }

  /**
   * Add a review for a game.
   *
   * @param {string} userId The ID of the user who is submitting the review.
   * @param {DraftReview} draftReview The draft review object.
   * @return {Game} The game that was reviewed.
   * @throws {NotFoundUser} If the user with the given ID does not exist.
   * @throws {NotFoundGame} If the game with the given ID does not exist.
   * @throws {ReviewException} If the user does not own the game or if the user has already submitted a review for the game.
   */
  addReview(userId, draftReview) {
    const user = this.getUser(userId);
    const game = this.getGame(draftReview.gameId);

    if (!user.games.includes(game)) {
      throw new ReviewException("You need to own the game to leave a review");
    }

    const existingReview = game.reviews.find((review) => review.user === user);
    if (existingReview) {
      throw new ReviewException(
        "You've already submitted a review for this game"
      );
    }

    game.reviews.push(
      new Review(
        this.idGenerator.nextReviewId(),
        user,
        game,
        draftReview.isRecommended,
        draftReview.text
      )
    );

    return game;
  }

  /**
   * Purchase a game.
   *
   * @param {string} userId The ID of the user who is purchasing the game.
   * @param {DraftPurchase} draftPurchase The draft purchase object.
   * @return {User} The user who purchased the game.
   * @throws {NotFoundUser} If the user with the given ID does not exist.
   * @throws {NotFoundGame} If the game with the given ID does not exist.
   * @throws {PurchaseException} If the user already owns the game.
   */
  purchaseGame(userId, draftPurchase) {
    const user = this.getUser(userId);
    const game = this.getGame(draftPurchase.gameId);

    if (user.games.includes(game)) {
      throw new PurchaseException("You already have the game");
    }

    user.games.push(game);
    return user;
  }

  /**
   * Add or remove a friend.
   *
   * @param {string} userId The ID of the user who is adding or removing the friend.
   * @param {string} friendId The ID of the friend.
   * @return {User} The user who added or removed the friend.
   * @throws {NotFoundUser} If the user or the friend with the given ID does not exist.
   * @throws {UserException} If the user is trying to self-add.
   */
  addOrRemoveFriend(userId, friendId) {
    if (userId === friendId) {
      throw new UserException("You cannot self-add.");
    }

    const user = this.getUser(userId);
    const friend = this.getUser(friendId);

    const index = user.friends.indexOf(friend);
    if (index !== -1) {
      // Remove friend if already exists
      user.friends.splice(index, 1);
      const friendIndex = friend.friends.indexOf(user);
      if (friendIndex !== -1) {
        friend.friends.splice(friendIndex, 1);
      }
    } else {
      // Add as friend
      user.friends.push(friend);
      friend.friends.push(user);
    }

    return user;
  }
}

function initSteamSystem() {
  const random = Math.random();
  console.log("🚀 ~ initSteamSystem ~ random:", random)

  const games = getAllGamesData(random).sort((a, b) => {
    return b.releaseDate.getTime() - a.releaseDate.getTime();
  });
  console.log("🚀 ~ games ~ games:", games)

  const steam = new SteamSystem(games, allDevelopers, allTags, []);
  console.log("🚀 ~ initSteamSystem ~ steam:", steam)

  allUsers.forEach((user) => steam.addNewUser(user));

  steam.users.forEach((user) => {
    getRandomList(random, steam.games, 40).forEach((game) => {
      steam.purchaseGame(
        user.id,
        new DraftPurchase(game.id, new CardInfo("a", 1234, new Date(), 123))
      );
    });

    getRandomList(random, steam.users, 5).forEach((friend) => {
      if (user.id !== friend.id) {
        steam.addOrRemoveFriend(user.id, friend.id);
      }
    });

    getRandomList(random, user.games, 30).forEach((game) => {
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
