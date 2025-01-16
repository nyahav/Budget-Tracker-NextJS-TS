import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = await createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "RealEstate Tracker API",
        version: "1.0.0",
        description: "API documentation for RealEstate Tracker",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [],
    },
  });
  return spec;
};
