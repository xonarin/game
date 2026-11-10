/** Admin panel GraphQL schema (kept as a TS string so the backend runs via babel-node without a .graphql loader). */
const typeDefs = /* GraphQL */ `
    scalar DateTime

    type AdminUser {
        id: ID!
        username: String!
        role: String!
        socialType: String!
        socialId: String!
        money: Float!
        turnover: Float!
        createdAt: DateTime!
    }

    type AdminUsersPage {
        items: [AdminUser!]!
        total: Int!
    }

    type AdminSetting {
        name: String!
        value: String
        description: String
    }

    type AuthClient {
        id: ID!
        origin: String!
        label: String
        enabled: Boolean!
        createdAt: DateTime!
    }

    type DashboardStats {
        usersTotal: Int!
        onlineNow: Int!
        balanceTotal: Float!
        depositsTotal: Float!
        withdrawalsTotal: Float!
        minesGamesTotal: Int!
        classicGamesTotal: Int!
    }

    type Query {
        adminMe: AdminUser!
        adminUsers(search: String, limit: Int, offset: Int): AdminUsersPage!
        adminUser(id: ID!): AdminUser
        adminSettings: [AdminSetting!]!
        adminDashboard: DashboardStats!
        adminAuthClients: [AuthClient!]!
    }

    type Mutation {
        adminAdjustBalance(userId: ID!, amount: Float!, reason: String): AdminUser!
        adminUpdateSetting(name: String!, value: String!): AdminSetting!
        adminAddAuthClient(origin: String!, label: String): AuthClient!
        adminSetAuthClientEnabled(id: ID!, enabled: Boolean!): AuthClient!
        adminRemoveAuthClient(id: ID!): Boolean!
    }
`;

export default typeDefs;
