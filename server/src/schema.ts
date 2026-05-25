export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    name: String
    avatar: String
    authProvider: String!
    role: String!
    subscriptionStatus: String!
    isVerified: Boolean!
    createdAt: String!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    icon: String
    color: String!
    createdAt: String!
  }

  type Book {
    id: ID!
    title: String!
    description: String
    coverUrl: String
    epubUrl: String
    categoryId: ID
    price: Float!
    isPremium: Boolean!
    author: String
    publishedAt: String
    createdAt: String!
    category: Category
  }

  type Video {
    id: ID!
    title: String!
    description: String
    thumbnailUrl: String
    videoUrl: String
    categoryId: ID
    price: Float!
    isPremium: Boolean!
    duration: Int!
    relatedBookId: ID
    createdAt: String!
    category: Category
  }

  type ReadingProgress {
    id: ID!
    userId: ID!
    bookId: ID!
    chapterIndex: Int!
    scrollPosition: Float!
    percentComplete: Float!
    updatedAt: String!
  }

  type WatchProgress {
    id: ID!
    userId: ID!
    videoId: ID!
    currentTime: Float!
    percentComplete: Float!
    updatedAt: String!
  }

  type Subscription {
    id: ID!
    userId: ID!
    plan: String!
    status: String!
    amount: Float!
    paystackReference: String
    startDate: String
    endDate: String
    createdAt: String!
  }

  type Payment {
    id: ID!
    userId: ID!
    subscriptionId: ID
    amount: Float!
    status: String!
    paystackReference: String
    createdAt: String!
  }

  type AnalyticsSummary {
    totalUsers: Int!
    totalRevenue: Float!
    activeSubscriptions: Int!
    totalBooks: Int!
    totalVideos: Int!
  }

  type ChartData {
    label: String!
    value: Float!
  }

  type Analytics {
    summary: AnalyticsSummary!
    subscriptionDistribution: [ChartData!]!
    categoryDistribution: [ChartData!]!
    monthlyRevenue: [ChartData!]!
    monthlyUsers: [ChartData!]!
    userGrowth: [ChartData!]!
    revenueGrowth: [ChartData!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type OtpPayload {
    success: Boolean!
    message: String!
  }

  type MutationResponse {
    success: Boolean!
    message: String!
    id: ID
  }

  input BookInput {
    title: String!
    description: String
    coverUrl: String
    epubUrl: String
    categoryId: ID
    price: Float
    isPremium: Boolean
    author: String
    publishedAt: String
  }

  input VideoInput {
    title: String!
    description: String
    thumbnailUrl: String
    videoUrl: String
    categoryId: ID
    price: Float
    isPremium: Boolean
    duration: Int
    relatedBookId: ID
  }

  input CategoryInput {
    name: String!
    slug: String!
    description: String
    icon: String
    color: String
  }

  input ProgressInput {
    bookId: ID
    chapterIndex: Int
    scrollPosition: Float
    percentComplete: Float
    videoId: ID
    currentTime: Float
  }

  type Query {
    me: User
    users: [User!]!
    categories: [Category!]!
    category(id: ID!): Category
    books(categoryId: ID, search: String, isPremium: Boolean): [Book!]!
    book(id: ID!): Book
    videos(categoryId: ID, search: String, isPremium: Boolean): [Video!]!
    video(id: ID!): Video
    myReadingProgress: [ReadingProgress!]!
    myWatchProgress: [WatchProgress!]!
    readingProgress(bookId: ID!): ReadingProgress
    watchProgress(videoId: ID!): WatchProgress
    subscriptions: [Subscription!]!
    mySubscription: Subscription
    payments: [Payment!]!
    myPayments: [Payment!]!
    analytics: Analytics!
  }

  type Mutation {
    register(email: String!, password: String!, name: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    socialLogin(provider: String!, token: String!, name: String, email: String, avatar: String): AuthPayload!
    requestOtp(email: String!, purpose: String): OtpPayload!
    verifyOtpAndRegister(email: String!, otp: String!, password: String!, name: String): AuthPayload!
    verifyOtpAndReset(email: String!, otp: String!, newPassword: String!): MutationResponse!
    updateProfile(name: String, avatar: String): User!
    createBook(input: BookInput!): Book!
    updateBook(id: ID!, input: BookInput!): Book!
    deleteBook(id: ID!): MutationResponse!
    createVideo(input: VideoInput!): Video!
    updateVideo(id: ID!, input: VideoInput!): Video!
    deleteVideo(id: ID!): MutationResponse!
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
    deleteCategory(id: ID!): MutationResponse!
    saveReadingProgress(input: ProgressInput!): ReadingProgress!
    saveWatchProgress(input: ProgressInput!): WatchProgress!
    createSubscription(plan: String!, amount: Float!, paystackReference: String!): Subscription!
    createPayment(amount: Float!, paystackReference: String!, subscriptionId: ID): Payment!
  }
`;
