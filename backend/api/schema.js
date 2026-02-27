const { pgTable, text, timestamp, boolean, integer, json, uuid } = require("drizzle-orm/pg-core");

const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: text("role").default("user"),
    department: text("department"),
    roll: text("roll"),
    isBlocked: boolean("is_blocked").default(false),
    createdAt: timestamp("created_at").defaultNow()
});

const issues = pgTable("issues", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    priority: text("priority").default("medium"),
    status: text("status").default("pending"),
    votesGood: integer("votes_good").default(0),
    votesBad: integer("votes_bad").default(0),
    submittedBy: uuid("submitted_by").references(() => users.id),
    views: integer("views").default(0),
    imageUrl: text("image_url"),
    expectedResolution: timestamp("expected_resolution"),
    assignedTo: uuid("assigned_to").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
});

const issueVotedUsers = pgTable("issue_voted_users", {
    id: uuid("id").defaultRandom().primaryKey(),
    issueId: uuid("issue_id").references(() => issues.id),
    userId: uuid("user_id").references(() => users.id),
    type: text("type").default('good').notNull() // 'good' or 'bad'
});

const issueTimeline = pgTable("issue_timeline", {
    id: uuid("id").defaultRandom().primaryKey(),
    issueId: uuid("issue_id").references(() => issues.id),
    status: text("status"),
    updatedBy: uuid("updated_by").references(() => users.id),
    note: text("note"),
    timestamp: timestamp("timestamp").defaultNow()
});

const auditLogs = pgTable("audit_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: uuid("admin_id").references(() => users.id),
    targetId: text("target_id"),
    targetType: text("target_type"), // 'user', 'issue', 'system'
    action: text("action"), // 'block_user', 'change_status', etc.
    details: text("details"),
    ip: text("ip"),
    timestamp: timestamp("timestamp").defaultNow()
});

const systemConfig = pgTable("system_config", {
    id: uuid("id").defaultRandom().primaryKey(),
    categories: json("categories").default([]),
    priorities: json("priorities").default([]),
    maintenanceMode: boolean("maintenance_mode").default(false),
    allowRegistration: boolean("allow_registration").default(true),
    slaRules: json("sla_rules").default({})
});

const articles = pgTable("articles", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    category: text("category").default("FAQ"),
    tags: json("tags").default([]),
    views: integer("views").default(0),
    helpful: integer("helpful").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
});

const messages = pgTable("messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    from: uuid("from").references(() => users.id),
    to: uuid("to").references(() => users.id), // null for broadcast
    subject: text("subject"),
    message: text("message"),
    read: boolean("read").default(false),
    type: text("type").default("direct"),
    targetGroup: text("target_group"),
    createdAt: timestamp("created_at").defaultNow()
});

const passwordResetTokens = pgTable("password_reset_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    used: boolean("used").default(false),
    createdAt: timestamp("created_at").defaultNow()
});

const comments = pgTable("comments", {
    id: uuid("id").defaultRandom().primaryKey(),
    issueId: uuid("issue_id").references(() => issues.id).notNull(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    text: text("text").notNull(),
    parentId: uuid("parent_id"), // Self-referencing for replies, handled at application level
    createdAt: timestamp("created_at").defaultNow()
});

const pushSubscriptions = pgTable("push_subscriptions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    endpoint: text("endpoint").notNull(),
    keys: json("keys").notNull(), // { p256dh, auth }
    createdAt: timestamp("created_at").defaultNow()
});

module.exports = {
    users,
    issues,
    issueVotedUsers,
    issueTimeline,
    auditLogs,
    systemConfig,
    articles,
    messages,
    passwordResetTokens,
    comments,
    pushSubscriptions
};
