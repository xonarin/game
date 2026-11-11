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

    type DeployTarget {
        id: ID!
        name: String!
        role: String!
        versionUrl: String!
        deployUrl: String
        enabled: Boolean!
    }

    type DeployTargetStatus {
        id: ID!
        name: String!
        role: String!
        enabled: Boolean!
        reachable: Boolean!
        deployedSha: String
        behind: Int
        migrationPending: Boolean!
        sharedChanged: Boolean!
        hasAgent: Boolean!
    }

    type DeployInfo {
        branch: String!
        latestSha: String
        githubConfigured: Boolean!
        targets: [DeployTargetStatus!]!
    }

    type DeployResult {
        ok: Boolean!
        output: String
        error: String
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
        adminMaintenance: Boolean!
        adminDeploy: DeployInfo!
    }

    type Mutation {
        adminAdjustBalance(userId: ID!, amount: Float!, reason: String): AdminUser!
        adminUpdateSetting(name: String!, value: String!): AdminSetting!
        adminAddAuthClient(origin: String!, label: String): AuthClient!
        adminSetAuthClientEnabled(id: ID!, enabled: Boolean!): AuthClient!
        adminRemoveAuthClient(id: ID!): Boolean!
        adminSetMaintenance(on: Boolean!): Boolean!
        adminAddDeployTarget(name: String!, role: String!, versionUrl: String!, deployUrl: String): DeployTarget!
        adminSetDeployTargetEnabled(id: ID!, enabled: Boolean!): DeployTarget!
        adminRemoveDeployTarget(id: ID!): Boolean!
        adminTriggerDeploy(id: ID!): DeployResult!
    }
`;

export default typeDefs;
