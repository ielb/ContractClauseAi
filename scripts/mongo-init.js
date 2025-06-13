// ==============================================
// MongoDB Initialization Script
// ContractClauseAI Database Setup
// ==============================================

// Switch to the contract-clause-ai database
db = db.getSiblingDB("contract-clause-ai");

// Create collections with validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "createdAt"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "must be a valid email and is required",
        },
        password: {
          bsonType: "string",
          minLength: 8,
          description: "must be a string and is required",
        },
        firstName: {
          bsonType: "string",
          description: "must be a string",
        },
        lastName: {
          bsonType: "string",
          description: "must be a string",
        },
        role: {
          bsonType: "string",
          enum: ["user", "admin", "premium"],
          description: "must be one of the enum values",
        },
        isActive: {
          bsonType: "bool",
          description: "must be a boolean",
        },
        createdAt: {
          bsonType: "date",
          description: "must be a date and is required",
        },
        updatedAt: {
          bsonType: "date",
          description: "must be a date",
        },
      },
    },
  },
});

db.createCollection("contracts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "filename", "status", "createdAt"],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "must be an objectId and is required",
        },
        filename: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        originalName: {
          bsonType: "string",
          description: "must be a string",
        },
        fileSize: {
          bsonType: "number",
          description: "must be a number",
        },
        mimeType: {
          bsonType: "string",
          description: "must be a string",
        },
        s3Key: {
          bsonType: "string",
          description: "must be a string",
        },
        content: {
          bsonType: "string",
          description: "extracted text content",
        },
        status: {
          bsonType: "string",
          enum: ["uploaded", "processing", "analyzed", "failed"],
          description: "must be one of the enum values and is required",
        },
        createdAt: {
          bsonType: "date",
          description: "must be a date and is required",
        },
        updatedAt: {
          bsonType: "date",
          description: "must be a date",
        },
      },
    },
  },
});

db.createCollection("analyses", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["contractId", "userId", "createdAt"],
      properties: {
        contractId: {
          bsonType: "objectId",
          description: "must be an objectId and is required",
        },
        userId: {
          bsonType: "objectId",
          description: "must be an objectId and is required",
        },
        results: {
          bsonType: "object",
          description: "analysis results from AI",
        },
        riskScore: {
          bsonType: "number",
          minimum: 0,
          maximum: 10,
          description: "must be a number between 0 and 10",
        },
        clauses: {
          bsonType: "array",
          description: "array of identified clauses",
        },
        recommendations: {
          bsonType: "array",
          description: "array of recommendations",
        },
        processingTime: {
          bsonType: "number",
          description: "processing time in milliseconds",
        },
        createdAt: {
          bsonType: "date",
          description: "must be a date and is required",
        },
      },
    },
  },
});

db.createCollection("audit_logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "action", "timestamp"],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "must be an objectId and is required",
        },
        action: {
          bsonType: "string",
          description: "must be a string and is required",
        },
        resource: {
          bsonType: "string",
          description: "must be a string",
        },
        resourceId: {
          bsonType: "objectId",
          description: "must be an objectId",
        },
        ipAddress: {
          bsonType: "string",
          description: "must be a string",
        },
        userAgent: {
          bsonType: "string",
          description: "must be a string",
        },
        details: {
          bsonType: "object",
          description: "additional details",
        },
        timestamp: {
          bsonType: "date",
          description: "must be a date and is required",
        },
      },
    },
  },
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ isActive: 1 });

db.contracts.createIndex({ userId: 1 });
db.contracts.createIndex({ status: 1 });
db.contracts.createIndex({ createdAt: -1 });
db.contracts.createIndex({ userId: 1, createdAt: -1 });

db.analyses.createIndex({ contractId: 1 });
db.analyses.createIndex({ userId: 1 });
db.analyses.createIndex({ createdAt: -1 });
db.analyses.createIndex({ contractId: 1, createdAt: -1 });

db.audit_logs.createIndex({ userId: 1 });
db.audit_logs.createIndex({ action: 1 });
db.audit_logs.createIndex({ timestamp: -1 });
db.audit_logs.createIndex({ userId: 1, timestamp: -1 });

// Create admin user (for development only)
if (db.users.countDocuments() === 0) {
  db.users.insertOne({
    email: "admin@contractclause.ai",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LehtlUa1vKd7Ewd.2", // "admin123"
    firstName: "System",
    lastName: "Administrator",
    role: "admin",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  print("✅ Admin user created successfully");
  print("📧 Email: admin@contractclause.ai");
  print("🔑 Password: admin123");
}

print("✅ MongoDB initialization completed successfully");
print("📊 Collections created: users, contracts, analyses, audit_logs");
print("🗂️ Indexes created for optimal performance");
print("🔧 Validation rules applied to all collections");
