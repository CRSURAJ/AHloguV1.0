import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-southeast-4";
const USERS_TABLE = process.env.USERS_TABLE;

const dynamo = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: REGION }),
  {
    marshallOptions: {
      removeUndefinedValues: true
    }
  }
);

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,authorization"
    },
    body: JSON.stringify(body)
  };
}

function getRequest(event) {
  return {
    method: event.requestContext?.http?.method || event.httpMethod || "GET",
    path: event.rawPath || event.path || "/"
  };
}

function getClaims(event) {
  return (
    event.requestContext?.authorizer?.jwt?.claims ||
    event.requestContext?.authorizer?.claims ||
    {}
  );
}

async function getMe(event) {
  if (!USERS_TABLE) {
    return json(500, {
      error: "Missing USERS_TABLE environment variable"
    });
  }

  const claims = getClaims(event);
  const sub = claims.sub;
  const email = claims.email;

  if (!sub) {
    return json(401, {
      error: "Missing Cognito user claims. Protect this route with a Cognito authorizer."
    });
  }

  const result = await dynamo.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        id: sub
      }
    })
  );

  if (!result.Item) {
    return json(404, {
      error: "User profile not found in AHloguUsers",
      id: sub,
      email: email || ""
    });
  }

  const user = result.Item;

  if (user.isActive === false) {
    return json(403, {
      error: "User is inactive"
    });
  }

  return json(200, {
    id: user.id,
    email: user.email || email || "",
    fullName: user.fullName || "",
    role: user.role || "",
    isAdmin: Boolean(user.isAdmin),
    isActive: user.isActive !== false
  });
}

export const handler = async (event) => {
  try {
    const { method, path } = getRequest(event);

    if (method === "OPTIONS") {
      return json(204, {});
    }

    if (method === "GET" && path === "/health") {
      return json(200, {
        ok: true,
        service: "AHloguApi",
        time: new Date().toISOString()
      });
    }

    if (method === "GET" && path === "/me") {
      return getMe(event);
    }

    return json(404, {
      error: "Route not found",
      method,
      path
    });
  } catch (error) {
    console.error("AHloguApi error:", error);

    return json(500, {
      error: "Internal server error"
    });
  }
};
