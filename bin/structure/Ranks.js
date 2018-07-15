const ranks = {
    0: "guest",
    1: "user",
    2: "mod",
    3: "admin",
    4: "co_owner",
    5: "owner",

    guest: 0,
    user: 1,
    mod: 2,
    admin: 3,
    co_owner: 4,
    owner: 5,
};

/**
 * Secures rank within bounds
 * @param {Number} rank
 * @returns {Number}
 */
const getRank = (rank) => {
    if (rank <= ranks.guest)
        return ranks.guest;
    else if (rank >= ranks.owner)
        return ranks.owner;
    return rank;
};

/**
 * @param user {User}
 * @param command {Command}
 */
const hasAccess = (user, command) => {
    return user.rank >= command.rank;
};

ranks.getRank = getRank;
ranks.hasAccess = hasAccess;

module.exports = ranks;